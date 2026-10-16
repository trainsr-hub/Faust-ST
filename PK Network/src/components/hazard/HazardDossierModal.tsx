import React from 'react';
import { HazardContender } from '../../types/hazard';

interface HazardDossierModalProps {
  contender: HazardContender | null;
  onClose: () => void;
}

export const HazardDossierModal: React.FC<HazardDossierModalProps> = ({
  contender,
  onClose
}) => {
  if (!contender) return null;

  return (
    <div className="hz-modal-backdrop" onClick={onClose}>
      <div className="hz-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="hz-modal-close" onClick={onClose} aria-label="Close">
          &times;
        </button>

        <div className="hz-modal-header">
          <div className="hz-modal-avatar-box">
            <img src={contender.avatarUrl} alt={contender.name} />
          </div>
          <div className="hz-modal-identity">
            <div className="hz-badge-row">
              <span className="hz-badge-seed">SEED #{contender.seed}</span>
              <span className="hz-badge-origin">{contender.origin}</span>
            </div>
            <h2 className="hz-modal-name">{contender.name}</h2>
            <p className="hz-modal-title">{contender.title}</p>
          </div>
        </div>

        <div className="hz-modal-body">
          <div>
            <h4 className="hz-modal-section-title">Contender Dossier</h4>
            <p className="hz-modal-bio">{contender.bio}</p>
          </div>

          {contender.album && contender.album.length > 0 && (
            <div>
              <h4 className="hz-modal-section-title">Verified Visual Matrix & Vault</h4>
              <div className="hz-album-grid">
                {contender.album.map((item) => (
                  <div key={item.id} className="hz-album-item" title={item.caption}>
                    <img src={item.url} alt={item.caption} />
                    <div className="hz-album-caption">{item.caption}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
