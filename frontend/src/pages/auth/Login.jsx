// src/pages/auth/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login , isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };


const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const data=await login(formData.email, formData.password);

    // Redirect based on role
    if (data.user.role === 'admin') {
      navigate('/admin');  // your admin dashboard route
    } else {
      navigate('/');       // normal user dashboard
    }

  } catch (err) {
    setError(err.response?.data?.message || 'Login failed. Please try again.');
  } finally {
    setLoading(false);
  }
};


  //   try {
  //     await login(formData.email, formData.password); 
  //     navigate('/');
  //   } catch (err) {
  //     setError(err.response?.data?.message || 'Login failed. Please try again.');
  //   } finally {
  //     setLoading(false); 
  //   } 
  // };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome Back! 👋</h1>
          <p>Login to continue your interview preparation journey</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            className="btn-submit"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register">Sign Up</Link></p>
        </div>

        {/* <div className="demo-credentials">
          <p className="demo-title">Demo Credentials:</p>
          <p><strong>Admin:</strong> admin@prepmetrics.com / Admin@123</p>
        </div> */}
      </div> 

      <div className="auth-features">
        <div className="feature-card">
          <span className="feature-icon">📊</span>
          <h3>Track Progress</h3>
          <p>Monitor your performance with detailed analytics</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">🎯</span>
          <h3>Practice Quizzes</h3>
          <p>Test your knowledge with curated questions</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">🏆</span>
          <h3>Earn Certificates</h3>
          <p>Get certified on completing subjects</p>
        </div>
      </div>
    </div>
  );
};

export default Login;

