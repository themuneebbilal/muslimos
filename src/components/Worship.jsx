import React, { useEffect, useMemo, useState } from 'react';
import { MORNING_ADHKAR, EVENING_ADHKAR } from '../data/adhkar';
import DUAS_DATA from '../data/duas';
import { IconShare, IconBookmark, IconChevronDown, IconSunrise, IconMoon, IconRefresh, IconPrayer, IconShield, IconLeaf, IconHeart, IconDua, IconCalendar, IconJournal, IconLearn } from './Icons';
import HadithFooter from './HadithFooter';

const MODES = {
  subhanallah: { label: '\u0633\u064F\u0628\u0652\u062D\u064E\u0627\u0646\u064E \u0627\u0644\u0644\u0651\u064E\u0647\u0650', target: 33, display: 'SubhanAllah' },
  alhamdulillah: { label: '\u0627\u0644\u0652\u062D\u064E\u0645\u0652\u062F\u064F \u0644\u0650\u0644\u0651\u064E\u0647\u0650', target: 33, display: 'Alhamdulillah' },
  allahuakbar: { label: '\u0627\u0644\u0644\u0651\u064E\u0647\u064F \u0623\u064E\u0643\u0652\u0628\u064E\u0631\u064F', target: 34, display: 'Allahu Akbar' },
  free: { label: 'Free Count', target: 100, display: 'Free Count' },
};

const CATEGORY_ICONS = {
  salah: IconPrayer,
  fasting: IconLeaf,
  morning_evening: IconSunrise,
  protection: IconShield,
  daily: IconDua,
  forgiveness: IconHeart,
  distress: IconHeart,
};

const TRACKER_STORAGE_KEY = 'mos_worship_tracker';
const TRACKER_DAYS_KEY = 'mos_worship_tracker_days';

