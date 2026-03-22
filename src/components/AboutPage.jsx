import React from 'react';
import { IconBack, IconCrescent, IconHeart, IconMoon, IconQuran, IconSettings } from './Icons';

const VERSION = '1.0.0';

export default function AboutPage({ onBack }) {
  return (
    <div className="settingsv2 animate-fade-up">
      <div className="settingsv2-header">
        <button className="back-btn" onClick={onBack}>
          <IconBack size={16} />
        </button>
        <div>
          <div className="page-title" style={{ padding: 0 }}>About MuslimOS</div>
          <div className="page-subtitle" style={{ padding: 0 }}>Free. No ads. Open source.</div>
        </div>
      </div>

      <section className="settingsv2-panel settingsv2-panel-hero" style={{ textAlign: 'center' }}>
        <div style={{ margin: '0 auto 14px', width: 72, height: 72, borderRadius: 24, display: 'grid', placeItems: 'center', background: 'linear-gradient(145deg, rgba(201,168,76,0.22), rgba(11,107,79,0.18))', color: 'var(--gold-500)' }}>
          <IconCrescent size={34} />
        </div>
        <h2 style={{ marginBottom: 8 }}>MuslimOS</h2>
        <div className="font-amiri" style={{ color: 'var(--gold-500)', fontSize: '1.5rem', marginBottom: 12 }}>
          بِسْمِ اللَّهِ
        </div>
        <p>Your complete Islamic companion. Built with love for the ummah.</p>
        <div style={{ color: 'var(--text-tertiary)', fontSize: '0.78rem', marginTop: 12 }}>Version {VERSION}</div>
      </section>

      <section className="settingsv2-panel">
        <div className="settingsv2-control-head">
          <span className="settingsv2-icon settingsv2-icon-emerald"><IconHeart size={18} /></span>
          <span className="settingsv2-copy">
            <strong>Created by Muneeb Bilal</strong>
            <small>MuslimOS is built to be useful, calm, and private by default. If you find an error, please get in touch.</small>
          </span>
        </div>
        <div className="settingsv2-choice-list" style={{ marginTop: 'var(--sp-4)' }}>
          <a className="settingsv2-choice" href="https://github.com/" target="_blank" rel="noreferrer">GitHub</a>
          <a className="settingsv2-choice" href="https://muneebbilal.com" target="_blank" rel="noreferrer">Website</a>
          <a className="settingsv2-choice" href="mailto:hello@muneebbilal.com">Contact</a>
        </div>
      </section>

      <section className="settingsv2-panel">
        <div className="settingsv2-control-head">
          <span className="settingsv2-icon settingsv2-icon-gold"><IconQuran size={18} /></span>
          <span className="settingsv2-copy">
            <strong>Islamic Content Disclaimer</strong>
            <small>MuslimOS strives for accuracy, but it is not a fatwa service and should not replace qualified scholarship.</small>
          </span>
        </div>
        <div style={{ marginTop: 'var(--sp-3)', color: 'var(--text-secondary)', lineHeight: 1.75, fontSize: 'var(--text-sm)' }}>
          Duas, adhkar, hadith, and ritual guides are provided for learning and convenience. Some topics have legitimate differences between scholars and madhahib. When practice depends on school-specific rulings, local masjid guidance, or personal circumstance, consult a qualified teacher or scholar.
        </div>
      </section>

      <section className="settingsv2-panel">
        <div className="settingsv2-control-head">
          <span className="settingsv2-icon settingsv2-icon-emerald"><IconMoon size={18} /></span>
          <span className="settingsv2-copy">
            <strong>Prayer Times and Calculations</strong>
            <small>Prayer times are calculated estimates based on location, method, and device data.</small>
          </span>
        </div>
        <div style={{ marginTop: 'var(--sp-3)', color: 'var(--text-secondary)', lineHeight: 1.75, fontSize: 'var(--text-sm)' }}>
          Times may vary slightly from your local masjid timetable because of calculation methods, elevation, horizons, daylight assumptions, and device location accuracy. Always prefer your local masjid or trusted community schedule where needed.
        </div>
      </section>

      <section className="settingsv2-panel">
        <div className="settingsv2-control-head">
          <span className="settingsv2-icon settingsv2-icon-gold"><IconSettings size={18} /></span>
          <span className="settingsv2-copy">
            <strong>Privacy and Data</strong>
            <small>Most personal data stays in your browser or on your device unless a feature needs remote content.</small>
          </span>
        </div>
        <div style={{ marginTop: 'var(--sp-3)', color: 'var(--text-secondary)', lineHeight: 1.75, fontSize: 'var(--text-sm)' }}>
          Journal entries, bookmarks, streaks, and settings are primarily stored locally. Clearing browser or app data can remove them. Use the export feature in Settings if you want a backup.
        </div>
      </section>

      <section className="settingsv2-panel">
        <div className="settingsv2-control-head">
          <span className="settingsv2-icon settingsv2-icon-emerald"><IconHeart size={18} /></span>
          <span className="settingsv2-copy">
            <strong>Scope of the App</strong>
            <small>MuslimOS is meant to support worship and learning, not overwhelm it.</small>
          </span>
        </div>
        <div style={{ marginTop: 'var(--sp-3)', color: 'var(--text-secondary)', lineHeight: 1.75, fontSize: 'var(--text-sm)' }}>
          The goal is a respectful, useful Islamic companion: free, no ads, and open source. If a feature feels distracting, misleading, or spiritually off in practice, that feedback is valuable and should shape the product.
        </div>
      </section>

      <section className="settingsv2-panel" style={{ textAlign: 'center' }}>
        <div className="settingsv2-control-head" style={{ justifyContent: 'center' }}>
          <span className="settingsv2-icon settingsv2-icon-gold"><IconQuran size={18} /></span>
        </div>
        <div className="font-amiri" style={{ fontSize: '1.6rem', color: 'var(--emerald-700)' }}>
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </div>
      </section>
    </div>
  );
}
