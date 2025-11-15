import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import CommentSection from '../components/CommentSection';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

const PostDetails = () => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isAuthenticated } = useAuth();

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await axios.get(`/posts/${id}`);
      setPost(response.data.data);
    } catch (error) {
      setError('Failed to fetch post');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await axios.delete(`/posts/${id}`);
      navigate('/');
    } catch (error) {
      alert('Failed to delete post');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  if (error || !post) {
    return <Alert variant="danger">{error || 'Post not found'}</Alert>;
  }

  // Only allow edit/delete if user is authenticated AND (is the author OR is admin)
  const canEdit = isAuthenticated && (user?._id === post.authorId?._id || isAdmin);

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <Card className="mb-4">
          {post.image && (
            <Card.Img 
              variant="top" 
              src={post.image} 
              alt={post.title}
              style={{ maxHeight: '400px', objectFit: 'cover' }}
            />
          )}
          <Card.Body>
            <h1 className="mb-3">{post.title}</h1>
            
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <strong>By {post.authorId?.username || 'Unknown'}</strong>
                <br />
                <small className="text-muted">
                  {formatDate(post.date)}
                </small>
              </div>
              {canEdit && (
                <div className="d-flex gap-2">
                  <Link to={`/edit-post/${post._id}`}>
                    <Button variant="warning" size="sm">Edit</Button>
                  </Link>
                  <Button 
                    variant="danger" 
                    size="sm" 
                    onClick={handleDelete}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>

            <hr />

            <div 
              className="post-content-full"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </Card.Body>
        </Card>

        <CommentSection postId={id} />

        <div className="text-center mt-4 mb-4">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PostDetails;