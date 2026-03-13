import React, { useState } from 'react';
import { CALC_METHODS } from '../utils/prayerCalc';
import {
  IconBack,
  IconHeart,
  IconMoon,
  IconQuran,
  IconRefresh,
  IconSettings,
  IconSun,
} from './Icons';

export default function SettingsPage({
  onBack,
  calcMethodIdx,
  onToggleCalcMethod,
  theme,
  onThemeChange,
  reciter,
  reciters,
  onReciterChange,
  ayahAutoplay,
  onAyahAutoplayChange,
}) {
  const [lang, setLang] = useState(() => localStorage.getItem('mos_lang') || 'en');

  function updateLanguage(nextLang) {
    setLang(nextLang);
    localStorage.setItem('mos_lang', nextLang);
    window.dispatchEvent(new Event('storage'));
  }

  const settingRow = (icon, tone, title, subtitle, trailing, onClick) => (
    <button type="button" className="settingsv2-row pressable" onClick={onClick}>
      <span className={`settingsv2-icon settingsv2-icon-${tone}`}>{icon}</span>
      <span className="settingsv2-copy">
        <strong>{title}</strong>
        <small>{subtitle}</small>
      </span>
      {trailing ? <span className="settingsv2-trailing">{trailing}</span> : null}
    </button>
  );

  return (
    <div className="settingsv2 animate-fade-up">
      <div className="settingsv2-header">
        <button className="back-btn" onClick={onBack}>
          <IconBack size={16} />
        </button>
        <div>
          <div className="page-title" style={{ padding: 0 }}>Settings</div>
          <div className="page-subtitle" style={{ padding: 0 }}>Preferences, recitation, and app controls</div>
        </div>
      </div>

      <section className="settingsv2-panel settingsv2-panel-hero">
        <div className="settingsv2-watermark">مُسْلِمُوس</div>
        <div className="settingsv2-label">App Preferences</div>
        <h2>Tailor MuslimOS to your daily rhythm.</h2>
        <p>Theme, recitation, language, prayer method, and device-level behavior all live here now.</p>
      </section>

      <section className="settingsv2-section">
        <div className="settingsv2-section-title">Prayer</div>
        {settingRow(
          <IconSettings size={18} />,
          'gold',
          'Calculation Method',
          'Tap to cycle prayer calculations',
          CALC_METHODS[calcMethodIdx].name,
          onToggleCalcMethod,
        )}
      </section>

      <section className="settingsv2-section">
        <div className="settingsv2-section-title">Appearance</div>
        <div className="settingsv2-panel">
          <div className="settingsv2-control-head">
            <span className="settingsv2-icon settingsv2-icon-gold"><IconSun size={18} /></span>
            <span className="settingsv2-copy">
              <strong>Theme</strong>
              <small>Light, dark, or auto by prayer time</small>
            </span>
          </div>
          <div className="settingsv2-pills">
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
      </section>

      <section className="settingsv2-section">
        <div className="settingsv2-section-title">Reading</div>
        <div className="settingsv2-panel">
          <div className="settingsv2-control-head">
            <span className="settingsv2-icon settingsv2-icon-emerald"><IconQuran size={18} /></span>
            <span className="settingsv2-copy">
              <strong>Language</strong>
              <small>Default translation language</small>
            </span>
          </div>
          <div className="settingsv2-pills">
            <button type="button" className={`sub-tab${lang === 'en' ? ' active' : ''}`} onClick={() => updateLanguage('en')}>English</button>
            <button type="button" className={`sub-tab${lang === 'ur' ? ' active' : ''}`} onClick={() => updateLanguage('ur')}>Urdu</button>
          </div>
        </div>
        <div className="settingsv2-panel">
          <div className="settingsv2-control-head">
            <span className="settingsv2-icon settingsv2-icon-emerald"><IconQuran size={18} /></span>
            <span className="settingsv2-copy">
              <strong>Reciter</strong>
              <small>Default Quran audio voice</small>
            </span>
          </div>
          <div className="settingsv2-choice-list">
            {reciters?.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`settingsv2-choice${reciter === item.id ? ' active' : ''}`}
                onClick={() => onReciterChange(item.id)}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
        <div className="settingsv2-panel">
          <div className="settingsv2-control-head">
            <span className="settingsv2-icon settingsv2-icon-gold"><IconQuran size={18} /></span>
            <span className="settingsv2-copy">
              <strong>Ayah Autoplay</strong>
              <small>Continue to the next ayah after you tap play on a verse</small>
            </span>
          </div>
          <div className="settingsv2-pills">
            <button type="button" className={`sub-tab${ayahAutoplay ? ' active' : ''}`} onClick={() => onAyahAutoplayChange(true)}>On</button>
            <button type="button" className={`sub-tab${!ayahAutoplay ? ' active' : ''}`} onClick={() => onAyahAutoplayChange(false)}>Off</button>
          </div>
        </div>
      </section>

      <section className="settingsv2-section">
        <div className="settingsv2-section-title">System</div>
        {settingRow(<IconMoon size={18} />, 'gold', 'Notifications', 'Prayer nudges and reminders', 'Soon')}
        {settingRow(<IconHeart size={18} />, 'emerald', 'About MuslimOS', 'Open Source · Made for the Ummah', 'v2.0')}
      </section>

      <section className="settingsv2-section">
        <div className="settingsv2-section-title">Reset</div>
        {settingRow(
          <IconRefresh size={18} />,
          'emerald',
          'Reset Reading Progress',
          'Clear khatm, streak, and last read data',
          null,
          () => {
            if (window.confirm('Reset all reading progress? This cannot be undone.')) {
              ['mos_khatm', 'mos_lastRead', 'mos_streak'].forEach((key) => localStorage.removeItem(key));
              window.location.reload();
            }
          },
        )}
      </section>
    </div>
  );
}
