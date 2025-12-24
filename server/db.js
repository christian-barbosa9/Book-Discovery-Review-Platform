const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URI,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
});

// Initialize database tables
const initializeDB = async () => {
  try {
    // Create skills table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS skills (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        skill_type VARCHAR(20) NOT NULL CHECK (skill_type IN ('Offering', 'Seeking')),
        instructor_name VARCHAR(50) NOT NULL,
        contact_email VARCHAR(100) NOT NULL,
        location VARCHAR(100),
        price DECIMAL(10, 2) DEFAULT 0 CHECK (price >= 0),
        is_free BOOLEAN DEFAULT false,
        duration VARCHAR(50),
        skill_level VARCHAR(20) DEFAULT 'Any' CHECK (skill_level IN ('Beginner', 'Intermediate', 'Advanced', 'Any')),
        average_rating DECIMAL(3, 1) DEFAULT 0 CHECK (average_rating >= 0 AND average_rating <= 5),
        review_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create reviews table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
        reviewer_name VARCHAR(50) NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
      CREATE INDEX IF NOT EXISTS idx_skills_skill_type ON skills(skill_type);
      CREATE INDEX IF NOT EXISTS idx_skills_skill_level ON skills(skill_level);
      CREATE INDEX IF NOT EXISTS idx_reviews_skill_id ON reviews(skill_id);
      CREATE INDEX IF NOT EXISTS idx_skills_text_search ON skills USING gin(to_tsvector('english', title || ' ' || description));
    `);

    console.log('📊 Database tables initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// Function to update skill ratings when reviews change
const updateSkillRating = async (skillId) => {
  try {
    const result = await pool.query(`
      UPDATE skills
      SET 
        average_rating = COALESCE((
          SELECT ROUND(AVG(rating)::numeric, 1)
          FROM reviews
          WHERE skill_id = $1
        ), 0),
        review_count = (
          SELECT COUNT(*)
          FROM reviews
          WHERE skill_id = $1
        )
      WHERE id = $1
      RETURNING average_rating, review_count
    `, [skillId]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error updating skill rating:', error);
    throw error;
  }
};

module.exports = {
  pool,
  initializeDB,
  updateSkillRating
};

