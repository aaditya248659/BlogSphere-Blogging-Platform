import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Badge, Card, Spinner, Alert } from 'react-bootstrap';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/');
      return;
    }
    fetchPostStats();
  }, [isAuthenticated, isAdmin, navigate]);

  const fetchPostStats = async () => {
    try {
      const response = await axios.get('/posts/admin/stats');
      setPosts(response.data.data);
    } catch (error) {
      setError('Failed to fetch post statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTrending = async (postId) => {
    try {
      await axios.put(`/posts/${postId}/trending`);
      // Refresh the list
      fetchPostStats();
    } catch (error) {
      alert('Failed to toggle trending status');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div>
      <Card className="mb-4">
        <Card.Header>
          <h3 className="mb-0">📊 Admin Dashboard - Post Analytics</h3>
        </Card.Header>
        <Card.Body>
          <p className="text-muted">
            Manage trending posts based on view counts. Posts marked as trending will appear in the trending section.
          </p>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Views</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post, index) => (
                  <tr key={post._id}>
                    <td>{index + 1}</td>
                    <td>
                      <a 
                        href={`/post/${post._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-decoration-none"
                      >
                        {post.title}
                      </a>
                    </td>
                    <td>{post.authorId?.username || 'Unknown'}</td>
                    <td>
                      <Badge bg="info">{post.views || 0} views</Badge>
                    </td>
                    <td>{formatDate(post.date)}</td>
                    <td>
                      {post.isTrending ? (
                        <Badge bg="success">🔥 Trending</Badge>
                      ) : (
                        <Badge bg="secondary">Regular</Badge>
                      )}
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant={post.isTrending ? 'warning' : 'success'}
                        onClick={() => handleToggleTrending(post._id)}
                      >
                        {post.isTrending ? 'Remove Trending' : 'Make Trending'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AdminDashboard;