const TRACKER_MODULES = [
  {
    id: 'daily',
    chip: 'Daily Checklist',
    title: 'Five Daily Prayers',
    subtitle: 'Pray on time, with khushoo and presence.',
    tone: 'emerald',
    Icon: IconPrayer,
    items: [
      { id: 'fajr', label: 'Fajr', detail: 'Before sunrise — start the day right' },
      { id: 'dhuhr', label: 'Dhuhr', detail: 'Early afternoon' },
      { id: 'asr', label: 'Asr', detail: 'Late afternoon' },
      { id: 'maghrib', label: 'Maghrib', detail: 'At iftar or sunset' },
      { id: 'isha', label: 'Isha', detail: 'Night prayer' },
      { id: 'taraweeh', label: 'Taraweeh', detail: 'Sunnah after Isha during Ramadan' },
    ],
  },
  {
    id: 'surahs',
    chip: 'Learn Surahs',
    title: 'Quran & Knowledge',
    subtitle: 'Read, understand, and reflect.',
    tone: 'gold',
    Icon: IconLearn,
    items: [
      { id: 'quran_ar', label: 'Read Quran (Arabic)', detail: 'Aim for at least 1 juz daily' },
      { id: 'quran_tr', label: 'Read Quran Translation', detail: 'Understand what you recite' },
      { id: 'mulk', label: 'Surah Al-Mulk', detail: 'Recite before bed' },
      { id: 'hadith', label: 'Read a Hadith', detail: 'Bukhari, Muslim, or Riyad-us-Saliheen' },
      { id: 'memorise', label: 'Practice memorizing a short surah', detail: 'Even 2-3 ayahs count' },
    ],
  },
  {
    id: 'guard',
    chip: 'Guard Yourself',
    title: 'Self-Discipline',
    subtitle: 'What you avoided today matters too.',
    tone: 'rose',
    Icon: IconShield,
    items: [
      { id: 'scrolling', label: 'No brainrot reels / mindless scrolling', detail: '' },
      { id: 'language', label: 'Watched my language all day', detail: '' },
      { id: 'gheebah', label: 'Avoided gheebah (backbiting)', detail: '' },
      { id: 'content', label: 'Avoided unethical content', detail: '' },
      { id: 'gaze', label: 'Lowered gaze', detail: '' },
    ],
  },
  {
    id: 'charity',
    chip: 'Charity',
    title: 'Sadaqah & Service',
    subtitle: 'Small acts still count with Allah.',
    tone: 'emerald',
    Icon: IconHeart,
    items: [
      { id: 'give', label: 'Gave some sadaqah today', detail: 'Any amount, even small' },
      { id: 'serve', label: 'Helped someone quietly', detail: 'Family, friend, or stranger' },
      { id: 'dua', label: 'Made dua for someone else', detail: 'Without telling them' },
      { id: 'reminder', label: 'Shared one beneficial reminder', detail: 'Knowledge, hadith, or ayah' },
    ],
  },
  {
    id: 'duas',
    chip: 'Essential Duas',
    title: 'Daily Duas',
    subtitle: 'Keep the tongue connected throughout the day.',
    tone: 'gold',
    Icon: IconDua,
    items: [
      { id: 'morning', label: 'Morning adhkar', detail: 'After Fajr or early morning' },
      { id: 'evening', label: 'Evening adhkar', detail: 'After Asr or Maghrib' },
      { id: 'sleep', label: 'Sleep dua', detail: 'Close the day with remembrance' },
      { id: 'food', label: 'Food-related duas', detail: 'Before and after eating' },
      { id: 'after_salah', label: 'After salah adhkar', detail: 'Tasbih and istighfar' },
    ],
  },
  {
    id: 'planner',
    chip: 'Planner',
    title: 'Intentional Day Plan',
    subtitle: 'Set a clear rhythm before the day slips away.',
    tone: 'emerald',
    Icon: IconCalendar,
    items: [
      { id: 'salah_block', label: 'Blocked time around prayer', detail: 'Protected salah windows' },
      { id: 'quran_slot', label: 'Reserved a Quran slot', detail: 'Even 10 focused minutes' },
      { id: 'goal', label: 'Picked one worship goal', detail: 'A realistic target for today' },
      { id: 'family', label: 'Planned one family or community act', detail: 'Reach out or show up' },
    ],
  },
  {
    id: 'journal',
    chip: 'Journal',
    title: 'Reflection & Muhasabah',
    subtitle: 'Notice what changed in your heart today.',
    tone: 'rose',
    Icon: IconJournal,
    items: [
      { id: 'gratitude', label: 'Wrote one gratitude point', detail: 'Name one blessing clearly' },
      { id: 'dua_written', label: 'Wrote one dua', detail: 'A sincere ask for today' },
      { id: 'lesson', label: 'Captured one lesson', detail: 'Something Allah taught you' },
      { id: 'repentance', label: 'Made istighfar with reflection', detail: 'Not just by habit' },
    ],
  },
];

function buildDefaultTrackerState() {
  return TRACKER_MODULES.reduce((acc, module) => {
    acc[module.id] = module.items.reduce((itemAcc, item) => {
      itemAcc[item.id] = false;
      return itemAcc;
    }, {});
    return acc;
  }, {});
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getLastThirtyDays() {
  return Array.from({ length: 30 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - index));
    return date.toISOString().slice(0, 10);
  });
}

