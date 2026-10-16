import React from 'react';
import { User, ChevronRight } from 'lucide-react';
import { PromptEva } from '../../types/prompt';

interface ActiveEvaHeroCardProps {
  activeEva: PromptEva | null;
  onOpenSelector: () => void;
}

export const ActiveEvaHeroCard: React.FC<ActiveEvaHeroCardProps> = ({
  activeEva,
  onOpenSelector,
}) => {
  return (
    <div className="prompt-card">
      <div className="prompt-card-header">
        <div className="prompt-card-title">
          <User size={15} color="#c084fc" />
          <span>Active Eva Target</span>
        </div>
      </div>

      <button className="prompt-eva-hero" onClick={onOpenSelector}>
        {activeEva?.avatarUrl ? (
          <img src={activeEva.avatarUrl} alt={activeEva.name} className="prompt-eva-avatar" />
        ) : (
          <div className="prompt-eva-avatar">{activeEva?.name?.slice(0, 2).toUpperCase() || 'EV'}</div>
        )}
        <div className="prompt-eva-meta">
          <div className="prompt-eva-name">{activeEva?.tournamentName || 'Select Eva...'}</div>
          <div className="prompt-eva-sub">
            <span>{activeEva?.evaCodex || 'NO-CODEX'}</span>
            <span>•</span>
            <span>{activeEva?.affiliateIds.length || 0} Affiliates</span>
          </div>
        </div>
        <ChevronRight size={18} color="var(--text-dim)" />
      </button>
    </div>
  );
};
