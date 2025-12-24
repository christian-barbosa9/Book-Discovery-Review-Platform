const express = require('express');
const router = express.Router();
const Skill = require('../models/Skill');

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

    // Build query object
    const query = {};

    if (category) {
      query.category = category;
    }

    if (skillType) {
      query.skillType = skillType;
    }

    if (skillLevel && skillLevel !== 'Any') {
      query.skillLevel = skillLevel;
    }

    if (minRating) {
      query.averageRating = { $gte: parseFloat(minRating) };
    }

    if (isFree !== undefined) {
      query.isFree = isFree === 'true';
    }

    // Text search on title and description
    if (search) {
      query.$text = { $search: search };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Build sort object
    let sort = {};
    switch (sortBy) {
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'rating':
        sort = { averageRating: -1 };
        break;
      case 'reviews':
        sort = { reviewCount: -1 };
        break;
      case 'title':
        sort = { title: 1 };
        break;
      default:
        sort = { createdAt: -1 }; // Default to newest
    }

    // If using text search, add text score to sort
    if (search) {
      sort = { score: { $meta: 'textScore' }, ...sort };
    }

    // Execute query
    const skills = await Skill.find(query)
      .sort(sort)
      .limit(limitNum)
      .skip(skip)
      .select('-__v');

    // Get total count for pagination
    const total = await Skill.countDocuments(query);

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

    // Create new skill
    const skill = new Skill(skillData);
    const savedSkill = await skill.save();

    res.status(201).json({
      success: true,
      message: 'Skill created successfully',
      data: savedSkill
    });
  } catch (error) {
    console.error('Error creating skill:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

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
    const skill = await Skill.findById(req.params.id).select('-__v');

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    res.json({
      success: true,
      data: skill
    });
  } catch (error) {
    console.error('Error fetching skill:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid skill ID format'
      });
    }

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
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    // Update skill fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        skill[key] = req.body[key];
      }
    });

    const updatedSkill = await skill.save();

    res.json({
      success: true,
      message: 'Skill updated successfully',
      data: updatedSkill
    });
  } catch (error) {
    console.error('Error updating skill:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid skill ID format'
      });
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

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
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    // Delete associated reviews (they will be handled by the Review model's middleware)
    const Review = require('../models/Review');
    await Review.deleteMany({ skillId: req.params.id });

    // Delete the skill
    await Skill.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Skill deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting skill:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid skill ID format'
      });
    }

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
    const categoryStats = await Skill.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgRating: { $avg: '$averageRating' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

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
    const totalSkills = await Skill.countDocuments();
    const totalOfferings = await Skill.countDocuments({ skillType: 'Offering' });
    const totalSeekings = await Skill.countDocuments({ skillType: 'Seeking' });
    const totalFree = await Skill.countDocuments({ isFree: true });
    
    const avgRating = await Skill.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$averageRating' }
        }
      }
    ]);

    const topRated = await Skill.find()
      .sort({ averageRating: -1, reviewCount: -1 })
      .limit(5)
      .select('title category averageRating reviewCount');

    res.json({
      success: true,
      data: {
        totalSkills,
        totalOfferings,
        totalSeekings,
        totalFree,
        averageRating: avgRating[0]?.avgRating || 0,
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

