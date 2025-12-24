import React from 'react';
import './FilterBar.css';

const FilterBar = ({ filters, onFilterChange, onSearchChange, searchQuery }) => {
  const categories = [
    'Technology',
    'Arts & Crafts',
    'Music',
    'Sports & Fitness',
    'Cooking',
    'Languages',
    'Business',
    'Education',
    'Photography',
    'Writing',
    'Other'
  ];

  const skillLevels = ['Any', 'Beginner', 'Intermediate', 'Advanced'];

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'reviews', label: 'Most Reviewed' },
    { value: 'title', label: 'Title A-Z' }
  ];

  return (
    <div className="filter-bar">
      <div className="filter-section">
        <label htmlFor="search" className="filter-label">Search</label>
        <input
          type="text"
          id="search"
          className="filter-input"
          placeholder="Search skills..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="filter-section">
        <label htmlFor="category" className="filter-label">Category</label>
        <select
          id="category"
          className="filter-select"
          value={filters.category || ''}
          onChange={(e) => onFilterChange('category', e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-section">
        <label htmlFor="skillType" className="filter-label">Type</label>
        <select
          id="skillType"
          className="filter-select"
          value={filters.skillType || ''}
          onChange={(e) => onFilterChange('skillType', e.target.value)}
        >
          <option value="">All Types</option>
          <option value="Offering">Offering</option>
          <option value="Seeking">Seeking</option>
        </select>
      </div>

      <div className="filter-section">
        <label htmlFor="skillLevel" className="filter-label">Level</label>
        <select
          id="skillLevel"
          className="filter-select"
          value={filters.skillLevel || ''}
          onChange={(e) => onFilterChange('skillLevel', e.target.value)}
        >
          {skillLevels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-section">
        <label htmlFor="isFree" className="filter-label">Price</label>
        <select
          id="isFree"
          className="filter-select"
          value={filters.isFree !== undefined ? filters.isFree.toString() : ''}
          onChange={(e) => onFilterChange('isFree', e.target.value === '' ? undefined : e.target.value === 'true')}
        >
          <option value="">All</option>
          <option value="true">Free Only</option>
          <option value="false">Paid Only</option>
        </select>
      </div>

      <div className="filter-section">
        <label htmlFor="sortBy" className="filter-label">Sort By</label>
        <select
          id="sortBy"
          className="filter-select"
          value={filters.sortBy || 'newest'}
          onChange={(e) => onFilterChange('sortBy', e.target.value)}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <button
        className="filter-clear-btn"
        onClick={() => {
          onSearchChange('');
          onFilterChange('clear', null);
        }}
      >
        Clear Filters
      </button>
    </div>
  );
};

export default FilterBar;

