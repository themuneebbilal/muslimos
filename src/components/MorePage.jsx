import React, { useState } from 'react';
import { CALC_METHODS } from '../utils/prayerCalc';
import { calculateQibla } from '../utils/qiblaCalc';
import Qibla from './Qibla';
import { IconCompass, IconSettings, IconBack, IconForward, IconHeart, IconMoon, IconSun, IconCrescent, IconLearn, IconRefresh, IconTrash } from './Icons';

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

  const settingRow = (icon, tone, title, subtitle, onClick) => (
    <div
      onClick={onClick}
      className="glass-card pressable morev2-row"
      style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', padding: '14px var(--sp-4)', marginBottom: 'var(--sp-2)' }}
    >
      <div className={`morev2-icon morev2-icon-${tone}`}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <strong className="morev2-row-title" style={{ fontSize: 'var(--text-base)', display: 'block' }}>{title}</strong>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 1 }}>{subtitle}</p>
      </div>
      {onClick && <IconForward size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />}
    </div>
  );

  return (
    <div className="animate-fade-up morev2-page">
      <div className="page-title f1">More</div>
      <div className="page-subtitle f2">Settings & Tools</div>

      {settingRow(
        <IconLearn size={18} style={{ color: 'var(--emerald-500)' }} />,
        'emerald',
        'Islamic Guides',
        'Step-by-step Salah, Wudu, Hajj & more',
        () => onNavigate('learn'),
      )}

      {settingRow(
        <IconCompass size={18} style={{ color: 'var(--emerald-500)' }} />,
        'emerald',
        'Qibla Compass',
        `${Math.round(calculateQibla(location.lat, location.lng))}° from North`,
        () => setShowQibla(true),
      )}

      {settingRow(
        <IconSettings size={18} style={{ color: 'var(--gold-500)' }} />,
        'gold',
        'Calculation Method',
        CALC_METHODS[calcMethodIdx].name,
        onToggleCalcMethod,
      )}

      {/* Theme Selection */}
      <div className="morev2-section" style={{ marginTop: 'var(--sp-4)', marginBottom: 'var(--sp-4)' }}>
        <div className="morev2-section-title" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--sp-2)', paddingLeft: 'var(--sp-1)' }}>Theme</div>
        {[
          { id: 'light', label: 'Light', desc: 'Cream theme', icon: <IconSun size={16} /> },
          { id: 'dark', label: 'Dark', desc: 'AMOLED dark theme', icon: <IconMoon size={16} /> },
          { id: 'auto', label: 'Auto', desc: 'Dark at Isha, light at Fajr', icon: <IconCrescent size={16} style={{ color: 'var(--gold-400)' }} /> },
        ].map(t => (
          <div
            key={t.id}
            onClick={() => onThemeChange(t.id)}
            className={`pressable morev2-choice${theme === t.id ? ' is-active' : ''}`}
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
      <div className="morev2-section" style={{ marginTop: 'var(--sp-4)', marginBottom: 'var(--sp-4)' }}>
        <div className="morev2-section-title" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--sp-2)', paddingLeft: 'var(--sp-1)' }}>Quran Reciter</div>
        {reciters && reciters.map(r => (
          <div
            key={r.id}
            onClick={() => onReciterChange(r.id)}
            className={`pressable morev2-choice${reciter === r.id ? ' is-active' : ''}`}
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

      {/* Data & Cache */}
      <div className="morev2-section" style={{ marginTop: 'var(--sp-4)', marginBottom: 'var(--sp-4)' }}>
        <div className="morev2-section-title" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--sp-2)', paddingLeft: 'var(--sp-1)' }}>Data & Cache</div>
      {settingRow(
        <IconRefresh size={18} style={{ color: 'var(--emerald-500)' }} />,
        'emerald',
        'Reset Reading Progress',
        'Clear khatm, last read & streak data',
          () => {
            if (window.confirm('Reset all reading progress? This cannot be undone.')) {
              ['mos_khatm', 'mos_lastRead', 'mos_streak'].forEach(k => localStorage.removeItem(k));
              window.location.reload();
            }
          },
        )}
      {settingRow(
        <IconRefresh size={18} style={{ color: 'var(--gold-500)' }} />,
        'gold',
        'Reset Dhikr & Tasbeeh',
        'Clear tasbeeh counters & adhkar progress',
          () => {
            if (window.confirm('Reset all dhikr and tasbeeh data? This cannot be undone.')) {
              ['mos_tb_subhanallah', 'mos_tb_alhamdulillah', 'mos_tb_allahuakbar', 'mos_adhkar_counts'].forEach(k => localStorage.removeItem(k));
              window.location.reload();
            }
          },
        )}
      {settingRow(
        <IconRefresh size={18} style={{ color: 'var(--emerald-500)' }} />,
        'emerald',
        'Reset Guide Progress',
        'Restart all step-by-step guides',
          () => {
            if (window.confirm('Reset all guide progress? This cannot be undone.')) {
              ['salah', 'wudu', 'taraweeh', 'witr', 'janazah', 'eid', 'umrah', 'hajj'].forEach(id => localStorage.removeItem(`mos_guide_${id}_step`));
              window.location.reload();
            }
          },
        )}
      {settingRow(
        <IconTrash size={18} style={{ color: '#ef4444' }} />,
        'danger',
        'Clear Cached Data',
        'Remove cached tafseer, hadith & bookmarks',
          () => {
            if (window.confirm('Clear all cached data? Bookmarks and collections will be removed. This cannot be undone.')) {
              const keys = Object.keys(localStorage);
              keys.forEach(k => {
                if (k.startsWith('mos_tafseer_') || k.startsWith('mos_hadith_')) localStorage.removeItem(k);
              });
              ['mos_bookmarks', 'mos_ayah_bm', 'mos_ayah_collections'].forEach(k => localStorage.removeItem(k));
              window.location.reload();
            }
          },
        )}
      </div>

      {settingRow(
        <IconHeart size={18} style={{ color: 'var(--emerald-500)' }} />,
        'emerald',
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

      <div className="glass-card" style={{
        margin: '0 var(--sp-4) var(--sp-6)',
        padding: 'var(--sp-4)',
        borderRadius: 'var(--r-md)',
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
