import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, ArrowRight, Loader2, KeyRound, Sparkles } from 'lucide-react';
import { api, setAuthKey } from '../services/api';

interface VaultGateProps {
  onUnlocked: () => void;
  initialKey?: string;
}

export const VaultGate: React.FC<VaultGateProps> = ({ onUnlocked, initialKey = '' }) => {
  const [passcode, setPasscode] = useState(initialKey);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanKey = passcode.trim();
    if (!cleanKey) {
      setErrorMsg('Please enter the vault passcode.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await api.verifyAuth(cleanKey);
      if (res.success && (res.authorized || res.required === false)) {
        setAuthKey(cleanKey);
        onUnlocked();
      } else {
        setErrorMsg('Invalid passcode. Access denied by Edge Guard.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed. Please check connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialKey) {
      handleSubmit();
    }
  }, [initialKey]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 20%, #161b26 0%, #080a0f 100%)',
      padding: '1.25rem',
      fontFamily: 'var(--font-sans, system-ui, sans-serif)',
      color: 'var(--text-primary, #f0f4f8)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'rgba(17, 24, 39, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '2.25rem 2rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(59, 130, 246, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle Edge Glow Bar */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '15%',
          right: '15%',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #3b82f6, #60a5fa, transparent)',
        }} />

        {/* Brand & Emblem */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 1.25rem',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.3) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 24px rgba(59, 130, 246, 0.25)',
          }}>
            <Lock size={28} color="#60a5fa" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', color: '#f8fafc' }}>
              PK Network
            </span>
            <span style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '999px',
              background: 'rgba(59, 130, 246, 0.2)',
              color: '#93c5fd',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Vault Gate
            </span>
          </div>

          <p style={{
            fontSize: '13px',
            color: '#94a3b8',
            lineHeight: 1.5,
            margin: 0,
          }}>
            Enter your secret master passcode to unlock Turso Cloud SQLite.
          </p>
        </div>

        {/* Input Form with Monolithic Hitbox */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
            }}>
              <KeyRound size={18} />
            </div>

            <input
              type="password"
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="Enter master passcode..."
              autoFocus
              disabled={isLoading}
              style={{
                width: '100%',
                minHeight: '56px',
                padding: '0 1rem 0 3rem',
                fontSize: '15px',
                fontFamily: 'var(--font-mono, monospace)',
                color: '#ffffff',
                background: 'rgba(15, 23, 42, 0.8)',
                border: errorMsg ? '1.5px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'all 0.2s ease',
                boxShadow: errorMsg ? '0 0 12px rgba(239, 68, 68, 0.2)' : 'inset 0 2px 4px rgba(0, 0, 0, 0.4)',
              }}
            />
          </div>

          {errorMsg && (
            <div style={{
              fontSize: '12px',
              color: '#f87171',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '8px',
              padding: '0.6rem 0.8rem',
              lineHeight: 1.4,
              textAlign: 'center',
            }}>
              {errorMsg}
            </div>
          )}

          {/* Monolithic Action Button */}
          <button
            type="submit"
            disabled={isLoading || !passcode.trim()}
            style={{
              minHeight: '52px',
              width: '100%',
              borderRadius: '14px',
              border: 'none',
              background: isLoading || !passcode.trim()
                ? 'rgba(59, 130, 246, 0.25)'
                : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: isLoading || !passcode.trim() ? '#64748b' : '#ffffff',
              fontSize: '15px',
              fontWeight: 600,
              cursor: isLoading || !passcode.trim() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              transition: 'all 0.2s ease',
              boxShadow: isLoading || !passcode.trim() ? 'none' : '0 4px 16px rgba(37, 99, 235, 0.4)',
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="spin" />
                <span>Verifying with Edge...</span>
              </>
            ) : (
              <>
                <span>Unlock Vault</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Security Feature Badges */}
        <div style={{
          marginTop: '1.75rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: '#64748b',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ShieldCheck size={14} color="#10b981" />
            <span>Persistent Device Session</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Sparkles size={13} color="#60a5fa" />
            <span>0ms Edge Validation</span>
          </div>
        </div>
      </div>
    </div>
  );
};
