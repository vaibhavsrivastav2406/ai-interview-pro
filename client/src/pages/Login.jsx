import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';

const Login = () => {
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 1. Google Login Custom Trigger Hook
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setErrorMsg('');
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE}/api/auth/google`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: tokenResponse.access_token }),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('token', data.token);
          window.location.href = '/app/dashboard'; // Redirect to correct app dashboard
        } else {
          setErrorMsg(data.message || "Failed to authenticate with backend server.");
        }
      } catch (err) {
        console.error("Error communicating with backend server:", err);
        setErrorMsg("Server connection failed. Is your backend running?");
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error("Google Popup Auth Failed:", error);
      setErrorMsg("Google Sign-In was cancelled or failed.");
    }
  });

  // 2. Form Login/Register Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        window.location.href = '/app/dashboard'; // Redirect to correct app dashboard
      } else {
        setErrorMsg(data.message || 'Authentication failed. Please check your credentials.');
      }
    } catch (err) {
      console.error("Form authentication error:", err);
      setErrorMsg("Connection to server failed. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '40px',
        animation: 'slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: '800', 
            margin: '0 0 8px 0', 
            letterSpacing: '-0.04em' 
          }}>
            AI<span className="text-gradient">Pro</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
            {isLogin ? 'Accelerate your career with AI mock interviews' : 'Create an account to start practicing'}
          </p>
        </div>

        {errorMsg && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '8px',
            color: 'var(--danger-glow)',
            fontSize: '13px',
            padding: '12px 16px',
            marginBottom: '20px',
            textAlign: 'center',
            fontWeight: '600'
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {!isLogin && (
            <div>
              <label>Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          )}

          <div>
            <label>Email Address</label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={isLoading}>
            {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Get Started')}
          </button>
        </form>

        {/* Separator Line */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--glass-border)' }}></div>
          <span style={{ padding: '0 12px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: '700' }}>OR</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--glass-border)' }}></div>
        </div>

        {/* Custom Native Google Login Button */}
        <button 
          type="button" 
          onClick={() => handleGoogleLogin()}
          className="btn-secondary"
          style={{ width: '100%' }}
          disabled={isLoading}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
            <path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7v2.24h2.91c1.7-1.57 2.68-3.88 2.68-6.57z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.24c-.8.54-1.84.87-3.05.87-2.34 0-4.33-1.58-5.03-3.71H.95v2.3A9 9 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.97 10.74c-.18-.54-.28-1.12-.28-1.74s.1-1.2.28-1.74V4.96H.95A8.99 8.99 0 0 0 0 9c0 1.46.35 2.85.95 4.09l3.02-2.35z"/>
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35L15 2.3A8.99 8.99 0 0 0 9 0 9 9 0 0 0 .95 4.96l3.02 2.35c.7-2.13 2.69-3.71 5.03-3.71z"/>
          </svg>
          Continue with Google
        </button>

        <p 
          onClick={() => { if(!isLoading) setIsLogin(!isLogin); }} 
          style={{ 
            textAlign: 'center', 
            marginTop: '28px', 
            fontSize: '13px', 
            color: 'var(--text-muted)', 
            cursor: isLoading ? 'default' : 'pointer',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.color = 'var(--text-main)'}
          onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
        >
          {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
        </p>
      </div>
    </div>
  );
};

export default Login;