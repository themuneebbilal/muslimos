import React, { useState } from 'react';
import { MORNING_ADHKAR, EVENING_ADHKAR } from '../data/adhkar';
import DUAS_DATA from '../data/duas';
import { IconShare, IconBookmark, IconChevronDown, IconSunrise, IconMoon, IconRefresh, IconPrayer, IconShield, IconLeaf, IconHeart, IconDua } from './Icons';
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

function DuaCard({ dua }) {
  const [lang, setLang] = useState('en');

  return (
    <div className="dua-card">
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

      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
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
      className="adhkar-card"
      onClick={onTap}
      style={{ opacity: done ? 0.5 : 1 }}
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
      </div>
      <div className="adhkar-progress">
        <div className="adhkar-progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function Worship() {
  const [tab, setTab] = useState('tasbeeh');
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

  return (
    <div className="animate-fade-up">
      <div className="page-title">
        <IconPrayer size={22} style={{ color: 'var(--emerald-500)' }} />
        Worship
      </div>
      <div className="sub-tabs">
        {[
          { key: 'tasbeeh', label: 'Tasbeeh' },
          { key: 'duas', label: 'Duas' },
          { key: 'adhkar', label: 'Adhkar' },
        ].map(t => (
          <button key={t.key} className={`sub-tab${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TASBEEH TAB ── */}
      {tab === 'tasbeeh' && (
        <div className="glass-elevated" style={{ padding: 'var(--sp-8) var(--sp-6)', textAlign: 'center', marginBottom: 'var(--sp-4)' }}>
          <div className="font-amiri" style={{ fontSize: 'var(--text-4xl)', color: 'var(--emerald-700)', fontWeight: 700, lineHeight: 1 }}>{count}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--sp-1)' }}>/ {target}</div>
          <div style={{ height: 4, background: 'var(--emerald-50)', borderRadius: 'var(--r-full)', margin: 'var(--sp-4) 0', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--emerald-500), var(--gold-400))', borderRadius: 'var(--r-full)', width: `${pct}%`, transition: 'width 0.2s' }} />
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
              className="pressable"
              style={{
                width: 100, height: 100, borderRadius: 'var(--r-full)',
                background: 'linear-gradient(135deg, var(--emerald-500), var(--emerald-700))',
                color: 'white', border: '4px solid var(--white)',
                boxShadow: 'var(--shadow-md)',
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
            className="pressable"
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
