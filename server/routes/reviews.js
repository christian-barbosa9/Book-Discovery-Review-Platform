const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Skill = require('../models/Skill');

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

    // Check if skill exists
    const skill = await Skill.findById(skillId);
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Create new review
    const review = new Review({
      skillId,
      reviewerName,
      rating,
      comment
    });

    const savedReview = await review.save();

    // The review model's middleware will automatically update the skill's rating
    // But we need to fetch the updated skill to return it
    const updatedSkill = await Skill.findById(skillId);

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: savedReview,
      skill: {
        averageRating: updatedSkill.averageRating,
        reviewCount: updatedSkill.reviewCount
      }
    });
  } catch (error) {
    console.error('Error creating review:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid skill ID format'
      });
    }

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
    const { skillId } = req.params;
    const { sortBy = 'newest', limit = 50 } = req.query;

    // Check if skill exists
    const skill = await Skill.findById(skillId);
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    // Build sort object
    let sort = {};
    switch (sortBy) {
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'rating-high':
        sort = { rating: -1, createdAt: -1 };
        break;
      case 'rating-low':
        sort = { rating: 1, createdAt: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    const reviews = await Review.find({ skillId })
      .sort(sort)
      .limit(parseInt(limit))
      .select('-__v');

    res.json({
      success: true,
      data: reviews,
      count: reviews.length
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid skill ID format'
      });
    }

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
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const skillId = review.skillId;

    // Delete the review (middleware will update skill ratings)
    await Review.findByIdAndDelete(req.params.id);

    // Fetch updated skill to return new stats
    const updatedSkill = await Skill.findById(skillId);

    res.json({
      success: true,
      message: 'Review deleted successfully',
      skill: {
        averageRating: updatedSkill.averageRating,
        reviewCount: updatedSkill.reviewCount
      }
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error deleting review',
      error: error.message
    });
  }
});

module.exports = router;
