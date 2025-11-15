import { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, ListGroup } from 'react-bootstrap';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

const CommentSection = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`/comments/${postId}`);
      setComments(response.data.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/comments', {
        postId,
        text: commentText
      });
      setComments([response.data.data, ...comments]);
      setCommentText('');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await axios.delete(`/comments/${commentId}`);
      setComments(comments.filter(c => c._id !== commentId));
    } catch (error) {
      alert('Failed to delete comment');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="mt-4">
      <Card.Header>
        <h5>Comments ({comments.length})</h5>
      </Card.Header>
      <Card.Body>
        {isAuthenticated ? (
          <Form onSubmit={handleSubmit} className="mb-4">
            {error && <Alert variant="danger">{error}</Alert>}
            <Form.Group className="mb-3">
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={loading}
              />
            </Form.Group>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Posting...' : 'Post Comment'}
            </Button>
          </Form>
        ) : (
          <Alert variant="info">Please login to comment</Alert>
        )}

        <ListGroup variant="flush">
          {comments.map((comment) => (
            <ListGroup.Item key={comment._id} className="comment-box">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <strong>{comment.userId?.username || 'Unknown User'}</strong>
                  <small className="text-muted ms-2">
                    {formatDate(comment.date)}
                  </small>
                  <p className="mb-0 mt-2">{comment.text}</p>
                </div>
                {(user?._id === comment.userId?._id || isAdmin) && (
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => handleDelete(comment._id)}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </ListGroup.Item>
          ))}
          {comments.length === 0 && (
            <ListGroup.Item className="text-center text-muted">
              No comments yet. Be the first to comment!
            </ListGroup.Item>
          )}
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

export default CommentSection;