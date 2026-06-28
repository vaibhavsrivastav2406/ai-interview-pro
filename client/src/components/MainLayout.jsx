import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import ChatWidget from './ChatWidget';

const MainLayout = () => {
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          // Token is probably expired or invalid
          localStorage.removeItem('token');
          navigate('/login');
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="app-container">
      {/* Top Header Navigation */}
      <header className="nav-header">
        <NavLink to="/app/dashboard" className="nav-logo" style={{ color: 'white' }}>
          AI<span className="nav-logo-glow">Pro</span>
        </NavLink>

        {/* Navigation Menu */}
        <nav className="nav-menu">
          <NavLink to="/app/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            Dashboard
          </NavLink>
          <NavLink to="/app/interview" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            Interview Arena
          </NavLink>
          <NavLink to="/app/history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            History Log
          </NavLink>
          <NavLink to="/app/community" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            Community
          </NavLink>
          <NavLink to="/app/account" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            Account
          </NavLink>
        </nav>

        {/* User Pill / Actions */}
        <div className="nav-user">
          {user && (
            <div className="nav-user-pill">
              <span style={{ 
                display: 'inline-block', 
                width: '6px', 
                height: '6px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--success-glow)',
                boxShadow: '0 0 8px var(--success-glow)'
              }}></span>
              {user.name}
            </div>
          )}
          <button onClick={handleLogout} className="logout-btn">
            Log Out
          </button>
        </div>
      </header>

      {/* Main Page Workspace */}
      <main className="main-content">
        <Outlet context={{ user }} />
      </main>
      <ChatWidget />
    </div>
  );
};

export default MainLayout;