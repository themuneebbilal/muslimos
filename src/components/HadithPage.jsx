import React, { useState, useMemo } from 'react';
import { HADITH_COLLECTIONS } from '../data/hadithCollections';
import NAWAWI_DATA from '../data/hadith-nawawi.json';
import { IconStar, IconBookmarkFilled, IconHadith, IconCheck, IconForward, IconShare } from './Icons';
import { getCachedCount, isFullyDownloaded } from '../utils/hadithApi';
import HadithFooter from './HadithFooter';

const TIER_STYLES = {
  essential: { bg: 'var(--gold-100)', color: 'var(--gold-600)', label: 'Essential' },
  primary: { bg: 'var(--emerald-50)', color: 'var(--emerald-600)', label: 'Primary' },
  secondary: { bg: 'var(--bg-secondary)', color: 'var(--text-tertiary)', label: 'Secondary' },
};

export default function HadithPage({ onOpenCollection }) {
  const [search, setSearch] = useState('');
  const [bookmarks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mos_bookmarks') || '[]'); } catch { return []; }
  });

  // Daily hadith from Nawawi (always available offline)
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const dailyHadith = NAWAWI_DATA[dayOfYear % NAWAWI_DATA.length];

  // Search over bundled Nawawi + any cached hadith
  const searchResults = useMemo(() => {
    if (!search) return [];
    const q = search.toLowerCase();
    return NAWAWI_DATA.filter(h =>
      h.english.toLowerCase().includes(q) ||
      h.arabic.includes(search) ||
      h.reference.toLowerCase().includes(q)
    );
  }, [search]);

  // Collection card state
  const collectionStates = useMemo(() => {
    const states = {};
    HADITH_COLLECTIONS.forEach(c => {
      if (c.bundled) {
        states[c.id] = { status: 'bundled', cached: c.totalHadith };
      } else if (isFullyDownloaded(c.id)) {
        states[c.id] = { status: 'downloaded', cached: getCachedCount(c.apiName) };
      } else {
        const count = getCachedCount(c.apiName);
        states[c.id] = { status: count > 0 ? 'partial' : 'remote', cached: count };
      }
    });
    return states;
  }, []);

  function formatNum(n) {
    return n.toLocaleString();
  }

  async function shareDailyHadith() {
    if (!dailyHadith) return;
    const text = `${dailyHadith.arabic}\n\n"${dailyHadith.english}"\n\n\u2014 ${dailyHadith.reference}`;
    if (navigator.share) {
      try { await navigator.share({ text }); } catch {}
    } else {
      try { await navigator.clipboard.writeText(text); } catch {}
    }
  }

  return (
    <div className="animate-fade-up">
      <div className="page-title f1">
        <IconHadith size={22} style={{ color: 'var(--emerald-500)' }} />
        Hadith
      </div>
      <div className="page-subtitle f2">
        Prophetic Traditions · أحاديث نبوية
      </div>

      {/* Hadith of the Day — always from Nawawi (offline) */}
      {dailyHadith && !search && (
        <div className="glass-elevated f3" style={{
          padding: 'var(--sp-5)', marginBottom: 'var(--sp-4)',
          borderLeft: '4px solid var(--gold-400)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-3)' }}>
            <div className="section-label">
              <IconStar size={12} style={{ color: 'var(--gold-400)' }} />
              Hadith of the Day
            </div>
            <button onClick={shareDailyHadith} className="pressable" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 4 }}>
              <IconShare size={16} />
            </button>
          </div>
          <div className="arabic-text" style={{ fontSize: 'var(--arabic-sm)', color: 'var(--emerald-700)', marginBottom: 'var(--sp-3)', lineHeight: 2 }}>
            {dailyHadith.arabic}
          </div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
            &ldquo;{dailyHadith.english}&rdquo;
          </div>
          <div className="ref-text" style={{ marginTop: 'var(--sp-2)' }}>
            {dailyHadith.reference}
          </div>
        </div>
      )}

      {/* Search */}
      <input
        className="search-box"
        placeholder="Search downloaded collections..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Search results */}
      {search && (
        <div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--sp-3)' }}>
            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} in Nawawi collection
          </div>
          {searchResults.slice(0, 20).map(h => (
            <div key={h.id} className="glass-card" style={{ padding: 'var(--sp-4)', marginBottom: 'var(--sp-2)' }}>
              <div className="arabic-text" style={{ fontSize: 'var(--arabic-sm)', color: 'var(--emerald-700)', marginBottom: 'var(--sp-2)', lineHeight: 1.9 }}>
                {h.arabic}
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>&ldquo;{h.english}&rdquo;</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: 'var(--sp-2)' }}>{h.reference}</div>
            </div>
          ))}
        </div>
      )}

      {/* Collections grid */}
      {!search && (
        <>
          <div className="f5" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 'var(--sp-4)' }}>
            {/* Saved/Bookmarks card */}
            <div
              onClick={() => onOpenCollection && onOpenCollection('_saved')}
              className="glass-card pressable"
              style={{ padding: '18px 14px', textAlign: 'center', marginBottom: 0, position: 'relative', overflow: 'hidden' }}
            >
              <div style={{ marginBottom: 'var(--sp-2)' }}>
                <IconBookmarkFilled size={24} style={{ color: 'var(--danger)' }} />
              </div>
              <div className="font-amiri" style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--emerald-700)' }}>Saved</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                {bookmarks.length} hadith
              </div>
            </div>

            {/* Collection cards */}
            {HADITH_COLLECTIONS.map(c => {
              const state = collectionStates[c.id] || { status: 'remote', cached: 0 };
              const tier = TIER_STYLES[c.tier] || TIER_STYLES.secondary;
              const hasCached = state.status === 'bundled' || state.status === 'downloaded' || state.status === 'partial';

              return (
                <div
                  key={c.id}
                  onClick={() => onOpenCollection && onOpenCollection(c.id)}
                  className="glass-card pressable"
                  style={{ padding: '18px 14px', textAlign: 'center', marginBottom: 0, position: 'relative', overflow: 'hidden' }}
                >
                  {/* Watermark */}
                  <div className="font-amiri" style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%) rotate(-8deg)',
                    fontSize: '3rem', color: 'var(--emerald-500)', opacity: 0.04,
                    whiteSpace: 'nowrap', pointerEvents: 'none', lineHeight: 1,
                  }}>
                    {c.nameAr}
                  </div>

                  {/* Content */}
                  <div style={{ position: 'relative' }}>
                    <div className="font-amiri" style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--emerald-700)', marginBottom: 'var(--sp-1)' }}>
                      {c.nameAr}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--sp-2)' }}>
                      {c.nameEn}
                    </div>

                    {/* Count */}
                    <div className="font-amiri" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--sp-2)' }}>
                      {formatNum(c.totalHadith)} hadith
                    </div>

                    {/* Tier badge */}
                    <span style={{
                      display: 'inline-block', padding: '2px 8px', borderRadius: 'var(--r-full)',
                      background: tier.bg, fontSize: '0.6rem', fontWeight: 600, color: tier.color,
                    }}>
                      {tier.label}
                    </span>

                    {/* Status indicator */}
                    <div style={{ marginTop: 'var(--sp-2)', fontSize: '0.6rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--sp-1)' }}>
                      {(state.status === 'bundled' || state.status === 'downloaded') && (
                        <><IconCheck size={10} style={{ color: 'var(--success)' }} /> Available offline</>
                      )}
                      {state.status === 'partial' && (
                        <>{state.cached} cached</>
                      )}
                      {state.status === 'remote' && (
                        <>Tap to browse</>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <HadithFooter />
        </>
      )}
    </div>
  );
}