function getCurrentTrackerStreak(days) {
  const sorted = [...days].sort();
  let streak = 0;
  let cursor = new Date();
  while (sorted.includes(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function DuaCard({ dua }) {
  const [lang, setLang] = useState('en');

  return (
    <div className="dua-card dua-card-v2">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-2)' }}>
        <div>
          <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-primary)' }}>{dua.title}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>{dua.context}</div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
          <button
            className="pressable"
            onClick={() => {
              const text = `${dua.arabic}\n\n${dua.english}\n\n— ${dua.ref}`;
              if (navigator.share) navigator.share({ text }).catch(() => {});
              else navigator.clipboard?.writeText(text);
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 4 }}
          >
            <IconShare size={16} />
          </button>
        </div>
      </div>

      <div className="dua-arabic-block">
        <div className="arabic-text" style={{ fontSize: 'var(--arabic-base)', color: 'var(--emerald-700)', lineHeight: 2.2 }}>
          {dua.arabic}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--sp-1)', marginBottom: 'var(--sp-2)' }}>
        {['en', 'ur'].map(l => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className="trans-pill"
            style={lang === l ? { background: 'var(--emerald-500)', color: 'white', borderColor: 'var(--emerald-500)' } : {}}
          >
            {l === 'en' ? 'English' : 'Urdu'}
          </button>
        ))}
      </div>

      <div className="dua-translation" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        {lang === 'en' ? dua.english : dua.urdu}
      </div>

      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gold-500)', marginTop: 'var(--sp-2)', fontWeight: 500 }}>
        {dua.ref}
      </div>
      {dua.note && (
        <div style={{ fontSize: '0.65rem', color: 'var(--danger)', opacity: 0.8, marginTop: 'var(--sp-1)', lineHeight: 1.5, fontStyle: 'italic' }}>
          {dua.note}
        </div>
      )}
    </div>
  );
}

function DuaCategory({ cat }) {
  const [open, setOpen] = useState(false);
  const CatIcon = CATEGORY_ICONS[cat.id] || IconDua;

  return (
    <div style={{ marginBottom: 'var(--sp-2)' }}>
      <div className="category-header" onClick={() => setOpen(!open)}>
        <div className="category-icon" style={{ background: cat.bg }}>
          <CatIcon size={20} style={{ color: cat.color }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-primary)' }}>{cat.title}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{cat.duas.length} duas</div>
        </div>
        <div className="font-amiri" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginRight: 'var(--sp-2)' }}>{cat.titleAr}</div>
        <div className={`category-chevron${open ? ' open' : ''}`}>
          <IconChevronDown size={18} style={{ color: 'var(--text-tertiary)' }} />
        </div>
      </div>
      {open && (
        <div style={{ paddingLeft: 'var(--sp-2)', paddingTop: 'var(--sp-2)' }} className="animate-fade-up">
          {cat.duas.map(d => <DuaCard key={d.id} dua={d} />)}
        </div>
      )}
    </div>
  );
}

