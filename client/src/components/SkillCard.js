import React from 'react';
import { Link } from 'react-router-dom';
import './SkillCard.css';

const SkillCard = ({ skill }) => {
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

  return (
    <Link to={`/skill/${skill._id}`} className="skill-card">
      <div className="skill-card-header">
        <h3 className="skill-card-title">{skill.title}</h3>
        <span className={`skill-type-badge ${skill.skillType.toLowerCase()}`}>
          {skill.skillType}
        </span>
      </div>
      <p className="skill-card-category">{skill.category}</p>
      <p className="skill-card-description">
        {skill.description.length > 150
          ? `${skill.description.substring(0, 150)}...`
          : skill.description}
      </p>
      <div className="skill-card-footer">
        <div className="skill-card-rating">
          <div className="stars">{renderStars(skill.averageRating)}</div>
          <span className="rating-text">
            {skill.averageRating > 0 ? skill.averageRating.toFixed(1) : 'No ratings'}
            {skill.reviewCount > 0 && ` (${skill.reviewCount})`}
          </span>
        </div>
        <div className="skill-card-meta">
          <span className="skill-instructor">By {skill.instructorName}</span>
          {skill.isFree ? (
            <span className="skill-price free">Free</span>
          ) : (
            <span className="skill-price">${skill.price || 0}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default SkillCard;

