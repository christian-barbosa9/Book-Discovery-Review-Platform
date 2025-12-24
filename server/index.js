const express = require('express');
const cors = require('cors');
const { initializeDB } = require('./db');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database connection and tables
initializeDB();

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// API Routes
const skillsRoutes = require('./routes/skills');
const reviewsRoutes = require('./routes/reviews');
app.use('/api/skills', skillsRoutes);
app.use('/api/reviews', reviewsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

