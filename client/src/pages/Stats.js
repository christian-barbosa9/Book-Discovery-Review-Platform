import React, { useState, useEffect } from 'react';
import { skillsAPI } from '../services/api';
import './Stats.css';

const Stats = () => {
  const [overview, setOverview] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const [overviewRes, categoryRes] = await Promise.all([
        skillsAPI.getOverviewStats(),
        skillsAPI.getCategoryStats()
      ]);

      if (overviewRes.data.success) {
        setOverview(overviewRes.data.data);
      }

      if (categoryRes.data.success) {
        setCategoryStats(categoryRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err.response?.data?.message || 'Failed to load statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="stats">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stats">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={fetchStats} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="stats">
      <div className="stats-header">
        <h1>Platform Statistics</h1>
        <p>Insights into our community skill exchange</p>
      </div>

      {overview && (
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <h3>{overview.totalSkills}</h3>
              <p>Total Skills</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🎓</div>
            <div className="stat-content">
              <h3>{overview.totalOfferings}</h3>
              <p>Skills Offered</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🔍</div>
            <div className="stat-content">
              <h3>{overview.totalSeekings}</h3>
              <p>Skills Sought</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🆓</div>
            <div className="stat-content">
              <h3>{overview.totalFree}</h3>
              <p>Free Skills</p>
            </div>
          </div>

          <div className="stat-card highlight">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <h3>{overview.averageRating > 0 ? overview.averageRating.toFixed(1) : 'N/A'}</h3>
              <p>Average Rating</p>
            </div>
          </div>
        </div>
      )}

      {categoryStats.length > 0 && (
        <div className="category-stats-section">
          <h2>Skills by Category</h2>
          <div className="category-stats-grid">
            {categoryStats.map((stat) => (
              <div key={stat._id} className="category-stat-card">
                <h3>{stat._id}</h3>
                <div className="category-stat-details">
                  <span className="category-count">{stat.count} skills</span>
                  {stat.avgRating > 0 && (
                    <span className="category-rating">
                      ⭐ {stat.avgRating.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {overview && overview.topRated && overview.topRated.length > 0 && (
        <div className="top-rated-section">
          <h2>Top Rated Skills</h2>
          <div className="top-rated-list">
            {overview.topRated.map((skill, index) => (
              <div key={skill._id} className="top-rated-item">
                <span className="rank">#{index + 1}</span>
                <div className="top-rated-content">
                  <h4>{skill.title}</h4>
                  <div className="top-rated-meta">
                    <span className="top-rated-category">{skill.category}</span>
                    <span className="top-rated-rating">
                      ⭐ {skill.averageRating.toFixed(1)} ({skill.reviewCount} reviews)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Stats;

