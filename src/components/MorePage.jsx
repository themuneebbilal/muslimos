import React, { useState } from 'react';
import { CALC_METHODS } from '../utils/prayerCalc';
import { calculateQibla } from '../utils/qiblaCalc';
import Qibla from './Qibla';
import { IconCompass, IconSettings, IconBack, IconForward, IconHeart, IconMoon, IconSun, IconCrescent, IconLearn } from './Icons';

export default function MorePage({ calcMethodIdx, onToggleCalcMethod, location, reciter, reciters, onReciterChange, onNavigate, theme, onThemeChange }) {
  const [showQibla, setShowQibla] = useState(false);

  if (showQibla) {
    return (
      <div className="animate-fade-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', padding: 'var(--sp-5) 0 var(--sp-2)' }}>
          <button className="back-btn" onClick={() => setShowQibla(false)}>
            <IconBack size={16} />
          </button>
          <div className="page-title" style={{ padding: 0 }}>Qibla Direction</div>
        </div>
        <Qibla location={location} />
      </div>
    );
  }

  const settingRow = (icon, bg, title, subtitle, onClick) => (
    <div
      onClick={onClick}
      className="glass-card pressable"
      style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', padding: '14px var(--sp-4)', marginBottom: 'var(--sp-2)' }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 'var(--r-md)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: bg, flexShrink: 0,
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <strong style={{ fontSize: 'var(--text-base)', display: 'block' }}>{title}</strong>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 1 }}>{subtitle}</p>
      </div>
      {onClick && <IconForward size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />}
    </div>
  );

  return (
    <div className="animate-fade-up">
      <div className="page-title f1">More</div>
      <div className="page-subtitle f2">Settings & Tools</div>

      {settingRow(
        <IconLearn size={18} style={{ color: 'var(--emerald-500)' }} />,
        'var(--emerald-50)',
        'Islamic Guides',
        'Step-by-step Salah, Wudu, Hajj & more',
        () => onNavigate('learn'),
      )}

      {settingRow(
        <IconCompass size={18} style={{ color: 'var(--emerald-500)' }} />,
        'var(--emerald-50)',
        'Qibla Compass',
        `${Math.round(calculateQibla(location.lat, location.lng))}° from North`,
        () => setShowQibla(true),
      )}

      {settingRow(
        <IconSettings size={18} style={{ color: 'var(--gold-500)' }} />,
        'var(--gold-100)',
        'Calculation Method',
        CALC_METHODS[calcMethodIdx].name,
        onToggleCalcMethod,
      )}

      {/* Theme Selection */}
      <div style={{ marginTop: 'var(--sp-4)', marginBottom: 'var(--sp-4)' }}>
        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--sp-2)', paddingLeft: 'var(--sp-1)' }}>Theme</div>
        {[
          { id: 'light', label: 'Light', desc: 'Cream theme', icon: <IconSun size={16} /> },
          { id: 'dark', label: 'Dark', desc: 'AMOLED dark theme', icon: <IconMoon size={16} /> },
          { id: 'auto', label: 'Auto', desc: 'Dark at Isha, light at Fajr', icon: <IconCrescent size={16} style={{ color: 'var(--gold-400)' }} /> },
        ].map(t => (
          <div
            key={t.id}
            onClick={() => onThemeChange(t.id)}
            className="pressable"
            style={{
              display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', padding: 'var(--sp-3) var(--sp-4)',
              background: theme === t.id ? 'var(--emerald-50)' : 'var(--bg-glass)',
              backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
              borderRadius: 'var(--r-md)', marginBottom: 'var(--sp-1)',
              border: `1.5px solid ${theme === t.id ? 'var(--emerald-500)' : 'rgba(255,255,255,0.5)'}`,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            <div style={{
              width: 20, height: 20, borderRadius: 'var(--r-full)',
              border: `2px solid ${theme === t.id ? 'var(--emerald-500)' : 'var(--border)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {theme === t.id && (
                <div style={{ width: 10, height: 10, borderRadius: 'var(--r-full)', background: 'var(--emerald-500)' }} />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: theme === t.id ? 600 : 400, color: theme === t.id ? 'var(--emerald-700)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                {t.icon} {t.label}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: 1 }}>{t.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Reciter Selection */}
      <div style={{ marginTop: 'var(--sp-4)', marginBottom: 'var(--sp-4)' }}>
        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--sp-2)', paddingLeft: 'var(--sp-1)' }}>Quran Reciter</div>
        {reciters && reciters.map(r => (
          <div
            key={r.id}
            onClick={() => onReciterChange(r.id)}
            className="pressable"
            style={{
              display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', padding: 'var(--sp-3) var(--sp-4)',
              background: reciter === r.id ? 'var(--emerald-50)' : 'var(--bg-glass)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              borderRadius: 'var(--r-md)', marginBottom: 'var(--sp-1)',
              border: `1.5px solid ${reciter === r.id ? 'var(--emerald-500)' : 'rgba(255,255,255,0.5)'}`,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            <div style={{
              width: 20, height: 20, borderRadius: 'var(--r-full)',
              border: `2px solid ${reciter === r.id ? 'var(--emerald-500)' : 'var(--border)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {reciter === r.id && (
                <div style={{ width: 10, height: 10, borderRadius: 'var(--r-full)', background: 'var(--emerald-500)' }} />
              )}
            </div>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: reciter === r.id ? 600 : 400, color: reciter === r.id ? 'var(--emerald-700)' : 'var(--text-secondary)' }}>
              {r.name}
            </div>
          </div>
        ))}
      </div>

      {settingRow(
        <IconHeart size={18} style={{ color: 'var(--emerald-500)' }} />,
        'var(--emerald-50)',
        'About MuslimOS',
        'Prayer times, Quran, Hadith, dhikr & qibla',
        null,
      )}

      <div style={{ textAlign: 'center', padding: 'var(--sp-10) 0 var(--sp-5)' }}>
        <div className="font-amiri" style={{ fontSize: 'var(--text-xl)', color: 'var(--emerald-700)', fontWeight: 700 }}>MuslimOS</div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--sp-1)' }}>v2.0</div>
        <div className="font-amiri" style={{ fontSize: 'var(--text-base)', color: 'var(--gold-400)', marginTop: 'var(--sp-3)' }}>
          &#x0628;&#x0650;&#x0633;&#x0652;&#x0645;&#x0650; &#x0627;&#x0644;&#x0644;&#x0651;&#x0647;&#x0650; &#x0627;&#x0644;&#x0631;&#x0651;&#x064E;&#x062D;&#x0652;&#x0645;&#x064E;&#x0670;&#x0646;&#x0650; &#x0627;&#x0644;&#x0631;&#x0651;&#x064E;&#x062D;&#x0650;&#x064A;&#x0645;&#x0650;
        </div>
      </div>

      <div style={{
        margin: '0 var(--sp-4) var(--sp-6)',
        padding: 'var(--sp-4)',
        borderRadius: 'var(--r-md)',
        background: 'var(--bg-glass)',
        border: '1px solid var(--border)',
      }}>
        <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 'var(--sp-2)' }}>
          Content Accuracy
        </div>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
          Duas, adhkar, and hadith in this app are sourced from well-known Islamic collections (Sahih al-Bukhari, Sahih Muslim, Jami at-Tirmidhi, Sunan Abu Dawud, Sunan Ibn Majah, and others). References show collection names only; specific hadith numbering may vary across editions. Quranic verses are sourced from standard Arabic texts. This app is a personal aid and does not replace scholarly guidance. If you find any inaccuracy, please report it so we can correct it.
        </div>
      </div>
    </div>
  );
}
