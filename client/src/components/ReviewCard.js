import React from 'react';
import './ReviewCard.css';

const ReviewCard = ({ review }) => {
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<span key={i} className="star filled">★</span>);
      } else {
        stars.push(<span key={i} className="star">★</span>);
      }
    }
    return stars;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="review-card">
      <div className="review-header">
        <div className="review-author">
          <span className="review-author-name">{review.reviewerName}</span>
          <div className="review-stars">{renderStars(review.rating)}</div>
        </div>
        <span className="review-date">{formatDate(review.createdAt)}</span>
      </div>
      <p className="review-comment">{review.comment}</p>
    </div>
  );
};

export default ReviewCard;

