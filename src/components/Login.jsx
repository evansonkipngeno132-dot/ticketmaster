import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Login.css';

const Login = ({ setAuthUser }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const endpoint = isSignUp ? '/api/signup' : '/api/login';
    const bodyData = isSignUp ? { name, email, password } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('tm_token', data.token);
        setAuthUser(data.user);
        navigate('/');
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      className="login-page container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="login-box">
        <h2>{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
        <p className="login-subtitle">
          {isSignUp ? 'Create your Ticketmaster account' : 'Welcome back to Ticketmaster'}
        </p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          {isSignUp && (
            <div className="input-group">
              <label>Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe" 
                required 
              />
            </div>
          )}
          <div className="input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com" 
              required 
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password123" 
              required 
            />
          </div>
          
          <button type="submit" className="btn-login" disabled={isLoading}>
            {isLoading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div className="login-footer">
          {isSignUp ? (
            <p>Already have an account? <span onClick={() => { setIsSignUp(false); setError(''); }} style={{cursor: 'pointer', color: 'var(--tm-blue)', fontWeight: 600}}>Sign In</span></p>
          ) : (
            <p>Don't have an account? <span onClick={() => { setIsSignUp(true); setError(''); }} style={{cursor: 'pointer', color: 'var(--tm-blue)', fontWeight: 600}}>Sign up</span></p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Login;
