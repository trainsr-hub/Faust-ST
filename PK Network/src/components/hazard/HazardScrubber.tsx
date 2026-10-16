import React from 'react';

interface HazardScrubberProps {
  activeRound: string;
  onSelectRound: (round: string) => void;
  statusText: string;
}

export const HazardScrubber: React.FC<HazardScrubberProps> = ({
  activeRound,
  onSelectRound,
  statusText
}) => {
  const steps = [
    { id: 'all', label: 'All Stages' },
    { id: '1', label: 'Round of 16' },
    { id: '2', label: 'Quarterfinals' },
    { id: '3', label: 'Semifinals' },
    { id: '4', label: 'Grand Finals' }
  ];

  return (
    <div className="hazard-scrubber-bar">
      <div className="hazard-timeline-group">
        <span className="hazard-timeline-title">ROUND:</span>
        {steps.map((s) => (
          <button
            key={s.id}
            className={`hazard-step-btn ${activeRound === s.id ? 'active' : ''}`}
            onClick={() => onSelectRound(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="hazard-telemetry-bar">
        <span className="hazard-telemetry-dot" />
        <span>{statusText}</span>
      </div>
    </div>
  );
};
