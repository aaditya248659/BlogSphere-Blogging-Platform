import { useState, useEffect } from 'react';
import { Row, Col, Spinner, Alert, Pagination } from 'react-bootstrap';
import PostCard from '../components/PostCard';
import TrendingPosts from '../components/TrendingPosts';
import SearchFilter from '../components/SearchFilter';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({});
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchPosts(currentPage, filters);
  }, [currentPage, filters]);

  const fetchPosts = async (page, filterParams) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '9'
      });

      if (filterParams.search) params.append('search', filterParams.search);
      if (filterParams.category) params.append('category', filterParams.category);
      if (filterParams.tag) params.append('tag', filterParams.tag);
      if (filterParams.featured) params.append('featured', 'true');

      const response = await axios.get(`/api/posts?${params.toString()}`);
      setPosts(response.data.data);
      setTotalPages(response.data.pages);
    } catch (error) {
      setError('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <div>
      <div className="text-center mb-4">
        <h1>Welcome to BlogSphere</h1>
        <p className="text-muted">Discover and share amazing stories</p>
      </div>

      <Row>
        {/* Trending Posts Sidebar */}
        <Col lg={3} className="mb-4">
          <TrendingPosts />
        </Col>

        {/* Main Content */}
        <Col lg={9}>
          {/* Search and Filter */}
          <SearchFilter onFilterChange={handleFilterChange} />

          {loading ? (
            <div className="text-center mt-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : posts.length === 0 ? (
            <Alert variant="info" className="text-center">
              No posts found. Try adjusting your filters!
            </Alert>
          ) : (
            <>
              <Row>
                {posts.map((post) => (
                  <Col key={post._id} md={6} lg={4} className="mb-4">
                    <PostCard post={post} />
                  </Col>
                ))}
              </Row>

              {totalPages > 1 && (
                <div className="pagination-container">
                  <Pagination>
                    <Pagination.First 
                      onClick={() => handlePageChange(1)} 
                      disabled={currentPage === 1}
                    />
                    <Pagination.Prev 
                      onClick={() => handlePageChange(currentPage - 1)} 
                      disabled={currentPage === 1}
                    />
                    
                    {[...Array(totalPages)].map((_, index) => (
                      <Pagination.Item
                        key={index + 1}
                        active={index + 1 === currentPage}
                        onClick={() => handlePageChange(index + 1)}
                      >
                        {index + 1}
                      </Pagination.Item>
                    ))}

                    <Pagination.Next 
                      onClick={() => handlePageChange(currentPage + 1)} 
                      disabled={currentPage === totalPages}
                    />
                    <Pagination.Last 
                      onClick={() => handlePageChange(totalPages)} 
                      disabled={currentPage === totalPages}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default Home;