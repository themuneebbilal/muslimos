import React from 'react';
import { TAJWEED_COLORS } from './tajweedColors';
import { IconClose, IconPlay } from '../components/Icons';

export default function TajweedWordPopup({ word, onClose, onPlay }) {
  if (!word) return null;
  const tone = TAJWEED_COLORS[word.ruleKey] || TAJWEED_COLORS.default;

  return (
    <div className="tajweed-popup-shell" onClick={onClose}>
      <div className="glass-card tajweed-popup" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="tajweed-popup-close" onClick={onClose}>
          <IconClose size={16} />
        </button>
        <div className="tajweed-popup-word font-amiri" style={{ color: tone.color }} dangerouslySetInnerHTML={{ __html: word.html }} />
        <div className="tajweed-popup-rule">
          {tone.label} {word.ruleText ? `- ${word.ruleText}` : ''}
        </div>
        <div className="tajweed-popup-translit">{word.transliteration || 'Transliteration unavailable'}</div>
        <button type="button" className="tajweed-audio-btn" onClick={onPlay}>
          <IconPlay size={14} />
          Play Word
        </button>
      </div>
    </div>
  );
}
