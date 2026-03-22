import React, { useEffect, useMemo, useState } from 'react';
import { MORNING_ADHKAR, EVENING_ADHKAR } from '../data/adhkar';
import DUAS_DATA from '../data/duas';
import { IconBookmark, IconBookmarkFilled, IconCalendar, IconChevronDown, IconCheck, IconCompass, IconHeart, IconHome, IconLearn, IconMoon, IconPrayer, IconShield, IconSunrise } from './Icons';
import { safeGetJSON, safeSetJSON } from '../utils/safeStorage';

const TASBEEH_MODES = [
  { id: 'subhanallah', label: 'SubhanAllah', arabic: 'سُبْحَانَ ٱللَّٰهِ', target: 1000 },
  { id: 'alhamdulillah', label: 'Alhamdulillah', arabic: 'ٱلْحَمْدُ لِلَّٰهِ', target: 1000 },
  { id: 'allahuakbar', label: 'Allahu Akbar', arabic: 'ٱللَّٰهُ أَكْبَرُ', target: 1000 },
  { id: 'lailahaillallah', label: 'La ilaha illAllah', arabic: 'لَا إِلَٰهَ إِلَّا ٱللَّٰهُ', target: 1000 },
];

const SLEEP_ADHKAR = [
  { id: 'sleep_1', a: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', en: 'In Your name, O Allah, I die and I live.', ur: 'اے اللہ! تیرے نام کے ساتھ میں مرتا ہوں اور جیتا ہوں۔', c: 1, source: 'Sahih al-Bukhari' },
  { id: 'sleep_2', a: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ', en: 'O Allah, protect me from Your punishment on the Day You resurrect Your servants.', ur: 'اے اللہ! مجھے اپنے عذاب سے بچا جس دن تو اپنے بندوں کو اٹھائے گا۔', c: 3, source: 'Sunan Abi Dawud' },
  { id: 'sleep_3', a: 'سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَاللَّهُ أَكْبَرُ', en: 'SubhanAllah, Alhamdulillah, Allahu Akbar.', ur: 'سبحان اللہ، الحمدللہ، اللہ اکبر۔', c: 33, source: 'Sahih al-Bukhari' },
];

const CATEGORY_META = {
  salah: { Icon: IconPrayer, tone: 'var(--emerald-600)' },
  fasting: { Icon: IconMoon, tone: 'var(--gold-500)' },
  morning_evening: { Icon: IconSunrise, tone: 'var(--emerald-600)' },
  protection: { Icon: IconShield, tone: 'var(--emerald-600)' },
  daily: { Icon: IconHome, tone: 'var(--gold-500)' },
  forgiveness: { Icon: IconHeart, tone: 'var(--gold-500)' },
  distress: { Icon: IconHeart, tone: 'var(--emerald-600)' },
  travel: { Icon: IconCompass, tone: 'var(--gold-500)' },
  food_drink: { Icon: IconHome, tone: 'var(--gold-500)' },
  sleep: { Icon: IconMoon, tone: 'var(--emerald-600)' },
  masjid: { Icon: IconPrayer, tone: 'var(--gold-500)' },
  weather: { Icon: IconSunrise, tone: 'var(--emerald-600)' },
  social: { Icon: IconHeart, tone: 'var(--gold-500)' },
  hajj_umrah: { Icon: IconLearn, tone: 'var(--emerald-600)' },
  quranic_duas: { Icon: IconLearn, tone: 'var(--gold-500)' },
};

const CHECKLIST_ITEMS = [
  { id: 'fajr', label: 'Fajr prayer' },
  { id: 'morning_adhkar', label: 'Morning adhkar' },
  { id: 'quran', label: 'Quran reading' },
  { id: 'dhuhr', label: 'Dhuhr prayer' },
  { id: 'asr', label: 'Asr prayer' },
  { id: 'evening_adhkar', label: 'Evening adhkar' },
  { id: 'maghrib', label: 'Maghrib prayer' },
  { id: 'isha', label: 'Isha prayer' },
  { id: 'taraweeh', label: 'Taraweeh (Ramadan)' },
  { id: 'witr', label: 'Witr prayer' },
  { id: 'night_adhkar', label: 'Night adhkar' },
  { id: 'istighfar', label: '100x Istighfar' },
];

function parseCount(value) {
  return Number.parseInt(String(value).replace(/\D/g, ''), 10) || 1;
}

function getWorshipPeriod() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 20) return 'evening';
  return 'night';
}

