import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { signInWithOAuth, signInWithEmail, signUpWithEmail, user } = useAuth();
  const [email, setEmail] = useState('siddu16jan@gmail.com');
  const [password, setPassword] = useState('Siddarth2005');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Clear success message after 5 seconds
  useEffect(() => {
    let timer;
    if (success) {
      timer = setTimeout(() => setSuccess(''), 5000);
    }
    return () => clearTimeout(timer);
  }, [success]);

  // Redirect to editor when user is authenticated
  useEffect(() => {
    if (user) {
      console.log('User authenticated, redirecting to editor');
      navigate('/editor');
    }
  }, [user, navigate]);

  const handleOAuthLogin = (provider) => {
    signInWithOAuth(provider);
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    if (!email || !password) {
      setError('Email and password are required');
      setLoading(false);
      return;
    }
    
    try {
      if (isSignUp) {
        // Handle sign up
        console.log('Attempting to sign up with:', email);
        const { error: signUpError, message } = await signUpWithEmail(email, password);
        
        if (signUpError) {
          setError(signUpError.message);
          console.error('Sign up error:', signUpError);
        } else if (message) {
          // Show success message instead of error
          setSuccess(message);
          console.log('Sign up message:', message);
          setIsSignUp(false); // Switch to sign in mode after successful signup
        } else {
          setSuccess('Account created successfully! You can now sign in.');
          setIsSignUp(false); // Switch to sign in mode after successful signup
          console.log('Sign up successful');
        }
      } else {
        // Handle sign in
        console.log('Attempting to sign in with:', email);
        const { error: signInError } = await signInWithEmail(email, password);
        
        if (signInError) {
          // If user doesn't exist, suggest signing up
          if (signInError.message.includes('Invalid login credentials')) {
            setError('Invalid email or password. If you don\'t have an account, please sign up.');
          } else {
            setError(signInError.message);
          }
          console.error('Sign in error:', signInError);
        } else {
          console.log('Sign in successful');
          // Set success message with a slight delay to allow redirection to happen
          setTimeout(() => {
            setSuccess('Sign in successful! Redirecting...');
          }, 300);
        }
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setSuccess('');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Arduino Editor</h2>
        <p>{isSignUp ? 'Create an account' : 'Sign in to continue'}</p>
        
        <form className="email-form" onSubmit={handleEmailAuth}>
          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              minLength="6"
            />
          </div>
          
          <button type="submit" className="email-button" disabled={loading}>
            {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
          
          <p className="auth-toggle">
            {isSignUp ? 'Already have an account?' : 'Need an account?'}
            <button 
              type="button" 
              className="toggle-button" 
              onClick={toggleAuthMode}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </form>
        
        <div className="divider">
          <span>OR</span>
        </div>
        
        <div className="oauth-buttons">
          <button 
            className="oauth-button github" 
            onClick={() => handleOAuthLogin('github')}
          >
            <i className="fab fa-github"></i>
            Sign in with GitHub
          </button>
          
          <button 
            className="oauth-button google" 
            onClick={() => handleOAuthLogin('google')}
          >
            <i className="fab fa-google"></i>
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;