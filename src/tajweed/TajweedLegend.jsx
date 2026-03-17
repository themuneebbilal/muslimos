import React, { useState } from 'react';
import { TAJWEED_COLORS } from './tajweedColors';
import { IconChevronDown } from '../components/Icons';

export default function TajweedLegend({ items, onJumpToRule }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="glass-card tajweed-legend">
      <button type="button" className="tajweed-legend-toggle" onClick={() => setOpen((value) => !value)}>
        <span>Color Legend</span>
        <IconChevronDown size={16} style={{ transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      {open && (
        <div className="tajweed-legend-grid">
          {items.map((key) => {
            const tone = TAJWEED_COLORS[key] || TAJWEED_COLORS.default;
            return (
              <button key={key} type="button" className="tajweed-legend-item" onClick={() => onJumpToRule?.(key)}>
                <span className="tajweed-dot" style={{ background: tone.color }} />
                <span>{tone.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
