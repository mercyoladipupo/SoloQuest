import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddBlog = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [tags, setTags] = useState('');
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/categories/');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submit button clicked!");  // ✅ Check if this logs

    setSuccessMessage('');
    setErrorMessage('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (image) {
      formData.append('image', image);
    }
    formData.append('tags', tags);
    formData.append('category', category);

    const token = localStorage.getItem('access');
    if (!token) {
      console.log("No token found!");  // ✅ Debugging log
      setErrorMessage('You must be logged in to publish a blog.');
      return;
    }

    try {
      console.log("Sending request...");  // ✅ Debugging log
      await axios.post('http://127.0.0.1:8000/posts/', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      console.log("Blog post created successfully!");  // ✅ Debugging log

      setSuccessMessage('Blog successfully published! Redirecting...');
      setTimeout(() => navigate('/blogpage'), 2000);
    } catch (error) {
      console.error('Error creating blog post:', error);
      setErrorMessage('Failed to publish blog. Please try again.');
    }
};

  

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Add New Blog Post</h2>

      {/* Success Message */}
      {successMessage && <p style={styles.successMessage}>{successMessage}</p>}

      {/* Error Message */}
      {errorMessage && <p style={styles.errorMessage}>{errorMessage}</p>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <input 
          type="text" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="Title" 
          required 
          style={styles.input} 
        />

        <textarea 
          value={content} 
          onChange={(e) => setContent(e.target.value)} 
          placeholder="Content" 
          required 
          style={styles.textarea}
        ></textarea>

        <input 
          type="file" 
          onChange={handleImageChange} 
          style={styles.fileInput} 
        />

        <input 
          type="text" 
          value={tags} 
          onChange={(e) => setTags(e.target.value)} 
          placeholder="Tags (comma separated)" 
          style={styles.input} 
        />

        <select 
          value={category} 
          onChange={(e) => setCategory(e.target.value)} 
          required 
          style={styles.select}
        >
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <button type="submit" style={styles.button}>Create Post</button>
      </form>
    </div>
  );
};

// 🔹 Styles for UI
const styles = {
  container: {
    maxWidth: '600px',
    margin: '50px auto',
    padding: '20px',
    background: '#1e1e1e',
    color: 'white',
    borderRadius: '8px',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
  },
  title: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  successMessage: {
    color: 'green',
    textAlign: 'center',
    fontSize: '16px',
    marginBottom: '10px',
  },
  errorMessage: {
    color: 'red',
    textAlign: 'center',
    fontSize: '16px',
    marginBottom: '10px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  input: {
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #555',
    background: '#2c2c2c',
    color: 'white',
  },
  textarea: {
    height: '100px',
    resize: 'vertical',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #555',
    background: '#2c2c2c',
    color: 'white',
  },
  fileInput: {
    padding: '5px',
    background: '#2c2c2c',
    color: 'white',
  },
  select: {
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #555',
    background: '#2c2c2c',
    color: 'white',
  },
  button: {
    padding: '10px',
    border: 'none',
    borderRadius: '5px',
    background: '#007bff',
    color: 'white',
    cursor: 'pointer',
    transition: '0.3s',
  },
  buttonHover: {
    background: '#0056b3',
  }
};

export default AddBlog;
