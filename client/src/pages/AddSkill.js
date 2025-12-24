import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { skillsAPI } from '../services/api';
import './AddSkill.css';

const AddSkill = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    skillType: 'Offering',
    instructorName: '',
    contactEmail: '',
    location: '',
    price: 0,
    isFree: false,
    duration: '',
    skillLevel: 'Any'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title cannot exceed 100 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 1000) {
      newErrors.description = 'Description cannot exceed 1000 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.instructorName.trim()) {
      newErrors.instructorName = 'Instructor name is required';
    } else if (formData.instructorName.length > 50) {
      newErrors.instructorName = 'Name cannot exceed 50 characters';
    }

    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Contact email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please provide a valid email address';
    }

    if (formData.location && formData.location.length > 100) {
      newErrors.location = 'Location cannot exceed 100 characters';
    }

    if (formData.price < 0) {
      newErrors.price = 'Price cannot be negative';
    }

    if (formData.duration && formData.duration.length > 50) {
      newErrors.duration = 'Duration cannot exceed 50 characters';
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
      // Prepare data for submission
      const submitData = {
        ...formData,
        price: formData.isFree ? 0 : parseFloat(formData.price) || 0
      };

      const response = await skillsAPI.create(submitData);

      if (response.data.success) {
        // Redirect to the new skill's detail page
        navigate(`/skill/${response.data.data._id}`);
      }
    } catch (err) {
      console.error('Error creating skill:', err);
      
      if (err.response?.data?.errors) {
        // Handle validation errors from server
        const serverErrors = {};
        err.response.data.errors.forEach(error => {
          const field = error.path || error.field;
          if (field) {
            serverErrors[field] = error.message;
          }
        });
        setErrors(serverErrors);
      } else {
        setSubmitError(err.response?.data?.message || 'Failed to create skill. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-skill">
      <div className="add-skill-header">
        <h1>Add a Skill</h1>
        <p>Share your expertise or find someone to learn from</p>
      </div>

      <form onSubmit={handleSubmit} className="skill-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Skill Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`form-input ${errors.title ? 'error' : ''}`}
              placeholder="e.g., Guitar Lessons, Web Development"
              maxLength={100}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="category" className="form-label">
              Category <span className="required">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`form-select ${errors.category ? 'error' : ''}`}
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <span className="error-message">{errors.category}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Description <span className="required">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={`form-textarea ${errors.description ? 'error' : ''}`}
            placeholder="Describe the skill, what you'll teach or learn, prerequisites, etc."
            rows={5}
            maxLength={1000}
          />
          <div className="char-count">
            {formData.description.length}/1000 characters
          </div>
          {errors.description && <span className="error-message">{errors.description}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="skillType" className="form-label">
              Type <span className="required">*</span>
            </label>
            <select
              id="skillType"
              name="skillType"
              value={formData.skillType}
              onChange={handleChange}
              className="form-select"
            >
              <option value="Offering">I'm Offering this skill</option>
              <option value="Seeking">I'm Seeking to learn this</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="skillLevel" className="form-label">
              Skill Level
            </label>
            <select
              id="skillLevel"
              name="skillLevel"
              value={formData.skillLevel}
              onChange={handleChange}
              className="form-select"
            >
              {skillLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="instructorName" className="form-label">
              Your Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="instructorName"
              name="instructorName"
              value={formData.instructorName}
              onChange={handleChange}
              className={`form-input ${errors.instructorName ? 'error' : ''}`}
              placeholder="Your full name"
              maxLength={50}
            />
            {errors.instructorName && <span className="error-message">{errors.instructorName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="contactEmail" className="form-label">
              Contact Email <span className="required">*</span>
            </label>
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
              className={`form-input ${errors.contactEmail ? 'error' : ''}`}
              placeholder="your.email@example.com"
            />
            {errors.contactEmail && <span className="error-message">{errors.contactEmail}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="location" className="form-label">
              Location (Optional)
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={`form-input ${errors.location ? 'error' : ''}`}
              placeholder="City, State or Online"
              maxLength={100}
            />
            {errors.location && <span className="error-message">{errors.location}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="duration" className="form-label">
              Duration (Optional)
            </label>
            <input
              type="text"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className={`form-input ${errors.duration ? 'error' : ''}`}
              placeholder="e.g., 1 hour, 4 weeks"
              maxLength={50}
            />
            {errors.duration && <span className="error-message">{errors.duration}</span>}
          </div>
        </div>

        <div className="form-group">
          <label className="form-checkbox-label">
            <input
              type="checkbox"
              name="isFree"
              checked={formData.isFree}
              onChange={handleChange}
              className="form-checkbox"
            />
            <span>This skill is offered for free</span>
          </label>
        </div>

        {!formData.isFree && (
          <div className="form-group">
            <label htmlFor="price" className="form-label">
              Price ($)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className={`form-input ${errors.price ? 'error' : ''}`}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
            {errors.price && <span className="error-message">{errors.price}</span>}
          </div>
        )}

        {submitError && (
          <div className="submit-error">
            {submitError}
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/browse')}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Add Skill'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddSkill;

