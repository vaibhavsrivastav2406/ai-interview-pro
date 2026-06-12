import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Determine backend endpoint based on state
    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      // Success! Save token and user data to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ name: data.name, email: data.email }));

      alert(isRegister ? 'Registration successful! Logging you in...' : 'Logged in successfully!');
      
      // Temporary redirect until we build the dashboard
      navigate('/dashboard'); 

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '30px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>{isRegister ? 'Create an Account' : 'Welcome Back'}</h2>
      
      {error && <p style={{ color: 'red', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '4px' }}>{error}</p>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {isRegister && (
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Full Name</label>
            <input 
              type="text" name="name" value={formData.name} onChange={handleChange} required
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
        )}

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email Address</label>
          <input 
            type="email" name="email" value={formData.email} onChange={handleChange} required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
          <input 
            type="password" name="password" value={formData.password} onChange={handleChange} required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <button type="submit" disabled={loading} style={{ padding: '10px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {loading ? 'Processing...' : isRegister ? 'Sign Up' : 'Sign In'}
        </button>
      </form>

      <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
        {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
        <span 
          onClick={() => { setIsRegister(!isRegister); setError(''); }} 
          style={{ color: '#0070f3', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {isRegister ? 'Sign In' : 'Sign Up'}
        </span>
      </p>
    </div>
  );
}

export default Login;