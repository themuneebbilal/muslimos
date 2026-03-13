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
  IconMoon,
  IconPrayer,
  IconQuran,
  IconRefresh,
  IconSettings,
  IconSun,
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
  calcMethodIdx,
  onToggleCalcMethod,
  theme,
  onThemeChange,
  location,
  reciter,
  reciters,
  onReciterChange,
}) {
  const [lang, setLang] = useState(() => localStorage.getItem('mos_lang') || 'en');
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

  function updateLanguage(nextLang) {
    setLang(nextLang);
    localStorage.setItem('mos_lang', nextLang);
    window.dispatchEvent(new Event('storage'));
  }

  function handleTouchStart(event) {
    touchStartX.current = event.touches[0]?.clientX || null;
  }

  function handleTouchEnd(event) {
    const startX = touchStartX.current;
    const endX = event.changedTouches[0]?.clientX || 0;
    if (startX !== null && endX - startX < -60) {
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
          <div className="appdrawer-user glass-card">
            <div className="appdrawer-greeting">{greeting}</div>
            <div className="appdrawer-city">{city}</div>
            <div className="appdrawer-streak">{streak.current} day streak</div>
          </div>
        </div>

        <div className="appdrawer-section">
          <div className="appdrawer-label">Navigation</div>
          {MAIN_NAV.map((item) => drawerRow(
            <item.Icon size={18} />,
            'emerald',
            item.label,
            null,
            () => onNavigate(item.id),
            activePage === item.id
          ))}
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
          <div className="appdrawer-label">Settings</div>
          {drawerRow(<IconSettings size={18} />, 'gold', 'Calculation Method', CALC_METHODS[calcMethodIdx].name, onToggleCalcMethod)}
          <div className="appdrawer-control glass-card">
            <div className="appdrawer-control-head">
              <div className="appdrawer-icon appdrawer-icon-emerald"><IconQuran size={18} /></div>
              <div className="appdrawer-copy">
                <strong>Language</strong>
                <small>English or Urdu translation</small>
              </div>
            </div>
            <div className="appdrawer-pills">
              <button type="button" className={`sub-tab${lang === 'en' ? ' active' : ''}`} onClick={() => updateLanguage('en')}>English</button>
              <button type="button" className={`sub-tab${lang === 'ur' ? ' active' : ''}`} onClick={() => updateLanguage('ur')}>Urdu</button>
            </div>
          </div>
          <div className="appdrawer-control glass-card">
            <div className="appdrawer-control-head">
              <div className="appdrawer-icon appdrawer-icon-gold"><IconSun size={18} /></div>
              <div className="appdrawer-copy">
                <strong>Theme</strong>
                <small>Light, dark, or auto</small>
              </div>
            </div>
            <div className="appdrawer-pills">
              {['light', 'dark', 'auto'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`sub-tab${theme === mode ? ' active' : ''}`}
                  onClick={() => onThemeChange(mode)}
                >
                  {mode === 'light' ? 'Light' : mode === 'dark' ? 'Dark' : 'Auto'}
                </button>
              ))}
            </div>
          </div>
          <div className="appdrawer-control glass-card">
            <div className="appdrawer-control-head">
              <div className="appdrawer-icon appdrawer-icon-emerald"><IconHadith size={18} /></div>
              <div className="appdrawer-copy">
                <strong>Reciter</strong>
                <small>Default Quran audio voice</small>
              </div>
            </div>
            <div className="appdrawer-stack">
              {reciters?.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`appdrawer-choice${reciter === item.id ? ' active' : ''}`}
                  onClick={() => onReciterChange(item.id)}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
          {drawerRow(<IconMoon size={18} />, 'gold', 'Notifications', 'Coming soon', undefined, false, <span className="appdrawer-soon">Soon</span>)}
          {drawerRow(<IconHeart size={18} />, 'emerald', 'About MuslimOS', 'Open source prayer, Quran, and hadith companion', undefined)}
          {drawerRow(<IconRefresh size={18} />, 'emerald', 'Reset Reading Progress', 'Clear khatm, streak, and last read', () => {
            if (window.confirm('Reset all reading progress? This cannot be undone.')) {
              ['mos_khatm', 'mos_lastRead', 'mos_streak'].forEach((key) => localStorage.removeItem(key));
              window.location.reload();
            }
          })}
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
