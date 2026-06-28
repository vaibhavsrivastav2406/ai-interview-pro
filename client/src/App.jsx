import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import MainLayout from './components/MainLayout';
import Dashboard from './pages/Dashboard';
import Interview from './pages/Interview';
import History from './pages/History';
import Community from './pages/Community';
import Account from './pages/Account';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* 1. The Isolated Login Page */}
        <Route path="/login" element={<Login />} />

        {/* 2. The Main Application Layout */}
        <Route path="/app" element={<MainLayout />}>
          {/* Default to Dashboard when hitting /app */}
          <Route index element={<Navigate to="dashboard" replace />} />
          
          {/* Nested Tabs */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="interview" element={<Interview />} />
          <Route path="community" element={<Community />} />
          <Route path="history" element={<History />} />
          <Route path="account" element={<Account />} />
        </Route>

        {/* 3. Catch-all redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;