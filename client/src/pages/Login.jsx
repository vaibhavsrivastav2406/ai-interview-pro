import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // 1. Google Login Custom Trigger Hook
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log("--- GOOGLE AUTH SUCCESS ---");
      console.log("Access Token from Google:", tokenResponse.access_token);

      try {
        // Send the access token to your backend server
        const response = await fetch('http://localhost:5000/api/auth/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: tokenResponse.access_token }),
        });

        const data = await response.json();

        if (response.ok) {
          // Store the JWT token your backend passes back
          localStorage.setItem('token', data.token);
          console.log("Successfully authenticated with Backend JWT!");
          window.location.href = '/dashboard'; // Redirect to dashboard
        } else {
          console.error("Backend validation failed:", data.message);
          alert(data.message || "Failed to authenticate with backend server.");
        }
      } catch (err) {
        console.error("Error communicating with backend server:", err);
        alert("Server connection failed. Is your backend running?");
      }
    },
    onError: (error) => {
      console.error("Google Popup Auth Failed:", error);
      alert("Google Sign-In was cancelled or failed.");
    }
  });

  // 2. Your Existing Form Login/Register Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        window.location.href = '/dashboard';
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Form authentication error:", err);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#0a0a0c',
      color: '#ffffff',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px', fontWeight: '600' }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={inputStyle}
            />
          )}

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />

          <button type="submit" style={buttonStyle}>
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        {/* Separator Line */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0 text' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
          <span style={{ padding: '0 10px', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>OR</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
        </div>

        {/* Custom Native Google Login Button */}
        <button 
          type="button" 
          onClick={() => handleGoogleLogin()}
          style={googleButtonStyle}
        >
          {/* Inline SVG for Google 'G' icon */}
          <svg width="18" height="18" viewBox="0 0 18 18" style={{ marginRight: '12px' }}>
            <path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7v2.24h2.91c1.7-1.57 2.68-3.88 2.68-6.57z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.24c-.8.54-1.84.87-3.05.87-2.34 0-4.33-1.58-5.03-3.71H.95v2.3A9 9 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.97 10.74c-.18-.54-.28-1.12-.28-1.74s.1-1.2.28-1.74V4.96H.95A8.99 8.99 0 0 0 0 9c0 1.46.35 2.85.95 4.09l3.02-2.35z"/>
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35L15 2.3A8.99 8.99 0 0 0 9 0 9 9 0 0 0 .95 4.96l3.02 2.35c.7-2.13 2.69-3.71 5.03-3.71z"/>
          </svg>
          Continue with Google
        </button>

        <p 
          onClick={() => setIsLogin(!isLogin)} 
          style={{ 
            textAlign: 'center', 
            marginTop: '24px', 
            fontSize: '14px', 
            color: 'rgba(255,255,255,0.6)', 
            cursor: 'pointer' 
          }}
        >
          {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
        </p>
      </div>
    </div>
  );
};

// Simple visual styling objects
const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  boxSizing: 'border-box',
  borderRadius: '8px',
  border: '1px solid rgba(255,255,255,0.1)',
  backgroundColor: 'rgba(0,0,0,0.2)',
  color: '#fff',
  fontSize: '15px',
  outline: 'none'
};

const buttonStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: '#fff',
  color: '#000',
  fontSize: '16px',
  fontWeight: 'bold',
  cursor: 'pointer',
  marginTop: '8px'
};

const googleButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  backgroundColor: 'transparent',
  color: '#fff',
  fontSize: '15px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'background-color 0.2s'
};

export default Login;