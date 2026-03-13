import React from 'react';

// Abstract SVG prayer position silhouettes
// Islamic art sensibility — no detailed human features

const base = { display: 'block', margin: '0 auto' };

export function Standing({ size = 120, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" style={{ ...base, ...style }}>
      <circle cx="60" cy="22" r="10" fill="var(--emerald-200)" opacity={0.6} />
      <line x1="60" y1="32" x2="60" y2="72" stroke="var(--emerald-400)" strokeWidth="3" strokeLinecap="round" />
      <line x1="60" y1="48" x2="44" y2="62" stroke="var(--emerald-400)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="60" y1="48" x2="76" y2="62" stroke="var(--emerald-400)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="60" y1="72" x2="48" y2="100" stroke="var(--emerald-400)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="60" y1="72" x2="72" y2="100" stroke="var(--emerald-400)" strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="60" cy="108" rx="20" ry="3" fill="var(--emerald-100)" opacity={0.4} />
    </svg>
  );
}

export function Bowing({ size = 120, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" style={{ ...base, ...style }}>
      <circle cx="38" cy="38" r="9" fill="var(--emerald-200)" opacity={0.6} />
      <path d="M47 40 L78 52" stroke="var(--emerald-400)" strokeWidth="3" strokeLinecap="round" />
      <line x1="78" y1="52" x2="78" y2="90" stroke="var(--emerald-400)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="47" y1="42" x2="36" y2="56" stroke="var(--emerald-400)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="78" y1="90" x2="68" y2="105" stroke="var(--emerald-400)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="78" y1="90" x2="88" y2="105" stroke="var(--emerald-400)" strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="68" cy="108" rx="24" ry="3" fill="var(--emerald-100)" opacity={0.4} />
    </svg>
  );
}

export function Prostrating({ size = 120, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" style={{ ...base, ...style }}>
      <circle cx="28" cy="80" r="8" fill="var(--emerald-200)" opacity={0.6} />
      <path d="M36 82 L60 68 Q70 60 80 68" stroke="var(--emerald-400)" strokeWidth="3" strokeLinecap="round" fill="none" />
      <line x1="80" y1="68" x2="88" y2="90" stroke="var(--emerald-400)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="88" y1="90" x2="95" y2="82" stroke="var(--emerald-400)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="28" y1="88" x2="22" y2="96" stroke="var(--emerald-400)" strokeWidth="2" strokeLinecap="round" />
      <line x1="28" y1="88" x2="34" y2="96" stroke="var(--emerald-400)" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="60" cy="100" rx="38" ry="3" fill="var(--emerald-100)" opacity={0.4} />
    </svg>
  );
}

export function Sitting({ size = 120, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" style={{ ...base, ...style }}>
      <circle cx="60" cy="28" r="9" fill="var(--emerald-200)" opacity={0.6} />
      <line x1="60" y1="37" x2="60" y2="68" stroke="var(--emerald-400)" strokeWidth="3" strokeLinecap="round" />
      <line x1="60" y1="50" x2="46" y2="62" stroke="var(--emerald-400)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="60" y1="50" x2="74" y2="62" stroke="var(--emerald-400)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M60 68 Q55 82 42 90 L36 96" stroke="var(--emerald-400)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M60 68 Q65 82 78 90 L84 96" stroke="var(--emerald-400)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <ellipse cx="60" cy="100" rx="28" ry="3" fill="var(--emerald-100)" opacity={0.4} />
    </svg>
  );
}

export function HandsRaised({ size = 120, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" style={{ ...base, ...style }}>
      <circle cx="60" cy="30" r="10" fill="var(--emerald-200)" opacity={0.6} />
      <line x1="60" y1="40" x2="60" y2="78" stroke="var(--emerald-400)" strokeWidth="3" strokeLinecap="round" />
      <line x1="60" y1="50" x2="40" y2="28" stroke="var(--emerald-400)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="60" y1="50" x2="80" y2="28" stroke="var(--emerald-400)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="38" cy="24" r="4" fill="var(--emerald-300)" opacity={0.4} />
      <circle cx="82" cy="24" r="4" fill="var(--emerald-300)" opacity={0.4} />
      <line x1="60" y1="78" x2="48" y2="104" stroke="var(--emerald-400)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="60" y1="78" x2="72" y2="104" stroke="var(--emerald-400)" strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="60" cy="108" rx="20" ry="3" fill="var(--emerald-100)" opacity={0.4} />
    </svg>
  );
}

export function Walking({ size = 120, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" style={{ ...base, ...style }}>
      <circle cx="58" cy="20" r="9" fill="var(--emerald-200)" opacity={0.6} />
      <line x1="58" y1="29" x2="58" y2="65" stroke="var(--emerald-400)" strokeWidth="3" strokeLinecap="round" />
      <line x1="58" y1="44" x2="42" y2="56" stroke="var(--emerald-400)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="58" y1="44" x2="74" y2="52" stroke="var(--emerald-400)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="58" y1="65" x2="44" y2="100" stroke="var(--emerald-400)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="58" y1="65" x2="74" y2="100" stroke="var(--emerald-400)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M36 100 L44 100" stroke="var(--emerald-400)" strokeWidth="2" strokeLinecap="round" />
      <path d="M74 100 L82 100" stroke="var(--emerald-400)" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="60" cy="106" rx="26" ry="3" fill="var(--emerald-100)" opacity={0.4} />
    </svg>
  );
}

const ILLUSTRATIONS = {
  standing: Standing,
  bowing: Bowing,
  prostrating: Prostrating,
  sitting: Sitting,
  'hands-raised': HandsRaised,
  walking: Walking,
};

export default function GuideIllustration({ type, size = 120, style = {} }) {
  const Component = ILLUSTRATIONS[type] || Standing;
  return <Component size={size} style={style} />;
}
