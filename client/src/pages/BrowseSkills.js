import React, { useState, useEffect } from 'react';
import { skillsAPI } from '../services/api';
import SkillCard from '../components/SkillCard';
import FilterBar from '../components/FilterBar';
import './BrowseSkills.css';

const BrowseSkills = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    skillType: '',
    skillLevel: 'Any',
    isFree: undefined,
    sortBy: 'newest'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchSkills();
  }, [filters, searchQuery, pagination.page]);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        ...filters,
        search: searchQuery || undefined,
        page: pagination.page,
        limit: pagination.limit
      };

      // Remove undefined values
      Object.keys(params).forEach(key => {
        if (params[key] === undefined || params[key] === '') {
          delete params[key];
        }
      });

      const response = await skillsAPI.getAll(params);
      
      if (response.data.success) {
        setSkills(response.data.data);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          pages: response.data.pagination.pages
        }));
      }
    } catch (err) {
      console.error('Error fetching skills:', err);
      setError(err.response?.data?.message || 'Failed to fetch skills. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    if (key === 'clear') {
      setFilters({
        category: '',
        skillType: '',
        skillLevel: 'Any',
        isFree: undefined,
        sortBy: 'newest'
      });
      setPagination(prev => ({ ...prev, page: 1 }));
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
      setPagination(prev => ({ ...prev, page: 1 }));
    }
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="browse-skills">
      <div className="browse-skills-header">
        <h1>Browse Skills</h1>
        <p className="browse-skills-subtitle">
          Discover skills offered by your community or find someone to learn from
        </p>
      </div>

      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        searchQuery={searchQuery}
      />

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading skills...</p>
        </div>
      )}

      {error && (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={fetchSkills} className="retry-btn">
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {skills.length === 0 ? (
            <div className="no-results">
              <p>No skills found matching your criteria.</p>
              <p>Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <>
              <div className="results-info">
                <p>
                  Showing {skills.length} of {pagination.total} skills
                </p>
              </div>
              <div className="skills-grid">
                {skills.map((skill) => (
                  <SkillCard key={skill._id} skill={skill} />
                ))}
              </div>

              {pagination.pages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </button>
                  <span className="pagination-info">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default BrowseSkills;

