import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, MousePointer, Activity, Clock, 
  ExternalLink, Globe, Monitor, Share2, AlertCircle 
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { TrendChart, DistributionList } from '../components/CustomChart';
import { api } from '../utils/api';

const Analytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/urls/${id}/analytics`);
        setData(res);
      } catch (err) {
        setError(err.message || 'Failed to load analytics details');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '6rem 0', color: 'var(--color-text-secondary)' }}>
        Loading performance insights...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
        <GlassCard style={{ padding: '3rem' }}>
          <AlertCircle size={48} style={{ color: 'var(--color-error)', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '0.75rem' }}>Error Loading Analytics</h2>
          <p style={{ marginBottom: '2rem' }}>{error}</p>
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
            <ArrowLeft size={16} />
            <span>Return to Dashboard</span>
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
  const publicStatsUrl = `/stats/${url.shortCode}`;

  return (
    <div className="container animate-fade-in">
      {/* Navigation & Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <button 
          onClick={() => navigate('/dashboard')} 
          className="btn btn-secondary"
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          <ArrowLeft size={16} />
          <span>Dashboard</span>
        </button>

        <Link 
          to={publicStatsUrl} 
          className="btn btn-primary"
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          <Share2 size={16} />
          <span>View Public Stats</span>
        </Link>
      </div>

      {/* Main Metadata Overview */}
      <GlassCard style={{ padding: '2rem', marginBottom: '2.5rem', textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', color: 'white', overflowWrap: 'anywhere' }}>Performance Insights</h1>
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

        <div style={{ fontSize: '0.9rem', wordBreak: 'break-all' }}>
          <span style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>Original Destination URL</span>
          <a href={url.originalUrl} target="_blank" rel="noreferrer" style={{ color: 'white', textDecoration: 'none', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            {url.originalUrl}
            <ExternalLink size={12} />
          </a>
        </div>
      </GlassCard>

      {/* Metrics Cards Grid */}
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
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block' }}>Total Click Count</span>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white' }}>{analytics.totalClicks}</span>
          </div>
        </GlassCard>

        <GlassCard style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'left' }}>
          <div style={{ background: 'rgba(168, 85, 247, 0.1)', color: 'var(--color-violet)', padding: '12px', borderRadius: '12px' }}>
            <Clock size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block' }}>Last Visited Time</span>
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

      {/* Recent clicks list log */}
      <GlassCard style={{ padding: '2rem', overflowX: 'auto' }}>
        <h2 style={{ fontSize: '1.2rem', color: 'white', marginBottom: '1.5rem', textAlign: 'left' }}>Recent Visits Log (Last 50 clicks)</h2>

        {analytics.recentClicks.length === 0 ? (
          <div style={{ padding: '2rem 0', color: 'var(--color-text-secondary)' }}>
            No visit logs recorded yet.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
                <th style={{ padding: '10px 12px' }}>Timestamp</th>
                <th style={{ padding: '10px 12px' }}>IP Address</th>
                <th style={{ padding: '10px 12px' }}>Device</th>
                <th style={{ padding: '10px 12px' }}>Browser</th>
                <th style={{ padding: '10px 12px' }}>OS</th>
              </tr>
            </thead>
            <tbody>
              {analytics.recentClicks.map((click, index) => (
                <tr key={click._id || index} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.85rem' }}>
                  <td style={{ padding: '12px', color: 'white' }}>{new Date(click.timestamp).toLocaleString()}</td>
                  <td style={{ padding: '12px', color: 'var(--color-text-secondary)' }}>{click.ip}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'white' }}>
                      <Monitor size={12} />
                      <span>{click.device}</span>
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: 'var(--color-text-secondary)' }}>{click.browser}</td>
                  <td style={{ padding: '12px', color: 'var(--color-text-secondary)' }}>{click.os}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </GlassCard>
    </div>
  );
};

export default Analytics;
