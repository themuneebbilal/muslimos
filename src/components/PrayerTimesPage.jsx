import React, { useEffect, useMemo, useState } from 'react';
import { calculatePrayerTimes, formatTime, getNextPrayer, getHijriDate, CALC_METHODS, PRAYER_WINDOWS } from '../utils/prayerCalc';
import { IconBack, IconCrescent, IconSunrise, IconSun, IconMoon, IconCompass } from './Icons';
import { formatHomeLocation } from '../utils/homePageUtils';
import '../styles/prayer-times.css';

const PRAYERS = [
  { key: 'Fajr', ar: '\u0627\u0644\u0641\u064E\u062C\u0652\u0631', icon: IconCrescent, accent: 'emerald', orbitIcon: 'moon', windowLabel: 'Prayer window' },
  { key: 'Sunrise', ar: '\u0627\u0644\u0634\u0651\u064F\u0631\u0648\u0642', icon: IconSunrise, accent: 'gold', orbitIcon: 'sun', windowLabel: 'Day opens' },
  { key: 'Dhuhr', ar: '\u0627\u0644\u0638\u0651\u064F\u0647\u0652\u0631', icon: IconSun, accent: 'gold', orbitIcon: 'sun', windowLabel: 'Prayer window' },
  { key: 'Asr', ar: '\u0627\u0644\u0639\u064E\u0635\u0652\u0631', icon: IconSun, accent: 'gold', orbitIcon: 'sun', windowLabel: 'Prayer window' },
  { key: 'Maghrib', ar: '\u0627\u0644\u0645\u064E\u063A\u0652\u0631\u0650\u0628', icon: IconMoon, accent: 'rose', orbitIcon: 'sunset', windowLabel: 'Prayer window' },
  { key: 'Isha', ar: '\u0627\u0644\u0639\u0650\u0634\u064E\u0627\u0621', icon: IconMoon, accent: 'emerald', orbitIcon: 'moon', windowLabel: 'Prayer window' },
];


function toMinutes(hours) {
  return Math.round((hours % 24) * 60);
}

function getCurrentClockMinutes(now, tz) {
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes() + now.getUTCSeconds() / 60;
  const shifted = utcMinutes + (tz * 60);
  return ((shifted % 1440) + 1440) % 1440;
}