function getWorshipDayKey(date = new Date()) {
  const shifted = new Date(date);
  shifted.setHours(shifted.getHours() - 5);
  return shifted.toISOString().slice(0, 10);
}

function getIslamicMonth() {
  try {
    const monthPart = new Intl.DateTimeFormat('en-TN-u-ca-islamic', { month: 'numeric' })
      .formatToParts(new Date())
      .find((part) => part.type === 'month');
    return Number(monthPart?.value || 0);
  } catch {
    return 0;
  }
}

function getActiveAdhkarSection(period) {
  if (period === 'morning') {
    return {
      id: 'morning',
      title: 'Morning Adhkar',
      arabicTitle: 'أذكار الصباح',
      items: MORNING_ADHKAR.map((item, index) => ({ ...item, id: `morning_${index + 1}`, en: item.t, ur: item.t, c: parseCount(item.c), source: 'Morning adhkar' })),
    };
  }

  if (period === 'evening') {
    return {
      id: 'evening',
      title: 'Evening Adhkar',
      arabicTitle: 'أذكار المساء',
      items: EVENING_ADHKAR.map((item, index) => ({ ...item, id: `evening_${index + 1}`, en: item.t, ur: item.t, c: parseCount(item.c), source: 'Evening adhkar' })),
    };
  }

  return {
    id: 'sleep',
    title: 'Sleep Adhkar',
    arabicTitle: 'أذكار النوم',
    items: SLEEP_ADHKAR,
  };
}

function getSuggestedDuas(period) {
  const day = new Date().getDay();
  const categories = [];
  if (period === 'morning') categories.push('morning_evening', 'forgiveness');
  if (period === 'evening') categories.push('morning_evening', 'protection');
  if (period === 'night') categories.push('sleep', 'forgiveness');
  if (day === 5) categories.push('salah');
  return DUAS_DATA.filter((category) => categories.includes(category.id)).flatMap((category) => category.duas).slice(0, 4);
}

function WorshipAdhkarCard({ item, count, onCount }) {
  const [lang, setLang] = useState('en');
  const target = parseCount(item.c);
  const pct = Math.min(100, Math.round((count / target) * 100));
  const complete = count >= target;

  return (
    <div
      role="button"
      tabIndex={0}
      className="glass-card"
      onClick={onCount}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onCount();
        }
      }}
      style={{
        padding: 'var(--sp-4)',
        marginBottom: 'var(--sp-3)',
        textAlign: 'left',
        position: 'relative',
        overflow: 'hidden',
        opacity: complete ? 0.78 : 1,
        background: `linear-gradient(90deg, rgba(11,107,79,${0.08 + (pct / 100) * 0.16}), rgba(255,255,255,0.72))`,
      }}
    >
      <div className="arabic-text" style={{ fontSize: '1.1rem', color: 'var(--emerald-700)', lineHeight: 1.9, marginBottom: 'var(--sp-2)' }}>{item.a}</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--sp-2)' }}>
        <button type="button" className={`trans-pill${lang === 'en' ? ' active' : ''}`} onClick={(event) => { event.stopPropagation(); setLang('en'); }}>English</button>
        <button type="button" className={`trans-pill${lang === 'ur' ? ' active' : ''}`} onClick={(event) => { event.stopPropagation(); setLang('ur'); }}>Urdu</button>
      </div>
      <div style={{ color: 'var(--text-secondary)', lineHeight: 1.65 }}>{lang === 'ur' ? item.ur : item.en}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--sp-3)' }}>
        <div style={{ color: 'var(--gold-500)', fontSize: '0.8rem' }}>{count} / {target}</div>
        <div style={{ color: 'var(--gold-500)', fontSize: '0.72rem' }}>{item.source}</div>
      </div>
      {complete && <div style={{ position: 'absolute', top: 12, right: 12, color: 'var(--gold-500)' }}><IconCheck size={16} /></div>}
    </div>
  );
}

