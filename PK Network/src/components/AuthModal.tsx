import React, { useState } from 'react';
import { Key, X, Check } from 'lucide-react';
import { getAuthKey, setAuthKey } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [key, setKey] = useState(getAuthKey());

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthKey(key.trim());
    onSaved();
    onClose();
  };

  const handleClear = () => {
    setAuthKey('');
    setKey('');
    onSaved();
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(4px)',
      padding: '1rem',
    }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-mid)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '420px',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border-light)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
            <Key size={16} color="var(--accent)" />
            <span>Vault Authentication (Passcode)</span>
          </div>
          <button className="btn icon-only" onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
            Enter your master passcode (configured as <code>APP_AUTH_KEY</code> on Cloudflare Worker) to unlock database mutations across phone and desktop.
          </p>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Master Key (X-App-Key)
            </label>
            <input
              type="password"
              className="input-base"
              style={{ width: '100%', fontFamily: 'var(--font-mono)' }}
              placeholder="Enter passcode..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
              autoFocus
            />
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.6rem',
            marginTop: '0.5rem',
          }}>
            {getAuthKey() && (
              <button type="button" className="btn danger" onClick={handleClear}>
                Clear Key
              </button>
            )}
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn primary">
              <Check size={14} />
              <span>Save Passcode</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
