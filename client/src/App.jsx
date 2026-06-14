import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import PublicStats from './pages/PublicStats';
import { api } from './utils/api';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await api.get('/auth/me');
        setUser(currentUser);
      } catch (error) {
        console.error('Session restoration failed:', error);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#070a13',
        color: '#f8fafc',
        fontFamily: "'Outfit', sans-serif",
        fontSize: '1.2rem',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div className="spinner" />
        <span>Restoring session...</span>
        <style>{`
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(0, 242, 254, 0.1);
            border-top: 4px solid #00f2fe;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <Router>
      <div className="app-container">
        <Navbar user={user} onLogout={handleLogout} />
        
        <main className="main-content">
          <Routes>
            {/* Public Auth Routes */}
            <Route 
              path="/login" 
              element={user ? <Navigate to="/dashboard" replace /> : <Login onLoginSuccess={handleLoginSuccess} />} 
            />
            <Route 
              path="/signup" 
              element={user ? <Navigate to="/dashboard" replace /> : <Signup onSignupSuccess={handleLoginSuccess} />} 
            />

            {/* Public Statistics Page */}
            <Route path="/stats/:code" element={<PublicStats />} />

            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                user ? <Dashboard /> : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/analytics/:id" 
              element={
                user ? <Analytics /> : <Navigate to="/login" replace />
              } 
            />

            {/* Redirection / Fallbacks */}
            <Route 
              path="/" 
              element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
            />
            <Route 
              path="*" 
              element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
