import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const PostCard = ({ post }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const stripHtml = (html) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <Card className="post-card mb-4 h-100">
      {post.image && (
        <Card.Img 
          variant="top" 
          src={post.image} 
          className="post-image"
          alt={post.title}
        />
      )}
      <Card.Body className="d-flex flex-column">
        <Card.Title>{post.title}</Card.Title>
        <Card.Text className="post-content text-muted">
          {stripHtml(post.content).substring(0, 150)}...
        </Card.Text>
        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <small className="text-muted">
              By <strong>{post.authorId?.username || 'Unknown'}</strong>
            </small>
            <div className="d-flex gap-2">
              {post.isTrending && (
                <Badge bg="danger">🔥 Trending</Badge>
              )}
              {post.views > 0 && (
                <Badge bg="info">👁 {post.views}</Badge>
              )}
              <Badge bg="secondary">{formatDate(post.date)}</Badge>
            </div>
          </div>
          <Link to={`/post/${post._id}`}>
            <Button variant="primary" size="sm" className="w-100">
              Read More
            </Button>
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
};

export default PostCard;