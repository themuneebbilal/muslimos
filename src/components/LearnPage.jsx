import React, { useMemo } from 'react';
import { GUIDES } from '../data/guides/index.js';
import { IconBack, IconForward } from './Icons';

const ICON_COLORS = {
  emerald: { bg: 'var(--emerald-50)', color: 'var(--emerald-500)' },
  gold: { bg: 'var(--gold-100)', color: 'var(--gold-500)' },
  blue: { bg: 'rgba(59,130,246,0.1)', color: '#3B82F6' },
  purple: { bg: 'rgba(139,92,246,0.1)', color: '#8B5CF6' },
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
  const progress = useMemo(() => {
    const p = {};
    GUIDES.forEach(g => {
      const saved = localStorage.getItem(`mos_guide_${g.id}_step`);
      p[g.id] = saved ? parseInt(saved) : 0;
    });
    return p;
  }, []);

  return (
    <div className="animate-fade-up guide-page">
      <div className="page-title f1" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
        {onBack && (
          <button className="back-btn" onClick={onBack} style={{ marginRight: 'var(--sp-1)' }}>
            <IconBack size={16} />
          </button>
        )}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--emerald-500)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
        </svg>
        Learn
      </div>
      <div className="page-subtitle f2">Step-by-step Islamic guides</div>

      <div className="guide-list" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', marginTop: 'var(--sp-3)' }}>
        {GUIDES.map((guide, i) => {
          const colors = ICON_COLORS[guide.color] || ICON_COLORS.emerald;
          const icon = GUIDE_ICONS[guide.icon];
          const completed = progress[guide.id] || 0;
          const pct = Math.round((completed / guide.stepCount) * 100);
          const isStarted = completed > 0;

          return (
            <div
              key={guide.id}
              className={`glass-card pressable f${Math.min(i + 3, 12)}`}
              onClick={() => onOpenGuide(guide.id)}
              style={{ padding: 'var(--sp-4)', marginBottom: 0, cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--r-md)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: colors.bg, color: colors.color, flexShrink: 0,
                }}>
                  {icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--sp-2)' }}>
                    <div className="font-amiri" style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--emerald-700)' }}>
                      {guide.title}
                    </div>
                    <div className="font-amiri" style={{ fontSize: 'var(--text-sm)', color: 'var(--gold-400)', flexShrink: 0 }}>
                      {guide.titleAr}
                    </div>
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2, lineHeight: 1.4 }}>
                    {guide.desc}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginTop: 'var(--sp-2)' }}>
                    <div className="guide-progress-bar" style={{ flex: 1 }}>
                      <div className="guide-progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <div style={{ fontSize: '0.65rem', color: isStarted ? 'var(--emerald-500)' : 'var(--text-tertiary)', fontWeight: 600, flexShrink: 0 }}>
                      {isStarted ? `${completed}/${guide.stepCount}` : `${guide.stepCount} steps`}
                    </div>
                    <IconForward size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
