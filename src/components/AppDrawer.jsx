import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CALC_METHODS } from '../utils/prayerCalc';
import { getHomeGreeting, formatHomeLocation } from '../utils/homePageUtils';
import { getStreakData } from '../utils/streakTracker';
import {
  IconBack,
  IconCalendar,
  IconCompass,
  IconHadith,
  IconHeart,
  IconHome,
  IconLearn,
  IconPrayer,
  IconQuran,
  IconSettings,
  IconWorship,
} from './Icons';

const MAIN_NAV = [
  { id: 'home', label: 'Home', Icon: IconHome },
  { id: 'quran', label: 'Quran', Icon: IconQuran },
  { id: 'worship', label: 'Worship', Icon: IconWorship },
  { id: 'hadith', label: 'Hadith', Icon: IconHadith },
];

const GUIDES = [
  { id: 'salah', label: 'How to Pray' },
  { id: 'wudu', label: 'Wudu' },
  { id: 'taraweeh', label: 'Taraweeh' },
  { id: 'umrah', label: 'Umrah' },
  { id: 'hajj', label: 'Hajj' },
  { id: 'janazah', label: 'Janazah' },
  { id: 'eid', label: 'Eid Prayer' },
  { id: 'witr', label: 'Witr' },
];

export default function AppDrawer({
  open,
  onClose,
  activePage,
  onNavigate,
  onOpenGuide,
  onOpenQibla,
  location,
  onOpenSettings,
}) {
  const touchStartX = useRef(null);
  const greeting = useMemo(() => getHomeGreeting(), []);
  const city = useMemo(() => formatHomeLocation(location.label), [location]);
  const streak = useMemo(() => getStreakData(), [open]);

  useEffect(() => {
    if (!open) return undefined;
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  function handleTouchStart(event) {
    touchStartX.current = event.touches[0]?.clientX || null;
  }

  function handleTouchEnd(event) {
    const startX = touchStartX.current;
    const endX = event.changedTouches[0]?.clientX || 0;
    if (startX !== null && startX - endX > 60) {
      onClose();
    }
    touchStartX.current = null;
  }

  const drawerRow = (icon, tone, label, subtitle, onClick, active = false, trailing = null) => (
    <button
      type="button"
      onClick={onClick}
      className={`appdrawer-row${active ? ' active' : ''}`}
    >
      <span className={`appdrawer-icon appdrawer-icon-${tone}`}>{icon}</span>
      <span className="appdrawer-copy">
        <strong>{label}</strong>
        {subtitle ? <small>{subtitle}</small> : null}
      </span>
      {trailing}
    </button>
  );

  return (
    <>
      <div className={`appdrawer-overlay${open ? ' open' : ''}`} onClick={onClose} />
      <aside
        className={`appdrawer${open ? ' open' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-hidden={!open}
      >
        <div className="appdrawer-top">
          <button type="button" className="appdrawer-close" onClick={onClose} aria-label="Close menu">
            <IconBack size={18} />
          </button>
          <div className="appdrawer-user">
            <div className="appdrawer-user-card glass-card">
              <div className="appdrawer-greeting">{greeting}</div>
              <div className="appdrawer-city">{city}</div>
              <div className="appdrawer-streak">{streak.current} day streak</div>
            </div>
            <div className="appdrawer-hero-note">
              Quick routes, learning paths, and tools without leaving the flow.
            </div>
          </div>
        </div>

        <div className="appdrawer-section">
          <div className="appdrawer-label">Navigation</div>
          <div className="appdrawer-nav-grid">
            {MAIN_NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`appdrawer-nav-chip${activePage === item.id ? ' active' : ''}`}
                onClick={() => onNavigate(item.id)}
              >
                <span className="appdrawer-nav-icon"><item.Icon size={18} /></span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="appdrawer-section">
          <div className="appdrawer-label">Learn Islam</div>
          {GUIDES.map((guide) => drawerRow(
            <IconLearn size={18} />,
            'gold',
            guide.label,
            null,
            () => onOpenGuide(guide.id)
          ))}
        </div>

        <div className="appdrawer-section">
          <div className="appdrawer-label">Tools</div>
          {drawerRow(<IconCompass size={18} />, 'emerald', 'Qibla Compass', 'Direction to the Kaaba', onOpenQibla, activePage === 'qibla')}
          {drawerRow(<IconCalendar size={18} />, 'gold', 'Islamic Calendar', 'Coming soon', undefined, false, <span className="appdrawer-soon">Soon</span>)}
          {drawerRow(<IconHeart size={18} />, 'emerald', 'Journal', 'Coming soon', undefined, false, <span className="appdrawer-soon">Soon</span>)}
          {drawerRow(<IconPrayer size={18} />, 'gold', 'Prayer History', 'Coming soon', undefined, false, <span className="appdrawer-soon">Soon</span>)}
        </div>

        <div className="appdrawer-section">
          <div className="appdrawer-label">System</div>
          {drawerRow(<IconSettings size={18} />, 'gold', 'Settings', 'Theme, reciter, language, notifications', onOpenSettings, activePage === 'settings')}
          {drawerRow(<IconHeart size={18} />, 'emerald', 'About MuslimOS', 'Open Source · Made for the Ummah')}
        </div>

        <div className="appdrawer-footer">
          <div className="appdrawer-version">v2.0</div>
          <div className="appdrawer-meta">Open Source · Made for the Ummah</div>
          <div className="appdrawer-bismillah">بِسْمِ اللَّهِ</div>
        </div>
      </aside>
    </>
  );
}
