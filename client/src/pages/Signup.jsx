import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, User, Key, Mail, AlertCircle, Loader } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { api } from '../utils/api';

const Signup = ({ onSignupSuccess }) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!name.trim()) {
      errors.name = 'Name is required';
    }

    if (!email) {
      errors.email = 'Email is required';
    } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      errors.email = 'Please fill a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await api.post('/auth/signup', { name, email, password });
      localStorage.setItem('token', response.token);
      onSignupSuccess(response.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 72px)', // height minus header
      padding: '2rem 1.5rem'
    }}>
      <GlassCard 
        className="animate-slide-up"
        glow={true} 
        style={{ width: '100%', maxWidth: '420px', padding: '2.5rem' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(168, 85, 247, 0.1)',
            marginBottom: '1rem',
            border: '1px solid rgba(168, 85, 247, 0.2)'
          }}>
            <UserPlus size={26} style={{ color: 'var(--color-violet)' }} />
          </div>
          <h1 style={{ fontSize: '1.8rem', color: 'white', marginBottom: '0.5rem' }}>Create Account</h1>
          <p style={{ fontSize: '0.9rem' }}>Join us to shorten and track your links with ease</p>
        </div>

        {error && (
          <div className="badge badge-danger animate-fade-in" style={{ 
            width: '100%', 
            padding: '0.75rem 1rem', 
            borderRadius: '10px', 
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)', display: 'flex' }}>
                <User size={18} />
              </span>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`input-field ${validationErrors.name ? 'input-error' : ''}`}
                style={{ paddingLeft: '2.5rem' }}
                disabled={loading}
              />
            </div>
            {validationErrors.name && (
              <span className="input-error-msg">{validationErrors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)', display: 'flex' }}>
                <Mail size={18} />
              </span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`input-field ${validationErrors.email ? 'input-error' : ''}`}
                style={{ paddingLeft: '2.5rem' }}
                disabled={loading}
              />
            </div>
            {validationErrors.email && (
              <span className="input-error-msg">{validationErrors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)', display: 'flex' }}>
                <Key size={18} />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`input-field ${validationErrors.password ? 'input-error' : ''}`}
                style={{ paddingLeft: '2.5rem' }}
                disabled={loading}
              />
            </div>
            {validationErrors.password && (
              <span className="input-error-msg">{validationErrors.password}</span>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-violet" 
            style={{ width: '100%', marginTop: '1rem', height: '48px' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Sign Up</span>
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-violet)', textDecoration: 'none', fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </GlassCard>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Signup;
