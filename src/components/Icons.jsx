import React from 'react';

const I = ({ children, size = 20, className = '', style = {}, ...p }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth={1.5}
    strokeLinecap="round" strokeLinejoin="round"
    className={className} style={style} {...p}
  >{children}</svg>
);

// ── Navigation ──
export const IconHome = (p) => (
  <I {...p}>
    <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1z"/>
    <path d="M12 3v3" opacity={0.4}/>
    <path d="M9 21v-6h6v6"/>
  </I>
);

export const IconQuran = (p) => (
  <I {...p}>
    <path d="M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5z"/>
    <path d="M4 17.5A2.5 2.5 0 016.5 15H20"/>
    <path d="M12 6v6M9.5 9h5" strokeWidth={1.2} opacity={0.5}/>
  </I>
);

export const IconWorship = (p) => (
  <I {...p}>
    <path d="M12 2C10 6 4 8 4 14c0 4 3.5 8 8 8s8-4 8-8c0-6-6-8-8-12z"/>
    <path d="M12 22v-4" opacity={0.4}/>
    <path d="M9 18c0-1.657 1.343-3 3-3s3 1.343 3 3" opacity={0.4}/>
  </I>
);

export const IconHadith = (p) => (
  <I {...p}>
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <path d="M14 2v6h6"/>
    <path d="M8 13h8M8 17h5" opacity={0.5}/>
  </I>
);

export const IconMore = (p) => (
  <I {...p}>
    <circle cx="12" cy="5" r="1" fill="currentColor" stroke="none"/>
    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>
    <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none"/>
  </I>
);

export const IconHamburger = (p) => (
  <I {...p}>
    <path d="M4 7h16"/>
    <path d="M4 12h16"/>
    <path d="M4 17h16"/>
  </I>
);

// ── Actions ──
export const IconPlay = (p) => (
  <I {...p}><polygon points="6,3 20,12 6,21" fill="currentColor" stroke="none"/></I>
);

export const IconPause = (p) => (
  <I {...p}>
    <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none"/>
    <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none"/>
  </I>
);

export const IconSearch = (p) => (
  <I {...p}>
    <circle cx="11" cy="11" r="7"/>
    <path d="M21 21l-4.35-4.35"/>
  </I>
);

export const IconBack = (p) => (
  <I {...p}><path d="M15 18l-6-6 6-6"/></I>
);

export const IconForward = (p) => (
  <I {...p}><path d="M9 18l6-6-6-6"/></I>
);

export const IconClose = (p) => (
  <I {...p}><path d="M18 6L6 18M6 6l12 12"/></I>
);

export const IconSettings = (p) => (
  <I {...p}>
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
  </I>
);

export const IconCheck = (p) => (
  <I {...p}><path d="M20 6L9 17l-5-5"/></I>
);

export const IconBookmark = (p) => (
  <I {...p}><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></I>
);

export const IconBookmarkFilled = (p) => (
  <I {...p}><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" fill="currentColor"/></I>
);

export const IconShare = (p) => (
  <I {...p}>
    <circle cx="18" cy="5" r="3"/>
    <circle cx="6" cy="12" r="3"/>
    <circle cx="18" cy="19" r="3"/>
    <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>
  </I>
);

export const IconCopy = (p) => (
  <I {...p}>
    <rect x="9" y="9" width="13" height="13" rx="2"/>
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
  </I>
);

export const IconMenu = (p) => (
  <I {...p}>
    <circle cx="12" cy="5" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="12" cy="19" r="1.5" fill="currentColor" stroke="none"/>
  </I>
);

export const IconFont = (p) => (
  <I {...p}>
    <path d="M4 7V4h16v3"/>
    <path d="M12 4v16"/>
    <path d="M8 20h8"/>
  </I>
);

export const IconHeart = (p) => (
  <I {...p}>
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </I>
);

// ── Content ──
export const IconCrescent = (p) => (
  <I {...p}>
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </I>
);

export const IconCompass = (p) => (
  <I {...p}>
    <circle cx="12" cy="12" r="10"/>
    <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88"/>
  </I>
);

export const IconCalendar = (p) => (
  <I {...p}>
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <path d="M16 2v4M8 2v4M3 10h18"/>
    <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" strokeWidth={2}/>
  </I>
);

export const IconJournal = (p) => (
  <I {...p}>
    <path d="M6 3h9a3 3 0 0 1 3 3v15H9a3 3 0 0 0-3 3z"/>
    <path d="M6 3v18"/>
    <path d="M10 8h5M10 12h5M10 16h3" opacity={0.5}/>
  </I>
);

export const IconClock = (p) => (
  <I {...p}>
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 6v6l4 2"/>
  </I>
);

export const IconVolume = (p) => (
  <I {...p}>
    <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="currentColor" stroke="none"/>
    <path d="M15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14"/>
  </I>
);

export const IconSkipForward = (p) => (
  <I {...p}>
    <polygon points="5,4 15,12 5,20" fill="currentColor" stroke="none"/>
    <line x1="19" y1="5" x2="19" y2="19" strokeWidth={2}/>
  </I>
);

