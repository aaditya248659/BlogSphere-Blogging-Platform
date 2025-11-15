import { useState, useEffect } from 'react';
import { Card, ListGroup, Badge, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from '../api/axios';

const TrendingPosts = () => {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    try {
      const response = await axios.get('/posts/trending?limit=5');
      setTrending(response.data.data);
    } catch (error) {
      console.error('Error fetching trending posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <Card.Header>
          <h5 className="mb-0">🔥 Trending Posts</h5>
        </Card.Header>
        <Card.Body className="text-center">
          <Spinner animation="border" size="sm" />
        </Card.Body>
      </Card>
    );
  }

  if (trending.length === 0) {
    return (
      <Card>
        <Card.Header>
          <h5 className="mb-0">🔥 Trending Posts</h5>
        </Card.Header>
        <Card.Body>
          <p className="text-muted text-center mb-0">No trending posts yet</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">🔥 Trending Posts</h5>
      </Card.Header>
      <ListGroup variant="flush">
        {trending.map((post, index) => (
          <ListGroup.Item key={post._id} className="d-flex align-items-start">
            <span className="badge bg-primary rounded-pill me-3 mt-1" style={{ minWidth: '30px' }}>
              #{index + 1}
            </span>
            <div className="flex-grow-1">
              <Link 
                to={`/post/${post._id}`} 
                className="text-decoration-none"
                style={{ color: 'inherit' }}
              >
                <h6 className="mb-1">{post.title}</h6>
              </Link>
              <small className="text-muted">
                By {post.authorId?.username || 'Unknown'}
                {post.views > 0 && (
                  <Badge bg="info" className="ms-2">
                    👁 {post.views} views
                  </Badge>
                )}
                {post.isTrending && (
                  <Badge bg="danger" className="ms-2">
                    🔥 Trending
                  </Badge>
                )}
              </small>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Card>
  );
};

export default TrendingPosts;
