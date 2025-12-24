import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Community Skill Exchange</h3>
            <p>Connecting people through knowledge sharing and skill development.</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/browse">Browse Skills</Link></li>
              <li><Link to="/add-skill">Add Skill</Link></li>
              <li><Link to="/stats">Statistics</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>About</h4>
            <p>A platform for sharing and learning skills within your community.</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Community Skill Exchange. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

