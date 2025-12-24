import React from 'react';
import { useParams } from 'react-router-dom';
import './SkillDetail.css';

const SkillDetail = () => {
  const { id } = useParams();

  return (
    <div className="skill-detail">
      <h1>Skill Details</h1>
      <p>Skill ID: {id}</p>
      <p>Detail view will be implemented here...</p>
    </div>
  );
};

export default SkillDetail;

