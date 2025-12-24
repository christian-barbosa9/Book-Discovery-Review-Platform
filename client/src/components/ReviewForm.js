import React, { useState } from 'react';
import './ReviewForm.css';

const ReviewForm = ({ skillId, onReviewSubmitted }) => {
  const [formData, setFormData] = useState({
    reviewerName: '',
    rating: 5,
    comment: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.reviewerName.trim()) {
      newErrors.reviewerName = 'Your name is required';
    } else if (formData.reviewerName.length > 50) {
      newErrors.reviewerName = 'Name cannot exceed 50 characters';
    }

    if (!formData.comment.trim()) {
      newErrors.comment = 'Comment is required';
    } else if (formData.comment.length > 500) {
      newErrors.comment = 'Comment cannot exceed 500 characters';
    }

    if (formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = 'Rating must be between 1 and 5';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const { reviewsAPI } = await import('../services/api');
      const response = await reviewsAPI.create({
        skillId,
        ...formData,
        rating: parseInt(formData.rating)
      });

      if (response.data.success) {
        // Reset form
        setFormData({
          reviewerName: '',
          rating: 5,
          comment: ''
        });
        
        // Notify parent to refresh reviews
        if (onReviewSubmitted) {
          onReviewSubmitted();
        }
      }
    } catch (err) {
      console.error('Error creating review:', err);
      setSubmitError(err.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          className={`star-btn ${i <= formData.rating ? 'filled' : ''}`}
          onClick={() => handleRatingClick(i)}
          disabled={loading}
        >
          ★
        </button>
      );
    }
    return stars;
  };

  return (
    <form onSubmit={handleSubmit} className="review-form">
      <h3 className="review-form-title">Write a Review</h3>
      
      <div className="form-group">
        <label htmlFor="reviewerName" className="form-label">
          Your Name <span className="required">*</span>
        </label>
        <input
          type="text"
          id="reviewerName"
          name="reviewerName"
          value={formData.reviewerName}
          onChange={handleChange}
          className={`form-input ${errors.reviewerName ? 'error' : ''}`}
          placeholder="Enter your name"
          maxLength={50}
        />
        {errors.reviewerName && <span className="error-message">{errors.reviewerName}</span>}
      </div>

      <div className="form-group">
        <label className="form-label">
          Rating <span className="required">*</span>
        </label>
        <div className="rating-input">
          {renderStars()}
          <span className="rating-value">{formData.rating} / 5</span>
        </div>
        {errors.rating && <span className="error-message">{errors.rating}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="comment" className="form-label">
          Your Review <span className="required">*</span>
        </label>
        <textarea
          id="comment"
          name="comment"
          value={formData.comment}
          onChange={handleChange}
          className={`form-textarea ${errors.comment ? 'error' : ''}`}
          placeholder="Share your experience with this skill..."
          rows={4}
          maxLength={500}
        />
        <div className="char-count">
          {formData.comment.length}/500 characters
        </div>
        {errors.comment && <span className="error-message">{errors.comment}</span>}
      </div>

      {submitError && (
        <div className="submit-error">
          {submitError}
        </div>
      )}

      <button
        type="submit"
        className="submit-review-btn"
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};

export default ReviewForm;

