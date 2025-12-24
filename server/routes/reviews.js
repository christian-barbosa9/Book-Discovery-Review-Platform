const express = require('express');
const router = express.Router();
const { pool, updateSkillRating } = require('../db');

// Helper function to map database row to API response format
const mapReviewRow = (row) => ({
  _id: row.id.toString(),
  skillId: row.skill_id.toString(),
  reviewerName: row.reviewer_name,
  rating: row.rating,
  comment: row.comment,
  createdAt: row.created_at
});

// POST /api/reviews - Create a new review
router.post('/', async (req, res) => {
  try {
    const { skillId, reviewerName, rating, comment } = req.body;

    // Validate required fields
    if (!skillId || !reviewerName || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: skillId, reviewerName, rating, and comment are required'
      });
    }

    const skillIdNum = parseInt(skillId);
    if (isNaN(skillIdNum)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid skill ID format'
      });
    }

    // Check if skill exists
    const skillCheck = await pool.query('SELECT id FROM skills WHERE id = $1', [skillIdNum]);
    if (skillCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    // Validate rating range
    const ratingNum = parseInt(rating);
    if (ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Create new review
    const query = `
      INSERT INTO reviews (skill_id, reviewer_name, rating, comment)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [
      skillIdNum,
      reviewerName.substring(0, 50),
      ratingNum,
      comment.substring(0, 500)
    ];

    const result = await pool.query(query, values);
    const review = mapReviewRow(result.rows[0]);

    // Update skill rating
    const updatedSkill = await updateSkillRating(skillIdNum);

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review,
      skill: {
        averageRating: parseFloat(updatedSkill.average_rating) || 0,
        reviewCount: updatedSkill.review_count || 0
      }
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating review',
      error: error.message
    });
  }
});

// GET /api/reviews/skill/:skillId - Get all reviews for a specific skill
router.get('/skill/:skillId', async (req, res) => {
  try {
    const skillId = parseInt(req.params.skillId);
    
    if (isNaN(skillId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid skill ID format'
      });
    }

    // Check if skill exists
    const skillCheck = await pool.query('SELECT id FROM skills WHERE id = $1', [skillId]);
    if (skillCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    const { sortBy = 'newest', limit = 50 } = req.query;

    // Build ORDER BY clause
    let orderBy = 'created_at DESC';
    switch (sortBy) {
      case 'oldest':
        orderBy = 'created_at ASC';
        break;
      case 'rating-high':
        orderBy = 'rating DESC, created_at DESC';
        break;
      case 'rating-low':
        orderBy = 'rating ASC, created_at DESC';
        break;
      default:
        orderBy = 'created_at DESC';
    }

    const query = `
      SELECT * FROM reviews
      WHERE skill_id = $1
      ORDER BY ${orderBy}
      LIMIT $2
    `;

    const result = await pool.query(query, [skillId, parseInt(limit)]);
    const reviews = result.rows.map(mapReviewRow);

    res.json({
      success: true,
      data: reviews,
      count: reviews.length
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
});

// DELETE /api/reviews/:id - Delete a review
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID format'
      });
    }

    // Get review to find skill_id before deleting
    const reviewResult = await pool.query('SELECT skill_id FROM reviews WHERE id = $1', [id]);
    
    if (reviewResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const skillId = reviewResult.rows[0].skill_id;

    // Delete the review
    await pool.query('DELETE FROM reviews WHERE id = $1', [id]);

    // Update skill rating
    const updatedSkill = await updateSkillRating(skillId);

    res.json({
      success: true,
      message: 'Review deleted successfully',
      skill: {
        averageRating: parseFloat(updatedSkill.average_rating) || 0,
        reviewCount: updatedSkill.review_count || 0
      }
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting review',
      error: error.message
    });
  }
});

module.exports = router;
