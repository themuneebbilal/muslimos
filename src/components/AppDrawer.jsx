import React, { useEffect, useMemo, useRef, useState } from 'react';
import { formatHomeLocation } from '../utils/homePageUtils';
import {
  IconCalendar,
  IconChevronDown,
  IconCompass,
  IconHadith,
  IconHeart,
  IconHome,
  IconJournal,
  IconLearn,
  IconPrayer,
  IconQuran,
  IconSettings,
  IconWorship,
} from './Icons';

const MAIN_NAV = [
  { id: 'home', label: 'Home', Icon: IconHome },
  { id: 'quran', label: 'Al-Quran', Icon: IconQuran },
  { id: 'worship', label: 'Worship', Icon: IconWorship },
  { id: 'hadith', label: 'Hadith', Icon: IconHadith },
];

const GUIDES = [
  { id: 'salah', label: 'How to Pray' },
  { id: 'tajweed', label: 'Tajweed', soon: true },
  { id: 'wudu', label: 'Wudu' },
  { id: 'umrah', label: 'Umrah & Hajj' },
];

export default function AppDrawer({
  open,
  onClose,
  activePage,
  onNavigate,
  onOpenGuide,
  onOpenQibla,
  onOpenCalendar,
  onOpenJournal,
  location,
  onOpenSettings,
  onOpenAbout,
}) {
  const touchStartX = useRef(null);
  const city = useMemo(() => formatHomeLocation(location.label), [location]);
  const [learnOpen, setLearnOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  useEffect(() => {
    if (!open && window.innerWidth < 1120) return undefined;
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }
    if (window.innerWidth < 1120) {
      document.body.style.overflow = 'hidden';
    }
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

  const drawerRow = (key, icon, tone, label, onClick, active = false, trailing = null) => (
    <button
      key={key}
      type="button"
      onClick={onClick}
      className={`appdrawer-row${active ? ' active' : ''}`}
      disabled={!onClick}
    >
      <span className={`appdrawer-icon appdrawer-icon-${tone}`}>{icon}</span>
      <span className="appdrawer-copy">
        <strong>{label}</strong>
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
        aria-hidden={!open && window.innerWidth < 1120}
      >
        <div className="appdrawer-top">
          <div className="appdrawer-user-card glass-card">
            <div className="appdrawer-greeting">MuslimOS</div>
            <div className="appdrawer-city">{city}</div>
            <div className="appdrawer-streak">14 day streak</div>
          </div>
        </div>

        <div className="appdrawer-section">
          {MAIN_NAV.map((item) => drawerRow(
            item.id,
            <item.Icon size={18} />,
            'emerald',
            item.label,
            () => onNavigate(item.id),
            activePage === item.id
          ))}
        </div>

        <div className="appdrawer-section-divider" />
        <div className="appdrawer-section">
          <button type="button" className="appdrawer-section-toggle" onClick={() => setLearnOpen((value) => !value)}>
            <span className="appdrawer-label">Learn</span>
            <IconChevronDown size={16} className={learnOpen ? 'appdrawer-chevron-open' : ''} />
          </button>
          {learnOpen && GUIDES.map((guide) => drawerRow(
            guide.id,
            <IconLearn size={18} />,
            'gold',
            guide.label,
            guide.soon ? null : () => onOpenGuide(guide.id),
            false,
            guide.soon ? <span className="appdrawer-soon">Soon</span> : null
          ))}
        </div>

        <div className="appdrawer-section-divider" />
        <div className="appdrawer-section">
          <button type="button" className="appdrawer-section-toggle" onClick={() => setToolsOpen((value) => !value)}>
            <span className="appdrawer-label">Tools</span>
            <IconChevronDown size={16} className={toolsOpen ? 'appdrawer-chevron-open' : ''} />
          </button>
          {toolsOpen && (
            <>
              {drawerRow('qibla', <IconCompass size={18} />, 'emerald', 'Qibla Compass', onOpenQibla, activePage === 'qibla')}
              {drawerRow('calendar', <IconCalendar size={18} />, 'gold', 'Islamic Calendar', onOpenCalendar, activePage === 'calendar')}
              {drawerRow('journal', <IconJournal size={18} />, 'emerald', 'Journal', onOpenJournal, activePage === 'journal')}
              {drawerRow('prayer-history', <IconPrayer size={18} />, 'gold', 'Prayer History', null, false, <span className="appdrawer-soon">Soon</span>)}
            </>
          )}
        </div>

        <div className="appdrawer-section-divider" />
        <div className="appdrawer-section">
          {drawerRow('settings', <IconSettings size={18} />, 'gold', 'Settings', onOpenSettings, activePage === 'settings')}
          {drawerRow('about', <IconHeart size={18} />, 'emerald', 'About MuslimOS', onOpenAbout, activePage === 'about')}
        </div>

        <div className="appdrawer-section-divider" />
        <div className="appdrawer-footer">
          <div className="appdrawer-version">v1.0 · Open Source</div>
          <div className="appdrawer-meta">Made for the Ummah</div>
        </div>
      </aside>
    </>
  );
}
