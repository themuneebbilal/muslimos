import React, { useMemo } from 'react';
import { GUIDES } from '../data/guides/index.js';
import { IconBack, IconForward } from './Icons';
import { safeGetItem } from '../utils/safeStorage';

const ICON_COLORS = {
  emerald: { bg: 'var(--emerald-50)', color: 'var(--emerald-500)' },
  gold: { bg: 'var(--gold-100)', color: 'var(--gold-500)' },
  blue: { bg: 'var(--gold-100)', color: 'var(--gold-500)' },
  purple: { bg: 'rgba(11,107,79,0.1)', color: 'var(--emerald-600)' },
  gray: { bg: 'var(--bg-secondary)', color: 'var(--text-secondary)' },
};

const GUIDE_ICONS = {
  prayer: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2c-1 4-5 5.5-5 10a5 5 0 0010 0c0-4.5-4-6-5-10z"/>
      <path d="M10 15c0 1.1.9 2 2 2s2-.9 2-2" opacity={0.5}/>
    </svg>
  ),
  water: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/>
    </svg>
  ),
  moon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
    </svg>
  ),
  star: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
    </svg>
  ),
  hands: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 20c0-4 1-6 3-8 1.5-1.5 2-3 2-5V4"/>
      <path d="M17 20c0-4-1-6-3-8-1.5-1.5-2-3-2-5V4"/>
      <path d="M5 20h14"/>
    </svg>
  ),
  celebration: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01z"/>
    </svg>
  ),
  kaaba: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="6" width="16" height="14" rx="1"/>
      <path d="M4 6l8-4 8 4"/>
      <path d="M10 13h4v7h-4z" opacity={0.5}/>
    </svg>
  ),
};

export default function LearnPage({ onOpenGuide, onBack }) {
  const recents = useMemo(() => {
    const map = {};
    GUIDES.forEach((guide) => {
      const saved = safeGetItem(`mos_guide_${guide.id}_last_step`, null);
      map[guide.id] = saved ? parseInt(saved, 10) : null;
    });
    return map;
  }, []);

  return (
    <div className="learnv3 animate-fade-up">
      <div className="learnv3-header">
        {onBack && (
          <button className="back-btn" onClick={onBack}>
            <IconBack size={16} />
          </button>
        )}
        <div>
          <div className="page-title" style={{ padding: 0 }}>Learn</div>
          <div className="page-subtitle" style={{ padding: 0, color: 'var(--gold-500)' }}>عِلْمٌ نَافِع</div>
        </div>
      </div>

      <section className="learnv3-hero settingsv2-panel settingsv2-panel-hero">
        <div className="settingsv2-watermark">عِلْم</div>
        <div className="settingsv2-label">Knowledge Library</div>
        <h2>Guides for practice, revision, and return.</h2>
        <p>Open any topic like a handbook. Guided progress is there when you want structure, not as the default frame for sacred knowledge.</p>

        <div className="learnv3-hero-meta">
          <div className="learnv3-hero-metric">
            <strong>{GUIDES.length}</strong>
            <span>Guides</span>
          </div>
          <div className="learnv3-hero-metric">
            <strong>Reference</strong>
            <span>Default mode</span>
          </div>
          <div className="learnv3-hero-metric">
            <strong>Optional</strong>
            <span>Guided mode</span>
          </div>
        </div>
      </section>

      <section className="learnv3-overview">
        <article className="learnv3-feature glass-card">
          <div className="learnv3-feature-label">كيف تقرأها</div>
          <div className="learnv3-feature-row">
            <div>
              <div className="learnv3-feature-title">Open any guide like a reference companion</div>
              <div className="learnv3-feature-copy">Move freely between sections, revisit practical steps, and switch to guided mode only when you want a structured walkthrough.</div>
            </div>
            <div className="learnv3-feature-pill">Open-ended</div>
          </div>
        </article>
      </section>

      <div className="learnv3-grid">
        {GUIDES.map((guide, i) => {
          const colors = ICON_COLORS[guide.color] || ICON_COLORS.emerald;
          const icon = GUIDE_ICONS[guide.icon];
          const lastStep = recents[guide.id];

          return (
            <button
              key={guide.id}
              type="button"
              className={`learnv3-card glass-card pressable f${Math.min(i + 3, 12)}`}
              onClick={() => onOpenGuide(guide.id)}
            >
              <div className="learnv3-card-top">
                <div
                  className="learnv3-card-icon"
                  style={{ background: colors.bg, color: colors.color }}
                >
                  {icon}
                </div>
                <div className="learnv3-card-step">
                  {guide.stepCount} sections
                </div>
              </div>

              <div className="learnv3-card-body">
                <div className="learnv3-card-title-row">
                  <div className="learnv3-card-title font-amiri">{guide.title}</div>
                  <div className="learnv3-card-ar font-amiri">{guide.titleAr}</div>
                </div>
                <div className="learnv3-card-desc">{guide.desc}</div>
              </div>

              <div className="learnv3-card-footer">
                <div className="learnv3-card-state">
                  <span>{lastStep ? `Last viewed section ${lastStep}` : 'Open guide'}</span>
                  <IconForward size={14} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