function DuaPreviewCard({ dua, isFavorite, onToggleFavorite, onOpenQuranRef }) {
  return (
    <article className="glass-card" style={{ padding: 'var(--sp-4)', marginBottom: 'var(--sp-3)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontWeight: 700, color: 'var(--emerald-700)' }}>{dua.title}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{dua.context}</div>
        </div>
        <button type="button" onClick={() => onToggleFavorite(dua.id)} style={{ border: 0, background: 'none', color: 'var(--gold-500)' }}>
          {isFavorite ? <IconBookmarkFilled size={18} /> : <IconBookmark size={18} />}
        </button>
      </div>
      <div className="arabic-text" style={{ fontSize: '1.05rem', color: 'var(--emerald-700)', lineHeight: 2, marginTop: 'var(--sp-3)' }}>{dua.arabic}</div>
      <div style={{ color: 'var(--text-secondary)', lineHeight: 1.65, marginTop: 'var(--sp-2)' }}>{dua.english}</div>
      <button type="button" onClick={() => dua.quranRef && onOpenQuranRef?.(dua.quranRef.surah, dua.quranRef.ayah)} style={{ marginTop: 'var(--sp-2)', border: 0, background: 'none', padding: 0, color: 'var(--gold-500)', cursor: dua.quranRef ? 'pointer' : 'default' }}>
        {dua.source}
      </button>
    </article>
  );
}

export default function Worship({ onOpenQuranRef }) {
  const period = useMemo(() => getWorshipPeriod(), []);
  const section = useMemo(() => getActiveAdhkarSection(period), [period]);
  const [mode, setMode] = useState('subhanallah');
  const [tasbeehCounts, setTasbeehCounts] = useState(() => safeGetJSON('mos_tasbeeh_counts_v2', {}) || {});
  const [adhkarCounts, setAdhkarCounts] = useState(() => safeGetJSON('mos_adhkar_counts_v2', {}) || {});
  const [favoriteDuas, setFavoriteDuas] = useState(() => safeGetJSON('mos_dua_favorites', []));
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showAllAdhkar, setShowAllAdhkar] = useState(false);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const worshipDayKey = getWorshipDayKey();
  const isRamadan = getIslamicMonth() === 9;
  const checklistItems = useMemo(() => CHECKLIST_ITEMS.filter((item) => isRamadan || item.id !== 'taraweeh'), [isRamadan]);
  const [checklistState, setChecklistState] = useState(() => {
    const saved = safeGetJSON('mos_daily_checklist_v2', null);
    if (saved?.dayKey === worshipDayKey) return saved;
    return { dayKey: worshipDayKey, items: {} };
  });

  useEffect(() => {
    safeSetJSON('mos_tasbeeh_counts_v2', tasbeehCounts);
  }, [tasbeehCounts]);

  useEffect(() => {
    safeSetJSON('mos_adhkar_counts_v2', adhkarCounts);
  }, [adhkarCounts]);

  useEffect(() => {
    safeSetJSON('mos_dua_favorites', favoriteDuas);
  }, [favoriteDuas]);

  useEffect(() => {
    if (checklistState.dayKey !== worshipDayKey) {
      setChecklistState({ dayKey: worshipDayKey, items: {} });
      return;
    }
    safeSetJSON('mos_daily_checklist_v2', checklistState);
  }, [checklistState, worshipDayKey]);

  const activeMode = TASBEEH_MODES.find((item) => item.id === mode) || TASBEEH_MODES[0];
  const tasbeehCount = tasbeehCounts[mode] || 0;
  const tasbeehPct = Math.min(100, Math.round((tasbeehCount / activeMode.target) * 100));

  const adhkarProgress = section.items.reduce((sum, item) => sum + ((adhkarCounts[item.id] || 0) >= item.c ? 1 : 0), 0);
  const suggestedDuas = useMemo(() => getSuggestedDuas(period), [period]);
  const pinnedDuas = useMemo(() => DUAS_DATA.flatMap((category) => category.duas).filter((dua) => favoriteDuas.includes(dua.id)).slice(0, 8), [favoriteDuas]);
  const activeCategory = DUAS_DATA.find((category) => category.id === selectedCategory) || null;
  const checklistCompleted = checklistItems.filter((item) => checklistState.items[item.id]).length;

  function incrementTasbeeh() {
    setTasbeehCounts((current) => ({ ...current, [mode]: (current[mode] || 0) + 1 }));
    navigator.vibrate?.(10);
  }

  function toggleFavoriteDua(id) {
    setFavoriteDuas((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  return (
    <div className="animate-fade-up">
      <div className="page-title" style={{ paddingBottom: 0 }}>Worship</div>
      <div className="page-subtitle" style={{ color: 'var(--gold-500)' }}>عبادات</div>
      <div style={{ color: 'var(--text-secondary)', marginBottom: 'var(--sp-4)' }}>{period === 'morning' ? 'Morning Worship' : period === 'evening' ? 'Evening Worship' : 'Night Worship'}</div>

      <section
        className="glass-card"
        onClick={incrementTasbeeh}
        style={{
          padding: 'var(--sp-5)',
          marginBottom: 'var(--sp-5)',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          background: 'linear-gradient(145deg, rgba(11,107,79,0.96), rgba(8,82,61,0.88))',
          color: 'white',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', width: 220, height: 220, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.12)', top: -40, right: -20 }} />
          <div style={{ position: 'absolute', width: 140, height: 140, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', top: 0, right: 20 }} />
          <div className="font-amiri" style={{ position: 'absolute', right: 18, bottom: 10, fontSize: '3.2rem', opacity: 0.08 }}>{activeMode.arabic}</div>
        </div>
        <div className="font-amiri" style={{ fontSize: '1.5rem', color: 'var(--gold-300)', textAlign: 'center' }}>{activeMode.arabic}</div>
        <div style={{ textAlign: 'center', marginTop: 4, color: 'rgba(255,255,255,0.82)' }}>{activeMode.label}</div>
        <div className="font-amiri" style={{ textAlign: 'center', fontSize: '3.4rem', margin: '18px 0 6px' }}>{tasbeehCount}</div>
        <div style={{ height: 10, borderRadius: 999, background: 'rgba(255,255,255,0.14)', overflow: 'hidden' }}>
          <div style={{ width: `${tasbeehPct}%`, height: '100%', background: 'linear-gradient(90deg, var(--gold-300), var(--gold-500))' }} />
        </div>
        <div style={{ textAlign: 'center', marginTop: 8, color: 'var(--gold-200)' }}>{tasbeehCount}/{activeMode.target}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 'var(--sp-4)' }}>
          {TASBEEH_MODES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={(event) => { event.stopPropagation(); setMode(item.id); }}
              className={`ritual-pill${mode === item.id ? ' active' : ''}`}
              style={mode === item.id ? { background: 'rgba(201,168,76,0.22)', color: 'white' } : { color: 'rgba(255,255,255,0.82)', borderColor: 'rgba(255,255,255,0.12)' }}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 'var(--sp-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>Target: {activeMode.target}</div>
          <button type="button" onClick={(event) => { event.stopPropagation(); setTasbeehCounts((current) => ({ ...current, [mode]: 0 })); }} className="ritual-link-btn" style={{ color: 'var(--gold-200)' }}>Reset</button>
        </div>
      </section>

      <section style={{ marginBottom: 'var(--sp-5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 'var(--sp-2)' }}>
          <div>
            <div className="section-label">{section.title} · {section.arabicTitle}</div>
            <div style={{ color: 'var(--text-secondary)' }}>{adhkarProgress} of {section.items.length} complete</div>
          </div>
          <button type="button" className="ritual-link-btn" onClick={() => setShowAllAdhkar((value) => !value)}>{showAllAdhkar ? 'Focused View' : 'View All Adhkar'}</button>
        </div>
        <div style={{ height: 8, borderRadius: 999, background: 'rgba(11,107,79,0.1)', overflow: 'hidden', marginBottom: 'var(--sp-3)' }}>
          <div style={{ width: `${(adhkarProgress / section.items.length) * 100}%`, height: '100%', background: 'linear-gradient(90deg, var(--emerald-500), var(--gold-400))' }} />
        </div>
        {(showAllAdhkar ? [
          ...getActiveAdhkarSection('morning').items,
          ...getActiveAdhkarSection('evening').items,
          ...getActiveAdhkarSection('night').items,
        ] : section.items).map((item) => (
          <WorshipAdhkarCard
            key={item.id}
            item={item}
            count={adhkarCounts[item.id] || 0}
            onCount={() => setAdhkarCounts((current) => ({ ...current, [item.id]: Math.min((current[item.id] || 0) + 1, item.c) }))}
          />
        ))}
      </section>

      <section style={{ marginBottom: 'var(--sp-5)' }}>
        {pinnedDuas.length > 0 && (
          <>
            <div className="section-label" style={{ marginBottom: 'var(--sp-2)' }}>Pinned Duas</div>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8, marginBottom: 'var(--sp-4)' }}>
              {pinnedDuas.map((dua) => (
                <button key={dua.id} type="button" className="glass-card" onClick={() => setSelectedCategory(DUAS_DATA.find((category) => category.duas.some((item) => item.id === dua.id))?.id || null)} style={{ minWidth: 220, padding: 'var(--sp-3)', textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, color: 'var(--emerald-700)' }}>{dua.title}</div>
                  <div className="arabic-text" style={{ marginTop: 6, fontSize: '0.95rem', color: 'var(--emerald-700)' }}>{dua.arabic.slice(0, 46)}...</div>
                </button>
              ))}
            </div>
          </>
        )}

        <div className="section-label" style={{ marginBottom: 'var(--sp-3)' }}>Suggested Now</div>
        {suggestedDuas.map((dua) => (
          <DuaPreviewCard
            key={dua.id}
            dua={dua}
            isFavorite={favoriteDuas.includes(dua.id)}
            onToggleFavorite={toggleFavoriteDua}
            onOpenQuranRef={onOpenQuranRef}
          />
        ))}

        <div className="section-label" style={{ margin: 'var(--sp-4) 0 var(--sp-3)' }}>All Categories</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {DUAS_DATA.map((category) => {
            const iconMeta = CATEGORY_META[category.id] || { Icon: IconLearn, tone: 'var(--emerald-600)' };
            return (
              <button key={category.id} type="button" className="glass-card" onClick={() => setSelectedCategory(category.id)} style={{ padding: 'var(--sp-4)', textAlign: 'left', borderColor: activeCategory?.id === category.id ? 'rgba(11,107,79,0.24)' : undefined }}>
                <div style={{ width: 36, height: 36, display: 'grid', placeItems: 'center', borderRadius: 12, background: 'rgba(11,107,79,0.08)', color: iconMeta.tone, marginBottom: 10 }}>
                  <iconMeta.Icon size={18} />
                </div>
                <div style={{ fontWeight: 700, color: 'var(--emerald-700)' }}>{category.title}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>{category.duas.length} duas</div>
              </button>
            );
          })}
        </div>

        {activeCategory && (
          <div style={{ marginTop: 'var(--sp-4)' }}>
            <div className="section-label" style={{ marginBottom: 'var(--sp-2)' }}>{activeCategory.title} · {activeCategory.titleAr}</div>
            {activeCategory.duas.map((dua) => (
              <DuaPreviewCard
                key={dua.id}
                dua={dua}
                isFavorite={favoriteDuas.includes(dua.id)}
                onToggleFavorite={toggleFavoriteDua}
                onOpenQuranRef={onOpenQuranRef}
              />
            ))}
          </div>
        )}
      </section>

      <section className="glass-card" style={{ padding: 'var(--sp-4)', marginBottom: 'var(--sp-5)' }}>
        <button type="button" onClick={() => setChecklistOpen((value) => !value)} style={{ width: '100%', border: 0, background: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 0 }}>
          <div style={{ textAlign: 'left' }}>
            <div className="section-label">Daily Worship Checklist</div>
            <div style={{ color: 'var(--text-secondary)' }}>{checklistCompleted} / {checklistItems.length} complete today</div>
          </div>
          <IconChevronDown size={18} className={checklistOpen ? 'appdrawer-chevron-open' : ''} />
        </button>
        <div style={{ height: 8, borderRadius: 999, background: 'rgba(11,107,79,0.1)', overflow: 'hidden', marginTop: 'var(--sp-3)' }}>
          <div style={{ width: `${(checklistCompleted / checklistItems.length) * 100}%`, height: '100%', background: 'linear-gradient(90deg, var(--emerald-500), var(--gold-400))' }} />
        </div>
        {checklistOpen && (
          <div style={{ marginTop: 'var(--sp-4)', display: 'grid', gap: 10 }}>
            {checklistItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className="glass-card"
                onClick={() => setChecklistState((current) => ({ ...current, items: { ...current.items, [item.id]: !current.items[item.id] } }))}
                style={{ padding: 'var(--sp-3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left' }}
              >
                <span>{checklistState.items[item.id] ? '☑' : '☐'} {item.label}</span>
                {checklistState.items[item.id] && <IconCheck size={16} style={{ color: 'var(--gold-500)' }} />}
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
