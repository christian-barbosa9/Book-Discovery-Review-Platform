const express = require('express');
const router = express.Router();
const { pool, updateSkillRating } = require('../db');

// Helper function to map database row to API response format
const mapSkillRow = (row) => ({
  _id: row.id.toString(),
  title: row.title,
  description: row.description,
  category: row.category,
  skillType: row.skill_type,
  instructorName: row.instructor_name,
  contactEmail: row.contact_email,
  location: row.location,
  price: parseFloat(row.price) || 0,
  isFree: row.is_free,
  duration: row.duration,
  skillLevel: row.skill_level,
  averageRating: parseFloat(row.average_rating) || 0,
  reviewCount: row.review_count || 0,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

// GET /api/skills - Get all skills with optional filtering and search
router.get('/', async (req, res) => {
  try {
    const {
      category,
      skillType,
      skillLevel,
      search,
      minRating,
      isFree,
      sortBy,
      limit = 50,
      page = 1
    } = req.query;

    // Build WHERE conditions
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (category) {
      conditions.push(`category = $${paramIndex++}`);
      values.push(category);
    }

    if (skillType) {
      conditions.push(`skill_type = $${paramIndex++}`);
      values.push(skillType);
    }

    if (skillLevel && skillLevel !== 'Any') {
      conditions.push(`skill_level = $${paramIndex++}`);
      values.push(skillLevel);
    }

    if (minRating) {
      conditions.push(`average_rating >= $${paramIndex++}`);
      values.push(parseFloat(minRating));
    }

    if (isFree !== undefined) {
      conditions.push(`is_free = $${paramIndex++}`);
      values.push(isFree === 'true');
    }

    // Text search using PostgreSQL full-text search
    if (search) {
      conditions.push(`to_tsvector('english', title || ' ' || description) @@ plainto_tsquery('english', $${paramIndex++})`);
      values.push(search);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Build ORDER BY clause
    let orderBy = 'created_at DESC';
    switch (sortBy) {
      case 'oldest':
        orderBy = 'created_at ASC';
        break;
      case 'rating':
        orderBy = 'average_rating DESC, review_count DESC';
        break;
      case 'reviews':
        orderBy = 'review_count DESC';
        break;
      case 'title':
        orderBy = 'title ASC';
        break;
      default:
        orderBy = 'created_at DESC';
    }

    // If using text search, add relevance to sort
    if (search) {
      orderBy = `ts_rank(to_tsvector('english', title || ' ' || description), plainto_tsquery('english', '${search.replace(/'/g, "''")}')) DESC, ${orderBy}`;
    }

    // Calculate pagination
    const limitNum = parseInt(limit);
    const offset = (parseInt(page) - 1) * limitNum;

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM skills ${whereClause}`;
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    // Get skills
    const query = `
      SELECT * FROM skills 
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    const queryValues = [...values, limitNum, offset];
    const result = await pool.query(query, queryValues);

    const skills = result.rows.map(mapSkillRow);

    res.json({
      success: true,
      data: skills,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching skills',
      error: error.message
    });
  }
});

// POST /api/skills - Create a new skill
router.post('/', async (req, res) => {
  try {
    const skillData = req.body;

    // Validate required fields
    const requiredFields = ['title', 'description', 'category', 'skillType', 'instructorName', 'contactEmail'];
    const missingFields = requiredFields.filter(field => !skillData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missingFields
      });
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(skillData.contactEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Insert new skill
    const query = `
      INSERT INTO skills (
        title, description, category, skill_type, instructor_name, 
        contact_email, location, price, is_free, duration, skill_level
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      skillData.title.substring(0, 100),
      skillData.description.substring(0, 1000),
      skillData.category,
      skillData.skillType,
      skillData.instructorName.substring(0, 50),
      skillData.contactEmail.toLowerCase(),
      skillData.location ? skillData.location.substring(0, 100) : null,
      skillData.isFree ? 0 : (parseFloat(skillData.price) || 0),
      skillData.isFree || false,
      skillData.duration ? skillData.duration.substring(0, 50) : null,
      skillData.skillLevel || 'Any'
    ];

    const result = await pool.query(query, values);
    const skill = mapSkillRow(result.rows[0]);

    res.status(201).json({
      success: true,
      message: 'Skill created successfully',
      data: skill
    });
  } catch (error) {
    console.error('Error creating skill:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating skill',
      error: error.message
    });
  }
});

// GET /api/skills/:id - Get single skill by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid skill ID format'
      });
    }

    const result = await pool.query('SELECT * FROM skills WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    const skill = mapSkillRow(result.rows[0]);

    res.json({
      success: true,
      data: skill
    });
  } catch (error) {
    console.error('Error fetching skill:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching skill',
      error: error.message
    });
  }
});

// PUT /api/skills/:id - Update a skill
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid skill ID format'
      });
    }

    // Check if skill exists
    const checkResult = await pool.query('SELECT id FROM skills WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramIndex = 1;

    const fieldMap = {
      title: 'title',
      description: 'description',
      category: 'category',
      skillType: 'skill_type',
      instructorName: 'instructor_name',
      contactEmail: 'contact_email',
      location: 'location',
      price: 'price',
      isFree: 'is_free',
      duration: 'duration',
      skillLevel: 'skill_level'
    };

    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined && fieldMap[key]) {
        if (key === 'contactEmail' && req.body[key]) {
          updates.push(`${fieldMap[key]} = $${paramIndex++}`);
          values.push(req.body[key].toLowerCase());
        } else if (key === 'price') {
          updates.push(`${fieldMap[key]} = $${paramIndex++}`);
          values.push(parseFloat(req.body[key]) || 0);
        } else {
          updates.push(`${fieldMap[key]} = $${paramIndex++}`);
          values.push(req.body[key]);
        }
      }
    });

    if (updates.length === 0) {
      const result = await pool.query('SELECT * FROM skills WHERE id = $1', [id]);
      return res.json({
        success: true,
        message: 'No changes to update',
        data: mapSkillRow(result.rows[0])
      });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE skills 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    const skill = mapSkillRow(result.rows[0]);

    res.json({
      success: true,
      message: 'Skill updated successfully',
      data: skill
    });
  } catch (error) {
    console.error('Error updating skill:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating skill',
      error: error.message
    });
  }
});

// DELETE /api/skills/:id - Delete a skill
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid skill ID format'
      });
    }

    // Check if skill exists
    const checkResult = await pool.query('SELECT id FROM skills WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    // Delete skill (reviews will be deleted automatically due to CASCADE)
    await pool.query('DELETE FROM skills WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Skill deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting skill:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting skill',
      error: error.message
    });
  }
});

// GET /api/skills/stats/categories - Get skill count by category
router.get('/stats/categories', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        category as _id,
        COUNT(*) as count,
        ROUND(AVG(average_rating)::numeric, 1) as avgRating
      FROM skills
      GROUP BY category
      ORDER BY count DESC
    `);

    const categoryStats = result.rows.map(row => ({
      _id: row._id,
      count: parseInt(row.count),
      avgRating: parseFloat(row.avgrating) || 0
    }));

    res.json({
      success: true,
      data: categoryStats
    });
  } catch (error) {
    console.error('Error fetching category stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category statistics',
      error: error.message
    });
  }
});

// GET /api/skills/stats/overview - Get platform overview statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalResult = await pool.query('SELECT COUNT(*) FROM skills');
    const totalSkills = parseInt(totalResult.rows[0].count);

    const offeringsResult = await pool.query("SELECT COUNT(*) FROM skills WHERE skill_type = 'Offering'");
    const totalOfferings = parseInt(offeringsResult.rows[0].count);

    const seekingsResult = await pool.query("SELECT COUNT(*) FROM skills WHERE skill_type = 'Seeking'");
    const totalSeekings = parseInt(seekingsResult.rows[0].count);

    const freeResult = await pool.query('SELECT COUNT(*) FROM skills WHERE is_free = true');
    const totalFree = parseInt(freeResult.rows[0].count);

    const avgRatingResult = await pool.query('SELECT ROUND(AVG(average_rating)::numeric, 1) as avg FROM skills');
    const averageRating = parseFloat(avgRatingResult.rows[0].avg) || 0;

    const topRatedResult = await pool.query(`
      SELECT title, category, average_rating, review_count
      FROM skills
      ORDER BY average_rating DESC, review_count DESC
      LIMIT 5
    `);

    const topRated = topRatedResult.rows.map(row => ({
      title: row.title,
      category: row.category,
      averageRating: parseFloat(row.average_rating) || 0,
      reviewCount: row.review_count || 0
    }));

    res.json({
      success: true,
      data: {
        totalSkills,
        totalOfferings,
        totalSeekings,
        totalFree,
        averageRating,
        topRated
      }
    });
  } catch (error) {
    console.error('Error fetching overview stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching overview statistics',
      error: error.message
    });
  }
});

module.exports = router;
