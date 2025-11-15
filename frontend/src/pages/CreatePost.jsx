import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import Editor from '../components/Editor';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [category, setCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEdit, setIsEdit] = useState(false);

  const availableTags = [
    'JavaScript', 'React', 'Node.js', 'MongoDB', 'Python',
    'Tutorial', 'Guide', 'Tips', 'Best Practices', 'Web Development',
    'Frontend', 'Backend', 'Full Stack', 'TypeScript', 'CSS',
    'HTML', 'API', 'Database', 'DevOps', 'Testing'
  ];

  const navigate = useNavigate();
  const { id } = useParams();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }

    fetchCategories();

    if (id) {
      setIsEdit(true);
      fetchPost();
    }
  }, [id, isAuthenticated]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/categories');
      console.log('Categories response:', response.data);
      setCategories(response.data.data || []);
      if (!response.data.data || response.data.data.length === 0) {
        console.warn('No categories found. Please run the seed script: node seed.js');
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setError('Unable to load categories. Please contact admin.');
    }
  };

  const fetchPost = async () => {
    try {
      const response = await axios.get(`/posts/${id}`);
      const post = response.data.data;
      setTitle(post.title);
      setContent(post.content);
      setPreview(post.image);
      setCategory(post.category?._id || '');
      setSelectedTags(post.tags || []);
    } catch (error) {
      setError('Failed to fetch post');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      if (image) {
        formData.append('image', image);
      }
      if (category) {
        formData.append('category', category);
      }
      if (selectedTags.length > 0) {
        formData.append('tags', JSON.stringify(selectedTags));
      }

      if (isEdit) {
        await axios.put(`/posts/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axios.post('/posts', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      navigate('/profile');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <Card>
          <Card.Header>
            <h3>{isEdit ? 'Edit Post' : 'Create New Post'}</h3>
          </Card.Header>
          <Card.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter post title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={loading}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Cover Image</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={loading}
                />
                {preview && (
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="mt-3 img-fluid rounded"
                    style={{ maxHeight: '300px' }}
                  />
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Select a category (optional)</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Tags</Form.Label>
                <div className="d-flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <Button
                      key={tag}
                      size="sm"
                      variant={selectedTags.includes(tag) ? "primary" : "outline-secondary"}
                      onClick={() => handleTagToggle(tag)}
                      disabled={loading}
                      type="button"
                    >
                      {selectedTags.includes(tag) ? '✓ ' : ''}{tag}
                    </Button>
                  ))}
                </div>
                <Form.Text className="text-muted">
                  {selectedTags.length > 0 
                    ? `Selected: ${selectedTags.join(', ')}`
                    : 'Click tags to select (optional)'}
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Content</Form.Label>
                <Editor value={content} onChange={setContent} />
              </Form.Group>

              <div className="d-flex gap-2">
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (isEdit ? 'Update Post' : 'Create Post')}
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => navigate(-1)}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default CreatePost;