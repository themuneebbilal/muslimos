import React, { useEffect, useMemo, useState } from 'react';
import {
  calculatePrayerTimes,
  formatTime,
  getCountdown,
  getHijriDate,
  getHijriDateParts,
  getNextPrayer,
} from '../utils/prayerCalc';
import { calculateQibla } from '../utils/qiblaCalc';
import { getStreakData } from '../utils/streakTracker';
import { getKhatmData } from '../utils/khatmTracker';
import { getUpcomingEvents } from '../data/islamicCalendar';
import {
  IconCompass,
  IconCrescent,
  IconHamburger,
  IconHadith,
  IconLearn,
  IconMoon,
  IconQuran,
  IconSun,
  IconWorship,
} from './Icons';
import {
  formatHomeLocation,
  formatHomeGregorianDate,
  getHomeGreeting,
  getRamadanProgress,
} from '../utils/homePageUtils';
import '../styles/home-promoted.css';

const DAILY_VERSES = [
  {
    a: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    e: 'For indeed, with hardship comes ease. Indeed, with hardship comes ease.',
    u: 'بے شک مشکل کے ساتھ آسانی ہے۔ بے شک مشکل کے ساتھ آسانی ہے۔',
    r: 'Ash-Sharh 94:5-6',
  },
  {
    a: 'وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ',
    e: 'And He is with you wherever you are.',
    u: 'اور وہ تمہارے ساتھ ہے جہاں کہیں بھی تم ہو۔',
    r: 'Al-Hadid 57:4',
  },
  {
    a: 'فَاذْكُرُونِي أَذْكُرْكُمْ',
    e: 'So remember Me; I will remember you.',
    u: 'پس تم مجھے یاد کرو، میں تمہیں یاد رکھوں گا۔',
    r: 'Al-Baqarah 2:152',
  },
  {
    a: 'ادْعُونِي أَسْتَجِبْ لَكُمْ',
    e: 'Call upon Me; I will respond to you.',
    u: 'مجھ سے دعا کرو، میں تمہاری دعا قبول کروں گا۔',
    r: 'Ghafir 40:60',
  },
];

const PRAYER_ORDER = [
  { key: 'Fajr', label: 'Fajr' },
  { key: 'Sunrise', label: 'Rise' },
  { key: 'Dhuhr', label: 'Dhuhr' },
  { key: 'Asr', label: 'Asr' },
  { key: 'Maghrib', label: 'Maghr' },
  { key: 'Isha', label: 'Isha' },
];

function HomeIconWrap({ tone = 'gold', children }) {
  return <div className={`homev2-icon-wrap homev2-icon-wrap-${tone}`}>{children}</div>;
}

function HomeQiblaNeedle({ angle }) {
  return (
    <div className="homev2-qibla-needle" style={{ transform: `rotate(${angle}deg)` }}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3 16 12 12 21 8 12 12 3z" fill="currentColor" stroke="none" />
      </svg>
    </div>
  );
}

function HomeDivider() {
  return (
    <div className="homev2-divider" aria-hidden="true">
      <span className="homev2-divider-line" />
      <span className="homev2-divider-diamond" />
      <span className="homev2-divider-line" />
    </div>
  );
}