export const IconSkipBack = (p) => (
  <I {...p}>
    <polygon points="19,20 9,12 19,4" fill="currentColor" stroke="none"/>
    <line x1="5" y1="5" x2="5" y2="19" strokeWidth={2}/>
  </I>
);

export const IconChevronDown = (p) => (
  <I {...p}><path d="M6 9l6 6 6-6"/></I>
);

export const IconChevronUp = (p) => (
  <I {...p}><path d="M18 15l-6-6-6 6"/></I>
);

export const IconRefresh = (p) => (
  <I {...p}>
    <path d="M23 4v6h-6"/>
    <path d="M1 20v-6h6"/>
    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
  </I>
);

export const IconStar = (p) => (
  <I {...p}>
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
  </I>
);

export const IconPrayer = (p) => (
  <I {...p}>
    <path d="M12 2c-1 4-5 5.5-5 10a5 5 0 0010 0c0-4.5-4-6-5-10z"/>
    <path d="M10 15c0 1.1.9 2 2 2s2-.9 2-2" opacity={0.5}/>
  </I>
);

export const IconShield = (p) => (
  <I {...p}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </I>
);

export const IconSunrise = (p) => (
  <I {...p}>
    <path d="M17 18a5 5 0 00-10 0"/>
    <line x1="12" y1="9" x2="12" y2="2"/>
    <line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/>
    <line x1="1" y1="18" x2="3" y2="18"/>
    <line x1="21" y1="18" x2="23" y2="18"/>
    <line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/>
    <line x1="23" y1="22" x2="1" y2="22"/>
  </I>
);

export const IconMoon = (p) => (
  <I {...p}>
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </I>
);

export const IconLeaf = (p) => (
  <I {...p}>
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 0-8 1-8 1"/>
    <path d="M11 12c2-2.4 5-3.5 7.5-4" opacity={0.5}/>
  </I>
);

export const IconDua = (p) => (
  <I {...p}>
    <path d="M7 20c0-4 1-6 3-8 1.5-1.5 2-3 2-5V4"/>
    <path d="M17 20c0-4-1-6-3-8-1.5-1.5-2-3-2-5V4"/>
    <path d="M5 20h14"/>
    <circle cx="12" cy="3" r="1" fill="currentColor" stroke="none"/>
  </I>
);

export const IconGrid = (p) => (
  <I {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1.5"/>
    <rect x="14" y="3" width="7" height="7" rx="1.5"/>
    <rect x="3" y="14" width="7" height="7" rx="1.5"/>
    <rect x="14" y="14" width="7" height="7" rx="1.5"/>
  </I>
);

export const IconList = (p) => (
  <I {...p}>
    <line x1="8" y1="6" x2="21" y2="6"/>
    <line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/>
    <circle cx="4" cy="6" r="1" fill="currentColor" stroke="none"/>
    <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none"/>
    <circle cx="4" cy="18" r="1" fill="currentColor" stroke="none"/>
  </I>
);

export const IconAutoScroll = (p) => (
  <I {...p}>
    <path d="M12 5v14"/>
    <path d="M19 12l-7 7-7-7"/>
  </I>
);

export const IconSpeed = (p) => (
  <I {...p}>
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8"/>
  </I>
);

export const IconSun = (p) => (
  <I {...p}>
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </I>
);

export const IconFlame = (p) => (
  <I {...p}>
    <path d="M12 2C10 6 4 8 4 14c0 4 3.5 8 8 8s8-4 8-8c0-6-6-8-8-12z"/>
    <path d="M12 22c-2 0-4-1.5-4-4 0-3 2-4 4-7 2 3 4 4 4 7 0 2.5-2 4-4 4z" fill="currentColor" opacity={0.3} stroke="none"/>
  </I>
);

export const IconLightning = (p) => (
  <I {...p}>
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8" fill="currentColor" stroke="none" opacity={0.2}/>
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8"/>
  </I>
);

export const IconHands = (p) => (
  <I {...p}>
    <path d="M7 20c0-4 1-6 3-8 1.5-1.5 2-3 2-5V4"/>
    <path d="M17 20c0-4-1-6-3-8-1.5-1.5-2-3-2-5V4"/>
    <path d="M5 20h14"/>
    <path d="M9 6c0 1.5.5 3 1.5 4.5M15 6c0 1.5-.5 3-1.5 4.5" opacity={0.4}/>
  </I>
);

export const IconCollection = (p) => (
  <I {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2"/>
    <path d="M3 10h18"/>
    <path d="M7 3v4M17 3v4"/>
    <path d="M10 14h4M12 12v4" opacity={0.5}/>
  </I>
);

export const IconImage = (p) => (
  <I {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <path d="M21 15l-5-5L5 21"/>
  </I>
);

export const IconTrash = (p) => (
  <I {...p}>
    <path d="M3 6h18"/>
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/>
    <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
  </I>
);

export const IconPlus = (p) => (
  <I {...p}>
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </I>
);

export const IconEdit = (p) => (
  <I {...p}>
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </I>
);

export const IconTarget = (p) => (
  <I {...p}>
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </I>
);

export const IconLearn = (p) => (
  <I {...p}>
    <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
  </I>
);
