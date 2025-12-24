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

