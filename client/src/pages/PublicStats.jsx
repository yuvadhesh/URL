import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, MousePointer, Activity, Clock, 
  ExternalLink, AlertCircle 
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { TrendChart, DistributionList } from '../components/CustomChart';
import { api } from '../utils/api';

const PublicStats = () => {
  const { code } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchPublicStats = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/urls/public/stats/${code}`);
        setData(res);
      } catch (err) {
        setError(err.message || 'Failed to load public statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchPublicStats();
  }, [code]);

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '6rem 0', color: 'var(--color-text-secondary)' }}>
        Loading public metrics...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
        <GlassCard style={{ padding: '3rem' }}>
          <AlertCircle size={48} style={{ color: 'var(--color-error)', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '0.75rem' }}>Link Not Found</h2>
          <p style={{ marginBottom: '2rem' }}>{error}</p>
          <button onClick={() => navigate('/login')} className="btn btn-primary">
            <span>Back to Login</span>
          </button>
        </GlassCard>
      </div>
    );
  }

  const { url, analytics } = data;
  const getBackendBaseUrl = () => {
    const hostname = window.location.hostname || 'localhost';
    return `http://${hostname}:5000`;
  };
  const fullShortUrl = `${getBackendBaseUrl()}/r/${url.shortCode}`;

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '900px' }}>
      {/* Header card */}
      <GlassCard style={{ padding: '2rem', marginBottom: '2.5rem', textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-secondary)', fontWeight: 700, letterSpacing: '0.1em' }}>Public Stats Page</span>
            <h1 style={{ fontSize: '1.8rem', color: 'white', marginTop: '4px' }}>Performance Analytics</h1>
            <a 
              href={fullShortUrl} 
              target="_blank" 
              rel="noreferrer" 
              style={{ color: 'var(--color-secondary)', textDecoration: 'none', fontWeight: 600, fontSize: '1.1rem', marginTop: '6px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <span>/r/{url.shortCode}</span>
              <ExternalLink size={14} />
            </a>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Created: {new Date(url.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
          This is a public stats page. Anyone can monitor click metrics and distributions for this link in real time.
        </p>
      </GlassCard>

      {/* Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2.5rem'
      }}>
        <GlassCard style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'left' }}>
          <div style={{ background: 'rgba(0, 242, 254, 0.1)', color: 'var(--color-secondary)', padding: '12px', borderRadius: '12px' }}>
            <MousePointer size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block' }}>Total Clicks</span>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white' }}>{analytics.totalClicks}</span>
          </div>
        </GlassCard>

        <GlassCard style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'left' }}>
          <div style={{ background: 'rgba(168, 85, 247, 0.1)', color: 'var(--color-violet)', padding: '12px', borderRadius: '12px' }}>
            <Clock size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block' }}>Last Visited</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'white', display: 'block', marginTop: '4px' }}>
              {analytics.lastVisited ? new Date(analytics.lastVisited).toLocaleString() : 'Never'}
            </span>
          </div>
        </GlassCard>

        <GlassCard style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'left' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)', padding: '12px', borderRadius: '12px' }}>
            <Activity size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block' }}>Link Status</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', display: 'block', marginTop: '4px' }}>
              {url.expiresAt && new Date(url.expiresAt) < new Date() ? (
                <span style={{ color: 'var(--color-error)' }}>Expired</span>
              ) : (
                <span style={{ color: 'var(--color-success)' }}>Active</span>
              )}
            </span>
          </div>
        </GlassCard>
      </div>

      {/* Visual Analytics Sections */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '2rem',
        marginBottom: '2.5rem'
      }}>
        {/* Trend line SVG Chart */}
        <GlassCard style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.2rem', color: 'white', marginBottom: '1.5rem', textAlign: 'left' }}>Daily Click Trends (Last 7 Days)</h2>
          <TrendChart data={analytics.dailyTrends} />
        </GlassCard>

        {/* Distributions lists */}
        <GlassCard style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <DistributionList title="Browser Distribution" data={analytics.browserBreakdown} />
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />
          <DistributionList title="Device Distribution" data={analytics.deviceBreakdown} />
        </GlassCard>
      </div>
    </div>
  );
};

export default PublicStats;
