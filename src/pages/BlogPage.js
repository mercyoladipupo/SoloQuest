import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState({});
  const [editingComment, setEditingComment] = useState({});
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const token = localStorage.getItem('access');
        const userPayload = token ? JSON.parse(atob(token.split('.')[1])) : null;
        setUserEmail(userPayload?.email);

        const response = await axios.get('http://127.0.0.1:8000/posts/');
        setBlogs(Array.isArray(response.data) ? response.data : []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching blogs:', error);
        setError('Failed to load blogs. Please try again later.');
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const handleLike = async (postId) => {
    try {
      const response = await axios.post(`http://127.0.0.1:8000/posts/${postId}/like/`);
      setBlogs((prevBlogs) =>
        prevBlogs.map((blog) =>
          blog.id === postId ? { ...blog, likes_count: response.data.likes_count } : blog
        )
      );
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleCommentSubmit = async (postId) => {
    if (!commentText[postId]) return;

    const token = localStorage.getItem('access');
    if (!token) {
      alert('Please log in to comment.');
      return;
    }

    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/posts/${postId}/comment/`,
        { content: commentText[postId] },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBlogs((prevBlogs) =>
        prevBlogs.map((blog) =>
          blog.id === postId
            ? { ...blog, comments: [...(Array.isArray(blog.comments) ? blog.comments : []), response.data] }
            : blog
        )
      );
      setCommentText({ ...commentText, [postId]: '' });
    } catch (error) {
      console.error('Error adding comment:', error.response?.data || error.message);
    }
  };

  const handleDeleteComment = async (commentId, postId) => {
    const token = localStorage.getItem('access');
    if (!token) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/comments/${commentId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBlogs((prevBlogs) =>
        prevBlogs.map((blog) =>
          blog.id === postId
            ? { ...blog, comments: blog.comments.filter((c) => c.id !== commentId) }
            : blog
        )
      );
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleEditComment = async (commentId, postId) => {
    const token = localStorage.getItem('access');
    if (!token) return;
    try {
      const response = await axios.put(
        `http://127.0.0.1:8000/comments/${commentId}/`,
        { content: editingComment[commentId] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBlogs((prevBlogs) =>
        prevBlogs.map((blog) =>
          blog.id === postId
            ? {
                ...blog,
                comments: blog.comments.map((c) =>
                  c.id === commentId ? response.data : c
                ),
              }
            : blog
        )
      );
      setEditingComment((prev) => ({ ...prev, [commentId]: '' }));
    } catch (error) {
      console.error('Failed to edit comment:', error);
    }
  };

  if (loading) return <p>Loading blog posts...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>All Blog Posts</h2>
      <div style={styles.grid}>
        {blogs.map((blog) => (
          <div key={blog.id} style={styles.card}>
            <h3 style={styles.title}>{blog.title}</h3>
            <p>{blog.content?.substring(0, 100)}...</p>
            <p><strong>Published by:</strong> {blog.author_name || 'Unknown'}</p>
            <p><strong>Date:</strong> {blog.created_at ? new Date(blog.created_at).toLocaleString() : 'N/A'}</p>
            <button onClick={() => handleLike(blog.id)} style={styles.likeButton}>
              👍 {blog.likes_count} Likes
            </button>
            <div style={styles.commentSection}>
              <h4>Comments</h4>
              <div style={styles.commentList}>
                {Array.isArray(blog.comments) && blog.comments.map((comment) => (
                  <div key={comment.id}>
                    <p>
                      <strong>{comment.user}</strong>: {editingComment[comment.id] !== undefined ? (
                        <>
                          <input
                            value={editingComment[comment.id]}
                            onChange={(e) =>
                              setEditingComment({ ...editingComment, [comment.id]: e.target.value })
                            }
                          />
                          <button onClick={() => handleEditComment(comment.id, blog.id)}>Save</button>
                        </>
                      ) : (
                        comment.content
                      )}
                    </p>
                    {(comment.user === userEmail || blog.author === userEmail) && (
                      <>
                        {comment.user === userEmail && (
                          <button onClick={() => setEditingComment({ ...editingComment, [comment.id]: comment.content })}>
                            Edit
                          </button>
                        )}
                        <button onClick={() => handleDeleteComment(comment.id, blog.id)}>Delete</button>
                      </>
                    )}
                  </div>
                ))}
              </div>
              <div style={styles.commentForm}>
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentText[blog.id] || ''}
                  onChange={(e) => setCommentText({ ...commentText, [blog.id]: e.target.value })}
                  style={styles.commentInput}
                />
                <button onClick={() => handleCommentSubmit(blog.id)} style={styles.commentButton}>
                  Add Comment
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '40px auto',
    padding: '20px',
    background: '#0f172a',
    borderRadius: '12px',
    color: 'white',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
    fontSize: '2rem'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px'
  },
  card: {
    background: '#1e293b',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  },
  title: {
    color: '#38bdf8',
    marginBottom: '10px'
  },
  likeButton: {
    background: '#2563eb',
    color: 'white',
    padding: '6px 12px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '10px',
  },
  commentSection: {
    marginTop: '15px',
    background: '#334155',
    padding: '10px',
    borderRadius: '8px'
  },
  commentList: {
    marginBottom: '10px'
  },
  commentForm: {
    display: 'flex',
    gap: '10px'
  },
  commentInput: {
    flex: 1,
    padding: '6px',
    borderRadius: '5px',
    border: 'none'
  },
  commentButton: {
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    padding: '6px 12px',
    cursor: 'pointer'
  }
};

export default BlogPage;