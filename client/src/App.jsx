import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Interview from './pages/Interview';

function App() {
  return (
    <Router>
      {/* We removed the inline styles and added our new CSS classes! */}
      <div className="app-wrapper">
        <div className="card-container">
          <h1 style={{ textAlign: 'center', color: '#4f46e5', marginBottom: '30px', fontWeight: '800' }}>
            AI Interview Pro
          </h1>
          
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/interview" element={<Interview />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;