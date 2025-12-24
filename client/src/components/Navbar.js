import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🎓</span>
          Skill Exchange
        </Link>
        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link to="/" className="navbar-link">
              Browse Skills
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/add-skill" className="navbar-link">
              Add Skill
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/stats" className="navbar-link">
              Statistics
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

