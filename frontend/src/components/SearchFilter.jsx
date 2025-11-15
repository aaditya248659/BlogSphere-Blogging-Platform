import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/SearchFilter.css';

const SearchFilter = ({ onFilterChange }) => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [showFeatured, setShowFeatured] = useState(false);

  const popularTags = [
    'JavaScript', 'React', 'Node.js', 'MongoDB', 'Python',
    'Tutorial', 'Guide', 'Tips', 'Best Practices'
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('https://blogsphere-blogging-platform.onrender.com/api/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    applyFilters();
  };

  const applyFilters = () => {
    const filters = {
      search: searchTerm,
      category: selectedCategory,
      tag: selectedTag,
      featured: showFeatured
    };
    onFilterChange(filters);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedTag('');
    setShowFeatured(false);
    onFilterChange({});
  };

  return (
    <div className="search-filter-container">
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">
            🔍
          </button>
        </div>
      </form>

      <div className="filter-section">
        <div className="filter-group">
          <label>Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setTimeout(() => applyFilters(), 0);
            }}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Tag</label>
          <select
            value={selectedTag}
            onChange={(e) => {
              setSelectedTag(e.target.value);
              setTimeout(() => applyFilters(), 0);
            }}
            className="filter-select"
          >
            <option value="">All Tags</option>
            {popularTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showFeatured}
              onChange={(e) => {
                setShowFeatured(e.target.checked);
                setTimeout(() => applyFilters(), 0);
              }}
            />
            Featured Only
          </label>
        </div>

        <button onClick={clearFilters} className="clear-filters-btn">
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default SearchFilter;
