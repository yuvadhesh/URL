import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Link2, LogOut, LayoutDashboard, User } from 'lucide-react';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to={user ? "/dashboard" : "/login"} className="navbar-brand">
          <Link2 size={24} style={{ strokeWidth: 3 }} />
          <span>SnipURL</span>
        </Link>

        {user ? (
          <div className="navbar-links">
            <Link 
              to="/dashboard" 
              className={`navbar-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </Link>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1.2rem' }}>
              <User size={16} className="header-grad" />
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white' }}>{user.name}</span>
            </div>

            <button 
              onClick={handleLogoutClick}
              className="btn btn-secondary"
              style={{ padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem' }}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className="navbar-links">
            <Link 
              to="/login" 
              className={`navbar-link ${location.pathname === '/login' ? 'active' : ''}`}
            >
              Login
            </Link>
            <Link 
              to="/signup" 
              className="btn btn-primary"
              style={{ padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem' }}
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
