import React, { useState } from 'react';
import { X, Save, Edit } from 'lucide-react';
import GlassCard from './GlassCard';

const EditUrlModal = ({ urlItem, onSave, onClose }) => {
  const [originalUrl, setOriginalUrl] = useState(urlItem.originalUrl);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!originalUrl.trim()) {
      setError('Destination URL is required');
      return;
    }

    try {
      new URL(originalUrl.trim());
    } catch (err) {
      setError('Invalid URL format. Please include http:// or https://');
      return;
    }

    setSaving(true);
    try {
      await onSave(urlItem._id, originalUrl.trim());
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update URL destination');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <GlassCard 
        className="modal-content animate-slide-up" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '450px', textAlign: 'left' }}
      >
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.2rem' }}>
          <Edit className="header-grad" size={22} />
          <h2 style={{ fontSize: '1.4rem', color: 'white', fontWeight: 700 }}>Edit Destination</h2>
        </div>

        <p style={{ fontSize: '0.85rem', marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>
          Update the destination address for shortcode <b>/r/{urlItem.shortCode}</b>. Existing links will redirect to the new URL instantly.
        </p>

        {error && (
          <div className="badge badge-danger animate-fade-in" style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '8px', marginBottom: '1.2rem', display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Destination URL</label>
            <input
              type="text"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              className="input-field"
              disabled={saving}
              autoFocus
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              onClick={onClose} 
              className="btn btn-secondary"
              style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}
              disabled={saving}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}
              disabled={saving}
            >
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};

export default EditUrlModal;
