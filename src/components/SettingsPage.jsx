import React, { useEffect, useState } from 'react';
import { CALC_METHODS } from '../utils/prayerCalc';
import { clearHadithOfflineData, getOfflineStorageUsageBytes, subscribeHadithDownloads } from '../utils/hadithApi';
import { TAFSEER_EDITIONS, getDefaultTafseerForLang } from '../utils/tafseerApi';
import { clearKeys, exportPrefixedStorage, getStorageUsageBytes, importPrefixedStorage, safeGetItem, safeKeys, safeRemoveItem, safeSetItem } from '../utils/safeStorage';
import {
  IconBack,
  IconFont,
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
  const [lang, setLang] = useState(() => safeGetItem('mos_lang', 'en'));
  const [tafseerEdition, setTafseerEdition] = useState(() => safeGetItem('mos_tafseer_edition', getDefaultTafseerForLang(safeGetItem('mos_lang', 'en'))));
  const [arabicSize, setArabicSize] = useState(() => parseFloat(safeGetItem('mos_arabicSize', '1.5')));
  const [transSize, setTransSize] = useState(() => parseFloat(safeGetItem('mos_transSize', '0.9')));
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => safeGetItem('mos_notifications', 'false') === 'true');
  const [offlineUsage, setOfflineUsage] = useState('0.0 MB');
  const [localUsage, setLocalUsage] = useState('0.0 MB');

  useEffect(() => {
    async function loadUsage() {
      const bytes = await getOfflineStorageUsageBytes();
      setOfflineUsage(`${(bytes / (1024 * 1024)).toFixed(1)} MB`);
      setLocalUsage(`${(getStorageUsageBytes('mos_') / (1024 * 1024)).toFixed(1)} MB`);
    }
    loadUsage();
    return subscribeHadithDownloads(loadUsage);
  }, []);

  function broadcastSettingsChange(detail = {}) {
    window.dispatchEvent(new CustomEvent('mos-settings-change', { detail }));
    window.dispatchEvent(new Event('storage'));
  }

  function updateLanguage(nextLang) {
    setLang(nextLang);
    safeSetItem('mos_lang', nextLang);
    const nextEdition = getDefaultTafseerForLang(nextLang);
    setTafseerEdition(nextEdition);
    safeSetItem('mos_tafseer_edition', nextEdition);
    broadcastSettingsChange({ lang: nextLang, tafseerEdition: nextEdition });
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
              <strong>Tafseer Edition</strong>
              <small>Choose the default tafseer loaded in Quran Reader</small>
            </span>
          </div>
          <div className="settingsv2-choice-list">
            {TAFSEER_EDITIONS.filter((item) => ['en-tafisr-ibn-kathir', 'tafseer-ibn-e-kaseer-urdu', 'ar.jalalayn'].includes(item.id)).map((item) => (
              <button
                key={item.id}
                type="button"
                className={`settingsv2-choice${tafseerEdition === item.id ? ' active' : ''}`}
                onClick={() => {
                  setTafseerEdition(item.id);
                  safeSetItem('mos_tafseer_edition', item.id);
                  broadcastSettingsChange({ tafseerEdition: item.id });
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="settingsv2-panel">
          <div className="settingsv2-control-head">
            <span className="settingsv2-icon settingsv2-icon-emerald"><IconFont size={18} /></span>
            <span className="settingsv2-copy">
              <strong>Font Size</strong>
              <small>Arabic and translation font sizes in Quran Reader</small>
            </span>
          </div>
          <div className="settingsv2-choice-list">
            {[['Arabic', arabicSize, setArabicSize, 'mos_arabicSize'], ['Translation', transSize, setTransSize, 'mos_transSize']].map(([label, value, setter, key]) => (
              <label key={key} className="settingsv2-choice" style={{ minWidth: 140 }}>
                <div style={{ marginBottom: 6 }}>{label}: {Number(value).toFixed(1)}rem</div>
                <input
                  type="range"
                  min={label === 'Arabic' ? 1.2 : 0.8}
                  max={label === 'Arabic' ? 2.2 : 1.4}
                  step="0.1"
                  value={value}
                  onChange={(event) => {
                    const next = Number(event.target.value);
                    setter(next);
                    safeSetItem(key, next);
                    broadcastSettingsChange({ [key]: next });
                  }}
                />
              </label>
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
        {settingRow(<IconQuran size={18} />, 'emerald', 'Offline Data', 'Downloaded hadith collections stored on this device', offlineUsage)}
        {settingRow(<IconQuran size={18} />, 'gold', 'Local Data', 'Settings, bookmarks, journal, and reader state', localUsage)}
        {settingRow(<IconMoon size={18} />, 'gold', 'Notifications', 'Prayer nudges and reminders', notificationsEnabled ? 'On' : 'Off', () => {
          const next = !notificationsEnabled;
          setNotificationsEnabled(next);
          safeSetItem('mos_notifications', String(next));
        })}
        {settingRow(<IconHeart size={18} />, 'emerald', 'About MuslimOS', 'Open Source · Made for the Ummah', 'v1.0')}
      </section>

      <section className="settingsv2-section">
        <div className="settingsv2-section-title">Data</div>
        {settingRow(
          <IconQuran size={18} />,
          'gold',
          'Export My Data',
          'Download all MuslimOS browser data as JSON',
          null,
          () => {
            const payload = exportPrefixedStorage('mos_');
            const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `muslimos-data-${new Date().toISOString().slice(0, 10)}.json`;
            link.click();
            URL.revokeObjectURL(url);
          },
        )}
        {settingRow(
          <IconQuran size={18} />,
          'emerald',
          'Import Data',
          'Restore a previously exported MuslimOS backup',
          null,
          () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'application/json';
            input.onchange = async () => {
              const file = input.files?.[0];
              if (!file) return;
              const text = await file.text();
              importPrefixedStorage(JSON.parse(text), 'mos_');
              broadcastSettingsChange({ imported: true });
              window.location.reload();
            };
            input.click();
          },
        )}
        {settingRow(
          <IconRefresh size={18} />,
          'emerald',
          'Clear Cache',
          'Clear local MuslimOS storage and downloaded hadith data',
          `${safeKeys('mos_').length} keys`,
          async () => {
            const browserBytes = getStorageUsageBytes('mos_');
            const hadithBytes = await getOfflineStorageUsageBytes();
            const totalMb = ((browserBytes + hadithBytes) / (1024 * 1024)).toFixed(1);
            if (!window.confirm(`Clear MuslimOS data from this browser? About ${totalMb} MB will be removed.`)) return;
            clearKeys(safeKeys('mos_'));
            await clearHadithOfflineData();
            broadcastSettingsChange({ cleared: true });
            window.location.reload();
          },
        )}
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
              ['mos_khatm', 'mos_lastRead', 'mos_streak'].forEach((key) => safeRemoveItem(key));
              window.location.reload();
            }
          },
        )}
      </section>
    </div>
  );
}
