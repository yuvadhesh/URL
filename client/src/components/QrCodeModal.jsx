import React, { useEffect, useState } from 'react';
import { toDataURL } from 'qrcode';
import { X, Download, QrCode } from 'lucide-react';
import GlassCard from './GlassCard';

const QrCodeModal = ({ shortUrl, originalUrl, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    if (shortUrl) {
      toDataURL(
        shortUrl,
        {
          width: 300,
          margin: 2,
          color: {
            dark: '#070a13', // Deep midnight
            light: '#ffffff', // White background for optimal scanning
          },
          errorCorrectionLevel: 'H',
        },
        (err, url) => {
          if (err) {
            console.error('Error generating QR Code:', err);
          } else {
            setQrDataUrl(url);
          }
        }
      );
    }
  }, [shortUrl]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `qrcode-${shortUrl.split('/').pop()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <GlassCard 
        className="modal-content animate-slide-up" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
          <QrCode className="header-grad" size={24} />
          <h2 style={{ fontSize: '1.5rem', color: 'white' }}>QR Code Generator</h2>
        </div>

        <p style={{ fontSize: '0.85rem', marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>
          Scan to access destination URL or download for public sharing.
        </p>

        <div style={{
          background: 'white',
          padding: '12px',
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          display: 'inline-block',
          marginBottom: '1.5rem'
        }}>
          {qrDataUrl ? (
            <img 
              src={qrDataUrl} 
              alt="Shortened URL QR Code" 
              style={{ width: '260px', height: '260px', display: 'block' }}
            />
          ) : (
            <div style={{ width: '260px', height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#070a13' }}>
              Generating...
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--color-secondary)', wordBreak: 'break-all', fontWeight: 600 }}>
            {shortUrl}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%', padding: '0 8px' }}>
            Original: {originalUrl}
          </p>

          <button 
            onClick={handleDownload} 
            className="btn btn-primary" 
            style={{ marginTop: '1rem', width: '100%' }}
            disabled={!qrDataUrl}
          >
            <Download size={18} />
            <span>Download PNG</span>
          </button>
        </div>
      </GlassCard>
    </div>
  );
};

export default QrCodeModal;
