import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { skillsAPI, reviewsAPI } from '../services/api';
import ReviewCard from '../components/ReviewCard';
import ReviewForm from '../components/ReviewForm';
import './SkillDetail.css';

const SkillDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [skill, setSkill] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    fetchSkill();
    fetchReviews();
  }, [id]);

  const fetchSkill = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await skillsAPI.getById(id);
      
      if (response.data.success) {
        setSkill(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching skill:', err);
      setError(err.response?.data?.message || 'Failed to load skill. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const response = await reviewsAPI.getBySkillId(id, { sortBy: 'newest' });
      
      if (response.data.success) {
        setReviews(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleReviewSubmitted = () => {
    fetchReviews();
    fetchSkill(); // Refresh to update rating
  };

  const handleDeleteSkill = async () => {
    if (!window.confirm('Are you sure you want to delete this skill? This action cannot be undone.')) {
      return;
    }

    try {
      await skillsAPI.delete(id);
      navigate('/browse');
    } catch (err) {
      console.error('Error deleting skill:', err);
      alert('Failed to delete skill. Please try again.');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star filled">★</span>);
    }
    if (hasHalfStar && fullStars < 5) {
      stars.push(<span key="half" className="star half">★</span>);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<span key={i} className="star">★</span>);
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="skill-detail">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading skill details...</p>
        </div>
      </div>
    );
  }

  if (error || !skill) {
    return (
      <div className="skill-detail">
        <div className="error-container">
          <p className="error-message">{error || 'Skill not found'}</p>
          <button onClick={() => navigate('/browse')} className="retry-btn">
            Back to Browse
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="skill-detail">
      <button onClick={() => navigate('/browse')} className="back-button">
        ← Back to Browse
      </button>

      <div className="skill-detail-header">
        <div className="skill-title-section">
          <h1>{skill.title}</h1>
          <div className="skill-meta">
            <span className={`skill-type-badge ${skill.skillType.toLowerCase()}`}>
              {skill.skillType}
            </span>
            <span className="skill-category">{skill.category}</span>
          </div>
        </div>
        <div className="skill-rating-section">
          <div className="skill-rating">
            <div className="stars-large">{renderStars(skill.averageRating)}</div>
            <div className="rating-info">
              <span className="rating-value">{skill.averageRating > 0 ? skill.averageRating.toFixed(1) : 'No ratings'}</span>
              <span className="rating-count">({skill.reviewCount} {skill.reviewCount === 1 ? 'review' : 'reviews'})</span>
            </div>
          </div>
        </div>
      </div>

      <div className="skill-detail-content">
        <div className="skill-main-info">
          <div className="skill-section">
            <h2>Description</h2>
            <p className="skill-description">{skill.description}</p>
          </div>

          <div className="skill-details-grid">
            <div className="detail-item">
              <span className="detail-label">Instructor:</span>
              <span className="detail-value">{skill.instructorName}</span>
            </div>
            {skill.location && (
              <div className="detail-item">
                <span className="detail-label">Location:</span>
                <span className="detail-value">{skill.location}</span>
              </div>
            )}
            {skill.duration && (
              <div className="detail-item">
                <span className="detail-label">Duration:</span>
                <span className="detail-value">{skill.duration}</span>
              </div>
            )}
            <div className="detail-item">
              <span className="detail-label">Skill Level:</span>
              <span className="detail-value">{skill.skillLevel}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Price:</span>
              <span className="detail-value price">
                {skill.isFree ? 'Free' : `$${skill.price || 0}`}
              </span>
            </div>
            {skill.contactEmail && (
              <div className="detail-item">
                <span className="detail-label">Contact:</span>
                <span className="detail-value">
                  <a href={`mailto:${skill.contactEmail}`}>{skill.contactEmail}</a>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="reviews-section">
        <h2>Reviews ({skill.reviewCount})</h2>
        
        <ReviewForm skillId={id} onReviewSubmitted={handleReviewSubmitted} />

        {reviewsLoading ? (
          <div className="loading-container">
            <p>Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="no-reviews">
            <p>No reviews yet. Be the first to review this skill!</p>
          </div>
        ) : (
          <div className="reviews-list">
            {reviews.map((review) => (
              <ReviewCard key={review._id} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillDetail;