function getCountdownForTimezone(targetHours, tz, now) {
  const nowH = getCurrentClockMinutes(now, tz) / 60;
  let diff = targetHours - nowH;
  if (diff < 0) diff += 24;
  const totalSec = Math.floor(diff * 3600);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${h < 10 ? '0' : ''}${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

function getPrayerWindow(times, key) {
  const config = PRAYER_WINDOWS[key];
  const start = times[config.startKey];
  let end = times[config.endKey];
  if (config.endKey === 'Fajr' && end <= start) {
    end += 24;
  }
  return { start, end };
}

function getWindowProgress(nowMinutes, start, end) {
  let current = nowMinutes;
  let safeEnd = end;

  if (safeEnd <= start) {
    safeEnd += 24;
  }
  if (current < start) {
    current += 24;
  }

  const span = Math.max(1, safeEnd - start);
  const raw = (current - start) / span;
  return Math.max(0, Math.min(1, raw));
}

function getPrayerStatus(prayerKey, nextPrayerName, nowMinutes, startMinutes, endMinutes) {
  let normalizedNow = nowMinutes;
  let normalizedEnd = endMinutes;

  if (normalizedEnd <= startMinutes) {
    normalizedEnd += 24 * 60;
  }
  if (normalizedNow < startMinutes) {
    normalizedNow += 24 * 60;
  }

  if (normalizedNow >= startMinutes && normalizedNow < normalizedEnd) return 'current';
  if (prayerKey === nextPrayerName) return 'next';
  if (normalizedNow >= normalizedEnd) return 'passed';
  return 'upcoming';
}

function OrbitGlyph({ type }) {
  if (type === 'moon') {
    return <IconCrescent size={14} />;
  }
  if (type === 'sunset') {
    return <IconSunrise size={14} />;
  }
  return <IconSun size={14} />;
}

function getOrbitStyle(progress, lift = 24) {
  const orbitLift = lift * (1 - (((progress - 0.5) * (progress - 0.5)) * 4));
  return {
    '--prayer-progress': progress,
    '--orbit-lift': `${Math.max(0, orbitLift)}px`,
  };
}

export default function PrayerTimesPage({ location, calcMethodIdx, onNavigate, onToggleCalcMethod }) {
  const [times, setTimes] = useState(null);
  const [countdown, setCountdown] = useState('--:--:--');
  const [nextPrayer, setNextPrayer] = useState({ name: '--', time: 0 });
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = calculatePrayerTimes(location.lat, location.lng, location.tz, calcMethodIdx);
    setTimes(t);
    setNextPrayer(getNextPrayer(t, location.tz));
  }, [location, calcMethodIdx]);

  useEffect(() => {
    if (!nextPrayer.time) return;
    setCountdown(getCountdownForTimezone(nextPrayer.time, location.tz, new Date()));
    const interval = setInterval(() => {
      const nextNow = new Date();
      setNow(nextNow);
      setCountdown(getCountdownForTimezone(nextPrayer.time, location.tz, nextNow));
    }, 1000);
    return () => clearInterval(interval);
  }, [nextPrayer, location.tz]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
      const t = calculatePrayerTimes(location.lat, location.lng, location.tz, calcMethodIdx);
      setTimes(t);
      setNextPrayer(getNextPrayer(t, location.tz));
    }, 60000);
    return () => clearInterval(interval);
  }, [location, calcMethodIdx]);

  const nowMinutes = useMemo(() => getCurrentClockMinutes(now, location.tz), [now, location.tz]);
  const prayerEntries = useMemo(() => {
    if (!times) return [];

    return PRAYERS.map((prayer) => {
      const { start, end } = getPrayerWindow(times, prayer.key);
      const startMinutes = toMinutes(start);
      let endMinutes = toMinutes(end);
      if (endMinutes <= startMinutes) {
        endMinutes += 24 * 60;
      }

      const progress = getWindowProgress(nowMinutes, startMinutes, endMinutes);
      const status = getPrayerStatus(prayer.key, nextPrayer.name, nowMinutes, startMinutes, endMinutes);

      return {
        ...prayer,
        start,
        end,
        startMinutes,
        endMinutes,
        progress,
        status,
      };
    });
  }, [times, nowMinutes, nextPrayer.name]);

  const activeEntry = useMemo(() => (
    prayerEntries.find((entry) => entry.status === 'current') ||
    prayerEntries.find((entry) => entry.status === 'next') ||
    prayerEntries[0] ||
    null
  ), [prayerEntries]);
  const remainingEntries = useMemo(
    () => prayerEntries.filter((entry) => entry.key !== activeEntry?.key),
    [prayerEntries, activeEntry]
  );
  const hijriStr = getHijriDate(location);
  const gregorian = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const locationLabel = formatHomeLocation(location);

  return (
    <div className="animate-fade-up prayer-times-page">
      {/* Header */}
      <div className="f1" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', padding: 'var(--sp-5) 0 var(--sp-2)' }}>
        <button className="back-btn" onClick={() => onNavigate('home')}>
          <IconBack size={16} />
        </button>
        <div className="page-title" style={{ padding: 0 }}>Prayer Times</div>
      </div>

      {/* Hero Card */}
      {activeEntry && (
        <div className="glass-dark prayer-hero-active f2">
          <div className="prayer-hero-active-copy">
            <div className="prayer-hero-active-topline">
              <span className="prayer-hero-label">Active Window</span>
              <span className="prayer-hero-progress-pill">{Math.round(activeEntry.progress * 100)}% through window</span>
            </div>
            <div className="prayer-hero-active-title-row">
              <div className="prayer-hero-active-name-wrap">
                <div className="prayer-hero-active-name font-amiri">{activeEntry.key}</div>
                <div className="prayer-hero-active-ar font-amiri">{activeEntry.ar}</div>
              </div>
            </div>
            <div className="prayer-hero-next-row">
              <div>
                <div className="prayer-hero-label">Time To Next Prayer</div>
                <div className="prayer-hero-countdown font-amiri">{countdown}</div>
                <div className="prayer-hero-next-copy">
                  {nextPrayer.name} at {formatTime(nextPrayer.time % 24)}
                </div>
              </div>
            </div>
            <div className="prayer-hero-meta-row">
              <div className="prayer-hero-meta-card">
                <span>Started</span>
                <strong>{formatTime(activeEntry.start)}</strong>
                <small>Window opened</small>
              </div>
              <div className="prayer-hero-meta-card">
                <span>Ends</span>
                <strong>{formatTime(activeEntry.end)}</strong>
                <small>Next prayer begins</small>
              </div>
              <div className="prayer-hero-meta-card prayer-hero-meta-card-progress">
                <span>Depth</span>
                <strong>{Math.round(activeEntry.progress * 100)}%</strong>
                <small>Through this window</small>
              </div>
            </div>
          </div>

          <div
            className="prayer-hero-orbit prayer-hero-orbit-active"
            style={getOrbitStyle(activeEntry.progress, 52)}
            aria-hidden="true"
          >
            <div className="prayer-card-orbit-track" />
            <div className="prayer-card-orbit-glow" />
            <div className="prayer-card-orbit-body">
              <OrbitGlyph type={activeEntry.orbitIcon} />
            </div>
          </div>
        </div>
      )}

      {/* Date Info Bar */}
      <div className="glass-card f3" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: 'var(--sp-3) var(--sp-4)', marginBottom: 'var(--sp-4)',
      }}>
        <div>
          <div className="font-amiri" style={{ fontSize: 'var(--text-sm)', color: 'var(--gold-400)', fontWeight: 700 }}>{hijriStr}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 1 }}>{gregorian}</div>
        </div>
        <div
          onClick={onToggleCalcMethod}
          className="pressable"
          style={{
            fontSize: '0.6rem', fontWeight: 700, color: 'var(--emerald-700)',
            background: 'var(--emerald-50)', padding: '4px 10px',
            borderRadius: 'var(--r-full)', cursor: 'pointer',
            letterSpacing: 0.5, textTransform: 'uppercase',
          }}
        >
          {CALC_METHODS[calcMethodIdx].name}
        </div>
      </div>

      {/* Remaining Prayer Cards */}
      <div className="prayer-cards-grid">
        {remainingEntries.map((entry, i) => {
        const isNext = entry.status === 'next';
        const passed = entry.status === 'passed';
        const Icon = entry.icon;
        return (
          <article
            key={entry.key}
            className={`glass-card prayer-card prayer-card-${entry.accent} prayer-card-${entry.status} f${i + 4}`}
            style={getOrbitStyle(entry.progress)}
          >
            <div className="prayer-card-orbit" aria-hidden="true">
              <div className="prayer-card-orbit-track" />
              <div className="prayer-card-orbit-glow" />
              <div className="prayer-card-orbit-body">
                <OrbitGlyph type={entry.orbitIcon} />
              </div>
            </div>

            <div className="prayer-card-topline">
              <span className="prayer-card-tag">
                {isNext ? 'Next' : passed ? 'Passed' : 'Today'}
              </span>
              <span className="prayer-card-window-label">{entry.windowLabel}</span>
            </div>

            <div className="prayer-card-main">
              <div className="prayer-card-copy">
                <div className="prayer-card-title-row">
                  <div className={`prayer-card-icon prayer-card-icon-${entry.accent}`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="prayer-card-title">{entry.key}</div>
                    <div className="prayer-card-ar font-amiri">{entry.ar}</div>
                  </div>
                </div>

                <div className="prayer-card-time">{formatTime(times[entry.key])}</div>
              </div>

              <div className="prayer-card-window">
                <div className="prayer-card-window-item">
                  <span>Start</span>
                  <strong>{formatTime(entry.start)}</strong>
                </div>
                <div className="prayer-card-window-divider" />
                <div className="prayer-card-window-item">
                  <span>End</span>
                  <strong>{formatTime(entry.end)}</strong>
                </div>
              </div>
            </div>
          </article>
        );
        })}
      </div>

      {/* Location footer */}
      <div className="f10" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 'var(--sp-2)', padding: 'var(--sp-4) 0',
        fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)',
      }}>
        <IconCompass size={14} style={{ opacity: 0.6 }} />
        {locationLabel}
      </div>
    </div>
  );
}
