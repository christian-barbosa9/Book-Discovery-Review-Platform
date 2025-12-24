import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <div className="home-hero">
        <h1 className="home-title">Community Skill Exchange</h1>
        <p className="home-subtitle">
          Share your skills or learn something new from your community
        </p>
        <div className="home-cta">
          <Link to="/browse" className="cta-button primary">
            Browse Skills
          </Link>
          <Link to="/add-skill" className="cta-button secondary">
            Add Your Skill
          </Link>
        </div>
      </div>
      <div className="home-content">
        <div className="home-features">
          <div className="feature-card">
            <div className="feature-icon">🎓</div>
            <h3>Learn New Skills</h3>
            <p>Discover skills offered by community members and expand your knowledge</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤝</div>
            <h3>Share Your Expertise</h3>
            <p>Offer your skills to others and help build a stronger community</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <h3>Rate & Review</h3>
            <p>Share your experience and help others find the best learning opportunities</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