export default function HomePage({ location, calcMethodIdx, onNavigate, theme, onThemeChange, onOpenDrawer }) {
  const [times, setTimes] = useState(() =>
    calculatePrayerTimes(location.lat, location.lng, location.tz, calcMethodIdx)
  );
  const [nextPrayer, setNextPrayer] = useState(() => getNextPrayer(times));
  const [countdown, setCountdown] = useState('--:--:--');

  useEffect(() => {
    const prayerTimes = calculatePrayerTimes(location.lat, location.lng, location.tz, calcMethodIdx);
    setTimes(prayerTimes);
    setNextPrayer(getNextPrayer(prayerTimes));
  }, [location, calcMethodIdx]);

  useEffect(() => {
    if (!nextPrayer.time) return;
    setCountdown(getCountdown(nextPrayer.time));
    const interval = setInterval(() => {
      setCountdown(getCountdown(nextPrayer.time));
    }, 1000);
    return () => clearInterval(interval);
  }, [nextPrayer]);

  useEffect(() => {
    const interval = setInterval(() => {
      const prayerTimes = calculatePrayerTimes(location.lat, location.lng, location.tz, calcMethodIdx);
      setTimes(prayerTimes);
      setNextPrayer(getNextPrayer(prayerTimes));
    }, 60000);
    return () => clearInterval(interval);
  }, [location, calcMethodIdx]);

  const dayOfYear = useMemo(
    () => Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000),
    []
  );
  const verse = useMemo(() => DAILY_VERSES[dayOfYear % DAILY_VERSES.length], [dayOfYear]);

  const greeting = useMemo(() => getHomeGreeting(), []);
  const gregorianDate = useMemo(() => formatHomeGregorianDate(), []);
  const hijriDate = useMemo(() => getHijriDate(), []);
  const hijriParts = useMemo(() => getHijriDateParts(), []);
  const ramadanProgress = useMemo(() => getRamadanProgress(hijriParts), [hijriParts]);
  const qiblaAngle = useMemo(
    () => Math.round(calculateQibla(location.lat, location.lng)),
    [location]
  );
  const locationLabel = useMemo(() => formatHomeLocation(location.label), [location]);

  const lastReadInfo = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('mos_lastRead'));
    } catch {
      return null;
    }
  }, []);

  const streak = useMemo(() => getStreakData(), []);
  const khatm = useMemo(() => getKhatmData(), []);
  const prayerCompletion = useMemo(() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const completed = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].filter((name) => {
      const time = times[name];
      if (!time && time !== 0) return false;
      return currentMinutes >= Math.round((time % 24) * 60);
    }).length;
    return { completed, total: 5 };
  }, [times]);

  const eidEvent = useMemo(() => {
    const upcoming = getUpcomingEvents(hijriParts.day, hijriParts.month, 8);
    return (
      upcoming.find((event) => event.name === 'Eid al-Fitr') ||
      upcoming.find((event) => event.name === 'Eid al-Adha') ||
      null
    );
  }, [hijriParts]);

  const quranTitle = lastReadInfo?.name || 'Al-Quran';
  const quranContinue =
    lastReadInfo?.ayah && lastReadInfo?.name
      ? `Continue: ${lastReadInfo.name} · Ayah ${lastReadInfo.ayah}`
      : 'Continue your reading journey';

  return (
    <div className="homev2 animate-fade-up">
      <header className="homev2-header homev2-reveal-1">
        <div>
          <div className="homev2-greeting-row">
            <button type="button" className="homev2-menu-btn" onClick={onOpenDrawer} aria-label="Open menu">
              <IconHamburger size={18} />
            </button>
            <span className="homev2-gold-dot" />
            <span>{greeting}</span>
          </div>
          <h1 className="homev2-brand">MuslimOS</h1>
          <div className="homev2-city">{locationLabel}</div>
        </div>

        <div className="homev2-header-right">
          <div className="homev2-hijri">{hijriDate}</div>
          <div className="homev2-gregorian">{gregorianDate}</div>
          <button
            type="button"
            className="homev2-theme-toggle"
            onClick={() => {
              const modes = ['light', 'dark', 'auto'];
              const next = modes[(modes.indexOf(theme) + 1) % modes.length];
              onThemeChange(next);
            }}
            aria-label={`Theme: ${theme}`}
          >
            {theme === 'dark' ? (
              <IconMoon size={18} />
            ) : theme === 'auto' ? (
              <IconCrescent size={18} />
            ) : (
              <IconSun size={18} />
            )}
          </button>
        </div>
      </header>

      {ramadanProgress.isRamadan && (
        <section className="homev2-ramadan glass-card homev2-reveal-2">
          <div className="homev2-ramadan-copy">
            <div className="homev2-ramadan-title">Ramadan Mubarak</div>
          </div>
          <div className="homev2-ramadan-progress">
            <div className="homev2-ramadan-day">{ramadanProgress.day} / 30</div>
            <div className="homev2-thin-progress">
              <span style={{ width: `${ramadanProgress.pct}%` }} />
            </div>
          </div>
        </section>
      )}

      <section className="homev2-hero-grid homev2-reveal-3">
        <article className="homev2-prayer-hero homev2-emerald-surface">
          <div className="homev2-watermark homev2-watermark-bismillah">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </div>

          <div className="homev2-prayer-hero-inner">
            <div>
              <div className="homev2-eyebrow">Next Prayer</div>
              <div className="homev2-prayer-name">{nextPrayer.name}</div>
              <div className="homev2-prayer-time">{formatTime(nextPrayer.time)}</div>
              <div className="homev2-countdown">{countdown}</div>
              <div className="homev2-remaining">Remaining</div>
            </div>

            <button
              type="button"
              className="homev2-qibla-mini homev2-dark-glass"
              onClick={() => onNavigate('prayers')}
            >
              <div className="homev2-qibla-ring">
                <HomeQiblaNeedle angle={qiblaAngle} />
              </div>
              <div className="homev2-qibla-label">Qibla</div>
              <div className="homev2-qibla-degree">{qiblaAngle}°</div>
            </button>
          </div>

          <div className="homev2-prayer-strip">
            {PRAYER_ORDER.map((prayer) => {
              const isActive = prayer.key === nextPrayer.name;
              const isPast =
                !isActive && nextPrayer.key !== prayer.key && nextPrayer.name !== '--' &&
                PRAYER_ORDER.findIndex((item) => item.key === prayer.key) <
                  PRAYER_ORDER.findIndex((item) => item.key === nextPrayer.name);

              return (
                <div
                  key={prayer.key}
                  className={`homev2-prayer-slot${isActive ? ' active' : ''}${isPast ? ' past' : ''}`}
                >
                  <div className="homev2-slot-name">{prayer.label}</div>
                  <div className="homev2-slot-time">{formatTime(times[prayer.key]).replace(' AM', '').replace(' PM', '')}</div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="homev2-ayat glass-card homev2-reveal-4">
          <div className="homev2-watermark homev2-watermark-light">ذِكْر</div>
          <div className="homev2-section-title">Ayat of the Day</div>
          <p className="homev2-ayah-ar">{verse.a}</p>
          <p className="homev2-ayah-en">"{verse.e}"</p>
          <p className="homev2-ayah-ur">{verse.u}</p>
          <div className="homev2-ayah-ref">{verse.r}</div>
        </article>
      </section>

      <section className="homev2-path homev2-emerald-surface homev2-reveal-5">
        <div className="homev2-section-header">
          <h2 className="homev2-arabic-title">سَبِيلُكَ</h2>
          <div className="homev2-sub-head">Your Path</div>
          <HomeDivider />
        </div>

        <button type="button" className="homev2-quran-hero homev2-dark-glass" onClick={() => onNavigate('quran')}>
          <div className="homev2-quran-watermark">ٱقْرَأْ</div>
          <div className="homev2-quran-hero-grid">
            <HomeIconWrap tone="gold">
              <IconQuran size={22} />
            </HomeIconWrap>
            <div>
              <div className="homev2-quran-title">{quranTitle}</div>
              <div className="homev2-quran-copy">{quranContinue}</div>
              <div className="homev2-quran-progress">
                <span style={{ width: `${lastReadInfo ? Math.min(100, Math.max(8, Math.round((lastReadInfo.ayah / 286) * 100))) : khatm.pct}%` }} />
              </div>
            </div>
            <div className="homev2-pill">
              {lastReadInfo?.ayah ? `Ayah ${lastReadInfo.ayah}` : `${khatm.pct}%`}
            </div>
          </div>
        </button>

        <div className="homev2-action-grid">
          <button type="button" className="homev2-action-card homev2-dark-glass" onClick={() => onNavigate('worship')}>
            <div className="homev2-watermark">ذِكْر</div>
            <HomeIconWrap tone="gold">
              <IconWorship size={20} />
            </HomeIconWrap>
            <div>
              <div className="homev2-action-label">Dhikr</div>
              <div className="homev2-action-sub">Morning remembrance and daily tasbeeh.</div>
            </div>
          </button>

          <button type="button" className="homev2-action-card homev2-dark-glass" onClick={() => onNavigate('prayers')}>
            <div className="homev2-watermark">قِبْلَة</div>
            <HomeIconWrap tone="emerald">
              <IconCompass size={20} />
            </HomeIconWrap>
            <div>
              <div className="homev2-action-label">Qibla</div>
              <div className="homev2-action-sub">Instant direction guidance for prayer anywhere.</div>
            </div>
          </button>

          <button type="button" className="homev2-action-card homev2-dark-glass" onClick={() => onNavigate('hadith')}>
            <div className="homev2-watermark">حَدِيث</div>
            <HomeIconWrap tone="gold">
              <IconHadith size={20} />
            </HomeIconWrap>
            <div>
              <div className="homev2-action-label">Hadith</div>
              <div className="homev2-action-sub">Read collections and continue daily study.</div>
            </div>
          </button>

          <button type="button" className="homev2-action-card homev2-dark-glass" onClick={() => onNavigate('learn')}>
            <div className="homev2-watermark">عِلْم</div>
            <HomeIconWrap tone="emerald">
              <IconLearn size={20} />
            </HomeIconWrap>
            <div>
              <div className="homev2-action-label">Learn</div>
              <div className="homev2-action-sub">Practical guidance for worship and daily life.</div>
            </div>
            <div className="homev2-badge">8 Guides</div>
          </button>
        </div>
      </section>

      <section className="homev2-journey homev2-reveal-6">
        <div className="homev2-section-header">
          <h2 className="homev2-arabic-title homev2-arabic-title-light">رِحْلَتُكَ</h2>
          <div className="homev2-sub-head homev2-sub-head-light">Your Journey</div>
          <HomeDivider />
        </div>

        <div className="homev2-metrics">
          <article className="homev2-metric glass-card">
            <div className="homev2-metric-label">Day Streak</div>
            <div className="homev2-metric-value">{streak.current}</div>
            <div className="homev2-metric-sub">days of consistency</div>
          </article>

          <article className="homev2-metric glass-card">
            <div className="homev2-metric-label">Khatm</div>
            <div className="homev2-ring-wrap">
              <svg viewBox="0 0 60 60" aria-hidden="true">
                <circle className="homev2-ring-bg" cx="30" cy="30" r="24" fill="none" strokeWidth="4" />
                <circle
                  className="homev2-ring-fill"
                  cx="30"
                  cy="30"
                  r="24"
                  fill="none"
                  strokeWidth="4"
                  strokeDasharray="150.8"
                  strokeDashoffset={150.8 - (150.8 * khatm.pct) / 100}
                />
              </svg>
              <div className="homev2-ring-text">{khatm.pct}%</div>
            </div>
            <div className="homev2-metric-sub">{khatm.completedSurahs} surahs complete</div>
          </article>

          <article className="homev2-metric glass-card">
            <div className="homev2-metric-label">Prayers</div>
            <div className="homev2-metric-value">
              {prayerCompletion.completed}
              <span className="homev2-metric-unit">/{prayerCompletion.total}</span>
            </div>
            <div className="homev2-metric-sub">completed so far</div>
          </article>
        </div>

        {eidEvent && (
          <article className="homev2-eid-card homev2-reveal-7">
            <HomeIconWrap tone="gold">
              <IconCrescent size={20} />
            </HomeIconWrap>
            <div>
              <div className="homev2-eid-title">{eidEvent.name}</div>
              <div className="homev2-eid-ar">{eidEvent.nameAr}</div>
              <div className="homev2-eid-copy">in {eidEvent.daysUntil} days</div>
            </div>
            <div className="homev2-badge homev2-badge-light">Eid</div>
          </article>
        )}

        <div className="homev2-journal">How was your day? Tap to reflect...</div>
      </section>

      <footer className="homev2-footer homev2-reveal-7">
        <HomeDivider />
        <div className="homev2-footer-ar">خَيْرُكُمْ خَيْرُكُمْ لِأَهْلِهِ</div>
        <div className="homev2-footer-en">"The best of you are those who are best to their families."</div>
        <div className="homev2-footer-ref">Jami at-Tirmidhi 3895</div>
      </footer>
    </div>
  );
}
