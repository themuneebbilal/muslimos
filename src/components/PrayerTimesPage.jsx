import React, { useState, useEffect } from 'react';
import { calculatePrayerTimes, formatTime, getNextPrayer, getCountdown, getHijriDate, CALC_METHODS } from '../utils/prayerCalc';
import { IconBack, IconCrescent, IconSunrise, IconSun, IconMoon, IconCompass } from './Icons';
import { formatHomeLocation } from '../utils/homePageUtils';

const PRAYERS = [
  { key: 'Fajr', ar: '\u0627\u0644\u0641\u064E\u062C\u0652\u0631', icon: IconCrescent, color: 'var(--emerald-500)' },
  { key: 'Sunrise', ar: '\u0627\u0644\u0634\u0651\u064F\u0631\u0648\u0642', icon: IconSunrise, color: 'var(--gold-400)' },
  { key: 'Dhuhr', ar: '\u0627\u0644\u0638\u0651\u064F\u0647\u0652\u0631', icon: IconSun, color: 'var(--emerald-500)' },
  { key: 'Asr', ar: '\u0627\u0644\u0639\u064E\u0635\u0652\u0631', icon: IconSun, color: 'var(--emerald-500)' },
  { key: 'Maghrib', ar: '\u0627\u0644\u0645\u064E\u063A\u0652\u0631\u0650\u0628', icon: IconMoon, color: 'var(--emerald-500)' },
  { key: 'Isha', ar: '\u0627\u0644\u0639\u0650\u0634\u064E\u0627\u0621', icon: IconMoon, color: 'var(--emerald-500)' },
];

export default function PrayerTimesPage({ location, calcMethodIdx, onNavigate, onToggleCalcMethod }) {
  const [times, setTimes] = useState(null);
  const [countdown, setCountdown] = useState('--:--:--');
  const [nextPrayer, setNextPrayer] = useState({ name: '--', time: 0 });

  useEffect(() => {
    const t = calculatePrayerTimes(location.lat, location.lng, location.tz, calcMethodIdx);
    setTimes(t);
    setNextPrayer(getNextPrayer(t));
  }, [location, calcMethodIdx]);

  useEffect(() => {
    if (!nextPrayer.time) return;
    const interval = setInterval(() => {
      setCountdown(getCountdown(nextPrayer.time));
    }, 1000);
    return () => clearInterval(interval);
  }, [nextPrayer]);

  useEffect(() => {
    const interval = setInterval(() => {
      const t = calculatePrayerTimes(location.lat, location.lng, location.tz, calcMethodIdx);
      setTimes(t);
      setNextPrayer(getNextPrayer(t));
    }, 60000);
    return () => clearInterval(interval);
  }, [location, calcMethodIdx]);

  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
  const hijriStr = getHijriDate(location);
  const gregorian = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const locationLabel = formatHomeLocation(location);

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="f1" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', padding: 'var(--sp-5) 0 var(--sp-2)' }}>
        <button className="back-btn" onClick={() => onNavigate('home')}>
          <IconBack size={16} />
        </button>
        <div className="page-title" style={{ padding: 0 }}>Prayer Times</div>
      </div>

      {/* Hero Card */}
      <div className="glass-dark f2" style={{
        borderRadius: 'var(--r-xl)', padding: '28px 24px 24px', textAlign: 'center',
        marginBottom: 'var(--sp-4)', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, var(--emerald-700) 0%, var(--emerald-500) 100%)',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.10) 0%, transparent 70%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="section-label" style={{ color: 'rgba(255,255,255,0.65)', marginBottom: 6 }}>Next Prayer</div>
          <div className="font-amiri" style={{ fontSize: '1.9rem', fontWeight: 700, marginBottom: 2, letterSpacing: 1, textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>{nextPrayer.name.toUpperCase()}</div>
          <div style={{ fontSize: 'var(--text-md)', opacity: .8, marginBottom: 'var(--sp-4)' }}>{formatTime(nextPrayer.time % 24)}</div>
          <div className="font-amiri" style={{ fontSize: 'var(--text-4xl)', fontWeight: 700, letterSpacing: 3, lineHeight: 1, textShadow: '0 2px 12px rgba(0,0,0,0.25)' }}>{countdown}</div>
          <div className="section-label" style={{ color: 'rgba(255,255,255,0.5)', marginTop: 'var(--sp-1)' }}>remaining</div>
        </div>
      </div>

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

      {/* 6 Prayer Cards */}
      {times && PRAYERS.map((p, i) => {
        const tMin = (times[p.key] % 24) * 60;
        const isNext = p.key === nextPrayer.name;
        const passed = nowMin > tMin && !isNext;
        const Icon = p.icon;
        return (
          <div key={p.key} className={`glass-card f${i + 4}`} style={{
            display: 'flex', alignItems: 'center', gap: 'var(--sp-3)',
            padding: '14px var(--sp-4)', marginBottom: 'var(--sp-2)',
            opacity: passed ? 0.5 : 1,
            borderLeft: isNext ? '4px solid var(--gold-400)' : '4px solid transparent',
            background: isNext ? 'linear-gradient(90deg, rgba(201,168,76,0.08), transparent)' : undefined,
            transition: 'all 0.2s',
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 'var(--r-full)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isNext ? 'rgba(201,168,76,0.15)' : `${p.color}12`,
              border: `1.5px solid ${isNext ? 'var(--gold-400)' : p.color}`,
              flexShrink: 0,
            }}>
              <Icon size={18} style={{ color: isNext ? 'var(--gold-400)' : p.color }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                <span style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)' }}>{p.key}</span>
                <span className="font-amiri" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>{p.ar}</span>
                {isNext && (
                  <span style={{
                    fontSize: '0.55rem', fontWeight: 700, color: 'var(--gold-500)',
                    background: 'rgba(201,168,76,0.12)', padding: '1px 6px',
                    borderRadius: 'var(--r-full)', letterSpacing: 0.8,
                    textTransform: 'uppercase',
                  }}>NEXT</span>
                )}
                {passed && (
                  <span style={{
                    fontSize: '0.55rem', fontWeight: 600, color: 'var(--text-tertiary)',
                    letterSpacing: 0.5,
                  }}>Passed</span>
                )}
              </div>
            </div>
            <div className="font-amiri" style={{
              fontSize: 'var(--text-lg)', fontWeight: 700,
              color: isNext ? 'var(--gold-500)' : 'var(--text-primary)',
              flexShrink: 0,
            }}>
              {formatTime(times[p.key])}
            </div>
          </div>
        );
      })}

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
