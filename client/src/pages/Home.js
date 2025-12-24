import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <div className="home-hero">
        <h1 className="home-title">Community Skill Exchange</h1>
        <p className="home-subtitle">
          Share your skills or learn something new from your community
        </p>
      </div>
      <div className="home-content">
        <p>Browse skills, add your own, or find someone to learn from!</p>
      </div>
    </div>
  );
};

export default Home;

