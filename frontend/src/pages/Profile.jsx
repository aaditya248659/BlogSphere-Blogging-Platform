import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';

const Profile = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserPosts();
    }
  }, [user]);

  const fetchUserPosts = async () => {
    try {
      const response = await axios.get(`/posts/user/${user._id}`);
      setPosts(response.data.data);
    } catch (error) {
      setError('Failed to fetch your posts');
    } finally {
      setLoading(false);
    }
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

  return (
    <div>
      <div className="profile-header text-center">
        <h1>{user?.username}</h1>
        <p>{user?.email}</p>
        {user?.role === 'admin' && (
          <span className="badge bg-danger">Admin</span>
        )}
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>My Posts ({posts.length})</h3>
        <Link to="/create-post">
          <Button variant="primary">Create New Post</Button>
        </Link>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {posts.length === 0 ? (
        <Card className="text-center p-5">
          <Card.Body>
            <h5>You haven't created any posts yet</h5>
            <p className="text-muted">Start sharing your thoughts with the world!</p>
            <Link to="/create-post">
              <Button variant="primary">Create Your First Post</Button>
            </Link>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {posts.map((post) => (
            <Col key={post._id} md={6} lg={4} className="mb-4">
              <PostCard post={post} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default Profile;