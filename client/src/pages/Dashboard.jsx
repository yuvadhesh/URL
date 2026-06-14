import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Link2, Sparkles, Copy, BarChart2, QrCode, Edit3, Trash2, 
  Upload, FileText, Calendar, Plus, ExternalLink, Check, AlertTriangle 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import GlassCard from '../components/GlassCard';
import QrCodeModal from '../components/QrCodeModal';
import EditUrlModal from '../components/EditUrlModal';
import { api, getBackendBaseUrl } from '../utils/api';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // URL creation form states
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [formError, setFormError] = useState('');
  const [successLink, setSuccessLink] = useState(null);
  
  // Bulk Text states
  const [bulkText, setBulkText] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState('');
  const [bulkError, setBulkError] = useState('');
  
  // Links library states
  const [urls, setUrls] = useState([]);
  const [loadingUrls, setLoadingUrls] = useState(true);
  const [fetchError, setFetchError] = useState('');
  
  // UI interactions states
  const [copyToast, setCopyToast] = useState('');
  const [activeQrUrl, setActiveQrUrl] = useState(null);
  const [activeQrOriginal, setActiveQrOriginal] = useState('');
  
  // Modals and confirmations states
  const [activeEditUrl, setActiveEditUrl] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Fetch all user URLs
  const fetchUrls = async () => {
    try {
      setLoadingUrls(true);
      const data = await api.get('/urls');
      setUrls(data);
    } catch (err) {
      setFetchError(err.message || 'Failed to fetch shortened links');
    } finally {
      setLoadingUrls(false);
    }
  };

  const [serverBaseUrl, setServerBaseUrl] = useState(getBackendBaseUrl());

  useEffect(() => {
    fetchUrls();

    const fetchServerInfo = async () => {
      try {
        const info = await api.get('/urls/server-info');
        if (info && info.baseUrl) {
          setServerBaseUrl(info.baseUrl);
        }
      } catch (err) {
        console.error('Failed to fetch server info:', err);
      }
    };
    fetchServerInfo();
  }, []);

  // Copy link helper
  const handleCopyLink = (code) => {
    const fullShortUrl = `${serverBaseUrl}/r/${code}`;
    navigator.clipboard.writeText(fullShortUrl);
    setCopyToast(code);
    setTimeout(() => setCopyToast(''), 2500);
  };

  // Submit single shorten URL
  const handleShortenSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessLink(null);

    if (!originalUrl) {
      setFormError('Destination URL is required');
      return;
    }

    // Front-end URL structure verification
    try {
      new URL(originalUrl);
    } catch (err) {
      setFormError('Please input a valid URL starting with http:// or https://');
      return;
    }

    try {
      const body = { originalUrl };
      if (customAlias.trim()) body.customAlias = customAlias.trim();
      if (expiresAt) body.expiresAt = expiresAt;

      const newUrl = await api.post('/urls/shorten', body);
      
      // Update local link list
      setUrls([newUrl, ...urls]);
      setSuccessLink(`${serverBaseUrl}/r/${newUrl.shortCode}`);
      
      // Reset form
      setOriginalUrl('');
      setCustomAlias('');
      setExpiresAt('');

      // Confetti celebration!
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#00f2fe', '#4facfe', '#a855f7']
      });

    } catch (err) {
      setFormError(err.message || 'Error shortening URL');
    }
  };

  // Submit Bulk URL text list shortening
  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setBulkError('');
    setBulkSuccessMsg('');

    if (!bulkText.trim()) {
      setBulkError('Please enter some URLs first');
      return;
    }

    const lines = bulkText.split('\n');
    const urlsList = lines
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (urlsList.length === 0) {
      setBulkError('No URLs entered');
      return;
    }

    setBulkLoading(true);
    try {
      const response = await api.post('/urls/bulk', { urls: urlsList });
      setBulkSuccessMsg(response.message);
      setBulkText('');
      
      // Update links list
      fetchUrls();

      // Confetti splash
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (err) {
      setBulkError(err.message || 'Failed to process bulk URLs');
    } finally {
      setBulkLoading(false);
    }
  };

  // Edit original URL destination
  const handleSaveEdit = async (id, newOriginalUrl) => {
    const updated = await api.put(`/urls/${id}`, { originalUrl: newOriginalUrl });
    setUrls(urls.map(u => u._id === id ? updated : u));
  };

  // Delete short link
  const handleDeleteUrl = async (id) => {
    try {
      await api.delete(`/urls/${id}`);
      setUrls(urls.filter(u => u._id !== id));
      setConfirmDeleteId(null);
    } catch (err) {
      alert(err.message || 'Failed to delete URL');
    }
  };

  return (
    <div className="container animate-fade-in">
      {/* Toast Notification */}
      {copyToast && (
        <div className="toast-success">
          <Check size={16} />
          <span>Shortcode '{copyToast}' copied!</span>
        </div>
      )}

      {/* Header section */}
      <div style={{ marginBottom: '2.5rem', textAlign: 'left' }}>
        <h1 style={{ fontSize: '2.2rem', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Welcome to Your <span className="header-grad">Analytics Hub</span>
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>
          Shorten long links, distribute QR codes, upload bulk sheets, and watch visual clicks insights.
        </p>
      </div>

      {/* Creation Grid: Create URL and CSV upload */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2rem',
        marginBottom: '3rem'
      }}>
        {/* Single URL form */}
        <GlassCard style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
            <Sparkles size={20} className="header-grad" />
            <h2 style={{ fontSize: '1.3rem', color: 'white' }}>Create Short Link</h2>
          </div>

          {formError && (
            <div className="badge badge-danger animate-fade-in" style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '8px', marginBottom: '1.2rem', display: 'flex', gap: '6px', alignItems: 'center' }}>
              <AlertTriangle size={15} style={{ flexShrink: 0 }} />
              <span>{formError}</span>
            </div>
          )}

          {successLink && (
            <div className="badge badge-success animate-fade-in" style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', marginBottom: '1.2rem', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start', wordBreak: 'break-all' }}>
              <span style={{ fontWeight: 'bold' }}>Success! Shortened Link:</span>
              <div style={{ display: 'flex', gap: '8px', width: '100%', alignItems: 'center' }}>
                <a href={successLink} target="_blank" rel="noreferrer" style={{ color: 'white', textDecoration: 'underline', fontWeight: 600, flex: 1 }}>{successLink}</a>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(successLink);
                    setCopyToast('Success Link');
                    setTimeout(() => setCopyToast(''), 2500);
                  }}
                  className="btn btn-secondary"
                  style={{ padding: '4px 8px', borderRadius: '6px' }}
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleShortenSubmit}>
            <div className="form-group">
              <label className="form-label">Destination URL (Required)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)', display: 'flex' }}>
                  <Link2 size={16} />
                </span>
                <input
                  type="text"
                  placeholder="https://example.com/very/long/destination/url"
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Custom Alias (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. promo-2026"
                  value={customAlias}
                  onChange={(e) => setCustomAlias(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Expiry Date (Optional)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="input-field"
                    style={{ paddingRight: '10px' }}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.8rem' }}>
              <Plus size={16} />
              <span>Create Link</span>
            </button>
          </form>
        </GlassCard>

        {/* Bulk URL text area form */}
        <GlassCard style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.2rem' }}>
              <Upload size={20} style={{ color: 'var(--color-violet)' }} />
              <h2 style={{ fontSize: '1.3rem', color: 'white' }}>Bulk URL Shortener</h2>
            </div>
            
            <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
              Enter multiple URLs to shorten at once. Paste your links below (<b>one URL per line</b>).
            </p>

            {bulkError && (
              <div className="badge badge-danger animate-fade-in" style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '8px', marginBottom: '1.2rem', display: 'flex', gap: '6px', alignItems: 'center' }}>
                <AlertTriangle size={15} style={{ flexShrink: 0 }} />
                <span>{bulkError}</span>
              </div>
            )}

            {bulkSuccessMsg && (
              <div className="badge badge-success animate-fade-in" style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '8px', marginBottom: '1.2rem', display: 'flex', gap: '6px', alignItems: 'center' }}>
                <Check size={15} style={{ flexShrink: 0 }} />
                <span>{bulkSuccessMsg}</span>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <textarea
                placeholder="https://example1.com&#10;https://example2.com&#10;https://example3.com"
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                className="input-field"
                style={{
                  height: '140px',
                  resize: 'none',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  lineHeight: '1.5',
                  padding: '12px'
                }}
                disabled={bulkLoading}
              />
            </div>
          </div>

          <button 
            onClick={handleBulkSubmit} 
            className="btn btn-violet" 
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={bulkLoading || !bulkText.trim()}
          >
            {bulkLoading ? 'Shortening Links...' : 'Shorten All URLs'}
          </button>
        </GlassCard>
      </div>

      {/* Library Table Section */}
      <GlassCard style={{ padding: '2rem', overflowX: 'auto' }}>
        <h2 style={{ fontSize: '1.4rem', color: 'white', marginBottom: '1.5rem', textAlign: 'left' }}>Your Link Library</h2>

        {loadingUrls ? (
          <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            Loading library content...
          </div>
        ) : fetchError ? (
          <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--color-error)' }}>
            Error: {fetchError}
          </div>
        ) : urls.length === 0 ? (
          <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            You haven't shortened any links yet. Enter a destination link above to begin!
          </div>
        ) : (
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left'
          }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                <th style={{ padding: '12px 16px' }}>Destination / Original URL</th>
                <th style={{ padding: '12px 16px' }}>Short Link</th>
                <th style={{ padding: '12px 16px' }}>Created</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Clicks</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {urls.map((url) => {
                const displayShortUrl = `${serverBaseUrl}/r/${url.shortCode}`;
                const createdStr = new Date(url.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                
                // Expiry Check status
                const isExpired = url.expiresAt && new Date(url.expiresAt) < new Date();

                return (
                  <tr 
                    key={url._id} 
                    style={{ 
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      fontSize: '0.9rem',
                      transition: 'var(--transition-smooth)'
                    }}
                    className="library-row-hover"
                  >
                    {/* Destination URL column */}
                    <td style={{ padding: '16px', maxWidth: '300px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: 'white', fontWeight: 500 }}>
                          {url.originalUrl}
                        </div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          {url.expiresAt && (
                            <span 
                              className={`badge ${isExpired ? 'badge-danger' : 'badge-success'}`}
                              style={{ fontSize: '0.65rem', padding: '1px 5px' }}
                            >
                              <Calendar size={10} />
                              <span>{isExpired ? 'Expired' : `Expires ${new Date(url.expiresAt).toLocaleDateString()}`}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Short Link column */}
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <a 
                          href={displayShortUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          style={{ color: 'var(--color-secondary)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <span>/r/{url.shortCode}</span>
                          <ExternalLink size={12} />
                        </a>
                        <button 
                          onClick={() => handleCopyLink(url.shortCode)} 
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-text-secondary)',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            transition: 'color 0.2s'
                          }}
                          className="copy-btn-hover"
                          title="Copy Link"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </td>

                    {/* Created Date column */}
                    <td style={{ padding: '16px', color: 'var(--color-text-secondary)' }}>
                      {createdStr}
                    </td>

                    {/* Clicks column */}
                    <td style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold', color: 'white' }}>
                      {url.clicksCount}
                    </td>

                    {/* Actions column */}
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      {confirmDeleteId === url._id ? (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-error)', fontWeight: 'bold' }}>Delete?</span>
                          <button 
                            onClick={() => handleDeleteUrl(url._id)} 
                            className="btn btn-danger" 
                            style={{ padding: '3px 8px', fontSize: '0.75rem', borderRadius: '6px' }}
                          >
                            Yes
                          </button>
                          <button 
                            onClick={() => setConfirmDeleteId(null)} 
                            className="btn btn-secondary" 
                            style={{ padding: '3px 8px', fontSize: '0.75rem', borderRadius: '6px' }}
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          {/* View Analytics */}
                          <button 
                            onClick={() => navigate(`/analytics/${url._id}`)} 
                            className="action-btn btn-secondary-icon" 
                            title="View Analytics"
                          >
                            <BarChart2 size={16} />
                          </button>
                          {/* QR Code */}
                          <button 
                            onClick={() => {
                              setActiveQrUrl(displayShortUrl);
                              setActiveQrOriginal(url.originalUrl);
                            }} 
                            className="action-btn btn-secondary-icon" 
                            title="QR Code"
                          >
                            <QrCode size={16} />
                          </button>
                          {/* Edit Target */}
                          <button 
                            onClick={() => setActiveEditUrl(url)} 
                            className="action-btn btn-secondary-icon" 
                            title="Edit URL"
                          >
                            <Edit3 size={16} />
                          </button>
                          {/* Delete Link confirmation initiation */}
                          <button 
                            onClick={() => setConfirmDeleteId(url._id)} 
                            className="action-btn btn-danger-icon" 
                            title="Delete Link"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </GlassCard>

      {/* QR Code Modal rendering */}
      {activeQrUrl && (
        <QrCodeModal 
          shortUrl={activeQrUrl}
          originalUrl={activeQrOriginal}
          onClose={() => {
            setActiveQrUrl(null);
            setActiveQrOriginal('');
          }}
        />
      )}

      {/* Edit URL Modal rendering */}
      {activeEditUrl && (
        <EditUrlModal
          urlItem={activeEditUrl}
          onSave={handleSaveEdit}
          onClose={() => setActiveEditUrl(null)}
        />
      )}

      <style>{`
        .library-row-hover:hover {
          background: rgba(255, 255, 255, 0.02);
        }
        .action-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: 1px solid var(--border-glass);
          background: rgba(255, 255, 255, 0.03);
          color: var(--color-text-secondary);
          transition: var(--transition-smooth);
        }
        .btn-secondary-icon:hover {
          color: white;
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.2);
        }
        .btn-danger-icon:hover {
          color: white;
          background: var(--color-error);
          border-color: var(--color-error);
          box-shadow: 0 4px 10px rgba(239, 68, 68, 0.2);
        }
        .copy-btn-hover:hover {
          color: var(--color-secondary) !important;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