function AdhkarCard({ item, index, onTap, count }) {
  const pct = Math.min(100, Math.round((count / item.c) * 100));
  const done = count >= item.c;

  return (
    <div
      className={`adhkar-card worshipv2-adhkar-card${done ? ' is-done' : ''}`}
      onClick={onTap}
    >
      <div className="arabic-text" style={{ fontSize: 'var(--arabic-sm)', color: 'var(--emerald-700)', marginBottom: 'var(--sp-2)' }}>
        {item.a}
      </div>
      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 'var(--sp-1)' }}>
        {item.t}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 'var(--text-xs)', color: done ? 'var(--success)' : 'var(--gold-500)', fontWeight: 600 }}>
          {done ? 'Completed' : `${count} / ${item.c}`}
        </div>
        {done && (
          <div className="worshipv2-adhkar-check" aria-hidden="true">
            ✓
          </div>
        )}
      </div>
      <div className="adhkar-progress">
        <div className="adhkar-progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function Worship() {
  const [tab, setTab] = useState('tracker');
  const [trackerTab, setTrackerTab] = useState('daily');
  const [mode, setMode] = useState('subhanallah');
  const [counts, setCounts] = useState(() => {
    const saved = {};
    Object.keys(MODES).forEach(k => {
      saved[k] = parseInt(localStorage.getItem(`mos_tb_${k}`) || '0');
    });
    return saved;
  });

  // Adhkar state
  const [adhkarTab, setAdhkarTab] = useState('morning');
  const [adhkarCounts, setAdhkarCounts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('mos_adhkar_counts') || '{}');
    } catch { return {}; }
  });
  const [trackerState, setTrackerState] = useState(() => {
    try {
      return { ...buildDefaultTrackerState(), ...JSON.parse(localStorage.getItem(TRACKER_STORAGE_KEY) || '{}') };
    } catch {
      return buildDefaultTrackerState();
    }
  });
  const [trackerDays, setTrackerDays] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(TRACKER_DAYS_KEY) || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  const count = counts[mode];
  const target = MODES[mode].target;
  const pct = Math.min(100, Math.round(count / target * 100));

  function tap() {
    const newCounts = { ...counts, [mode]: counts[mode] + 1 };
    setCounts(newCounts);
    localStorage.setItem(`mos_tb_${mode}`, newCounts[mode]);
  }

  function reset() {
    if (!confirm('Reset counter?')) return;
    const newCounts = { ...counts, [mode]: 0 };
    setCounts(newCounts);
    localStorage.setItem(`mos_tb_${mode}`, 0);
  }

  function tapAdhkar(key) {
    const next = { ...adhkarCounts, [key]: (adhkarCounts[key] || 0) + 1 };
    setAdhkarCounts(next);
    localStorage.setItem('mos_adhkar_counts', JSON.stringify(next));
  }

  const adhkarList = adhkarTab === 'morning' ? MORNING_ADHKAR : EVENING_ADHKAR;
  const activeTracker = TRACKER_MODULES.find((module) => module.id === trackerTab) || TRACKER_MODULES[0];
  const activeTrackerState = trackerState[activeTracker.id] || {};
  const activeCompleted = activeTracker.items.filter((item) => activeTrackerState[item.id]).length;
  const activePct = Math.round((activeCompleted / activeTracker.items.length) * 100);
  const overallTotal = TRACKER_MODULES.reduce((sum, module) => sum + module.items.length, 0);
  const overallCompleted = TRACKER_MODULES.reduce(
    (sum, module) => sum + module.items.filter((item) => trackerState[module.id]?.[item.id]).length,
    0
  );
  const overallPct = Math.round((overallCompleted / overallTotal) * 100);
  const streakCount = useMemo(() => getCurrentTrackerStreak(trackerDays), [trackerDays]);
  const lastThirtyDays = useMemo(() => getLastThirtyDays(), []);

  useEffect(() => {
    localStorage.setItem(TRACKER_STORAGE_KEY, JSON.stringify(trackerState));
  }, [trackerState]);

  useEffect(() => {
    const today = getTodayKey();
    const reachedThreshold = overallPct >= 70;
    const nextDays = reachedThreshold
      ? Array.from(new Set([...trackerDays, today])).sort()
      : trackerDays.filter((day) => day !== today);

    const changed = nextDays.length !== trackerDays.length || nextDays.some((day, index) => day !== trackerDays[index]);
    if (changed) {
      setTrackerDays(nextDays);
      localStorage.setItem(TRACKER_DAYS_KEY, JSON.stringify(nextDays));
    }
  }, [overallPct, trackerDays]);

  function toggleTrackerItem(moduleId, itemId) {
    setTrackerState((current) => ({
      ...current,
      [moduleId]: {
        ...current[moduleId],
        [itemId]: !current[moduleId]?.[itemId],
      },
    }));
  }

  return (
    <div className="animate-fade-up worshipv2">
      <div className="page-title f1">
        <IconPrayer size={22} style={{ color: 'var(--emerald-500)' }} />
        Worship
      </div>
      <div className="sub-tabs f2">
        {[
          { key: 'tracker', label: 'Tracker' },
          { key: 'tasbeeh', label: 'Tasbeeh' },
          { key: 'duas', label: 'Duas' },
          { key: 'adhkar', label: 'Adhkar' },
        ].map(t => (
          <button key={t.key} className={`sub-tab${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'tracker' && (
        <div className="worshipv3-tracker">
          <section className="settingsv2-panel settingsv2-panel-hero worshipv3-hero">
            <div className="settingsv2-watermark">مُحَاسَبَة</div>
            <div className="settingsv2-label">Worship Tracker</div>
            <h2>{activeTracker.title}</h2>
            <p>{activeTracker.subtitle}</p>

            <div className="worshipv3-hero-stats">
              <div className="worshipv3-stat">
                <strong>{activePct}%</strong>
                <span>This module</span>
              </div>
              <div className="worshipv3-stat">
                <strong>{overallPct}%</strong>
                <span>Overall today</span>
              </div>
              <div className="worshipv3-stat">
                <strong>{streakCount}</strong>
                <span>Day streak</span>
              </div>
            </div>
          </section>

          <div className="worshipv3-chip-row">
            {TRACKER_MODULES.map((module) => (
              <button
                key={module.id}
                type="button"
                className={`worshipv3-chip${trackerTab === module.id ? ' active' : ''}`}
                onClick={() => setTrackerTab(module.id)}
              >
                {module.chip}
              </button>
            ))}
          </div>

          <section className="worshipv3-checklist glass-card">
            <div className="worshipv3-checklist-head">
              <div className={`worshipv3-checklist-icon worshipv3-checklist-icon-${activeTracker.tone}`}>
                <activeTracker.Icon size={20} />
              </div>
              <div>
                <div className="worshipv3-checklist-title">{activeTracker.title}</div>
                <div className="worshipv3-checklist-sub">{activeTracker.subtitle}</div>
              </div>
            </div>

            <div className="worshipv3-progress-shell">
              <div className="worshipv3-progress-top">
                <span>{activeCompleted} of {activeTracker.items.length} complete</span>
                <strong>{activePct}%</strong>
              </div>
              <div className="worshipv3-progress-bar">
                <div className="worshipv3-progress-fill" style={{ width: `${activePct}%` }} />
              </div>
            </div>

            <div className="worshipv3-item-list">
              {activeTracker.items.map((item) => {
                const done = !!activeTrackerState[item.id];
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`worshipv3-item${done ? ' is-done' : ''}`}
                    onClick={() => toggleTrackerItem(activeTracker.id, item.id)}
                  >
                    <span className={`worshipv3-check${done ? ' checked' : ''}`}>{done ? '✓' : ''}</span>
                    <span className="worshipv3-item-copy">
                      <strong>{item.label}</strong>
                      {item.detail ? <small>{item.detail}</small> : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="worshipv3-streak glass-card">
            <div className="worshipv3-checklist-head">
              <div className="worshipv3-checklist-icon worshipv3-checklist-icon-gold">🔥</div>
              <div>
                <div className="worshipv3-checklist-title">30-Day Momentum</div>
                <div className="worshipv3-checklist-sub">Fills when you hit 70%+ daily</div>
              </div>
            </div>

            <div className="worshipv3-streak-grid">
              {lastThirtyDays.map((day, index) => {
                const active = trackerDays.includes(day);
                const isToday = day === getTodayKey();
                return (
                  <div key={day} className={`worshipv3-streak-cell${active ? ' active' : ''}${isToday ? ' today' : ''}`}>
                    {index + 1}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* ── TASBEEH TAB ── */}
      {tab === 'tasbeeh' && (
        <div className="glass-elevated f3 worshipv2-tasbeeh-shell" style={{ padding: 'var(--sp-8) var(--sp-6)', textAlign: 'center', marginBottom: 'var(--sp-4)' }}>
          <div className="font-amiri" style={{ fontSize: 'var(--text-4xl)', color: 'var(--emerald-700)', fontWeight: 700, lineHeight: 1 }}>{count}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--sp-1)' }}>/ {target}</div>
          <div style={{ height: 4, background: 'var(--emerald-50)', borderRadius: 'var(--r-full)', margin: 'var(--sp-4) 0', overflow: 'hidden' }}>
            <div className="progress-glow" style={{ height: '100%', background: 'linear-gradient(90deg, var(--emerald-500), var(--gold-400))', borderRadius: 'var(--r-full)', width: `${pct}%`, transition: 'width 0.2s' }} />
          </div>

          {/* Tap button with decorative rings */}
          <div style={{ position: 'relative', width: 180, height: 180, margin: 'var(--sp-4) auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} viewBox="0 0 180 180">
              <circle cx="90" cy="90" r="85" fill="none" stroke="var(--emerald-500)" strokeWidth="0.5" opacity="0.05" strokeDasharray="4 4"/>
              <circle cx="90" cy="90" r="72" fill="none" stroke="var(--emerald-500)" strokeWidth="0.5" opacity="0.04" strokeDasharray="2 6"/>
              <circle cx="90" cy="90" r="60" fill="none" stroke="var(--gold-400)" strokeWidth="0.5" opacity="0.06" strokeDasharray="3 3"/>
              {[0,45,90,135,180,225,270,315].map(deg => (
                <rect key={deg} x="87.5" y="2" width="5" height="5" rx="1"
                  fill="var(--emerald-500)" opacity="0.05"
                  transform={`rotate(${deg} 90 90)`}/>
              ))}
            </svg>
            <button
              onClick={tap}
              className="pressable worshipv2-tap-btn"
              style={{
                width: 100, height: 100, borderRadius: 'var(--r-full)',
                background: 'linear-gradient(145deg, var(--emerald-400) 0%, var(--emerald-500) 50%, var(--emerald-700) 100%)',
                color: 'white', border: '4px solid var(--white)',
                boxShadow: '0 6px 24px rgba(11,107,79,0.35), 0 2px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)',
                cursor: 'pointer', fontFamily: "'Amiri', serif",
                fontSize: 'var(--text-xl)', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', zIndex: 1,
              }}
            >
              Tap
            </button>
          </div>
          <div className="font-amiri" style={{ fontSize: 'var(--text-base)', color: 'var(--text-tertiary)', marginTop: 'var(--sp-2)' }}>{MODES[mode].label}</div>
          <div style={{ display: 'flex', gap: 'var(--sp-2)', justifyContent: 'center', marginTop: 'var(--sp-4)', flexWrap: 'wrap' }}>
            {Object.entries(MODES).map(([key, val]) => (
              <button
                key={key}
                className={`sub-tab${mode === key ? ' active' : ''}`}
                style={{ padding: '6px 14px', fontSize: 'var(--text-xs)' }}
                onClick={() => setMode(key)}
              >
                {val.display}
              </button>
            ))}
          </div>
          <button
            onClick={reset}
            className="pressable worshipv2-reset-btn"
            style={{
              marginTop: 'var(--sp-3)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)',
              cursor: 'pointer', background: 'none', border: 'none',
              textDecoration: 'underline', fontFamily: "'DM Sans', sans-serif",
              display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-1)',
            }}
          >
            <IconRefresh size={12} /> Reset Counter
          </button>
        </div>
      )}

      {/* ── DUAS TAB ── */}
      {tab === 'duas' && (
        <div>
          {DUAS_DATA.map(cat => (
            <DuaCategory key={cat.id} cat={cat} />
          ))}
        </div>
      )}

      {/* ── ADHKAR TAB ── */}
      {tab === 'adhkar' && (
        <div>
          <div style={{ display: 'flex', gap: 'var(--sp-2)', marginBottom: 'var(--sp-4)' }}>
            <button
              className={`sub-tab${adhkarTab === 'morning' ? ' active' : ''}`}
              onClick={() => setAdhkarTab('morning')}
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-1)' }}
            >
              <IconSunrise size={14} /> Morning
            </button>
            <button
              className={`sub-tab${adhkarTab === 'evening' ? ' active' : ''}`}
              onClick={() => setAdhkarTab('evening')}
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-1)' }}
            >
              <IconMoon size={14} /> Evening
            </button>
          </div>
          {adhkarList.map((item, i) => {
            const key = `${adhkarTab}_${i}`;
            return (
              <AdhkarCard
                key={key}
                item={item}
                index={i}
                count={adhkarCounts[key] || 0}
                onTap={() => tapAdhkar(key)}
              />
            );
          })}
        </div>
      )}

      <HadithFooter />
    </div>
  );
}
