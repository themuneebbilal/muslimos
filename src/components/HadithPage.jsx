import React, { useState, useMemo, useEffect } from 'react';
import { HADITH_COLLECTIONS } from '../data/hadithCollections';
import NAWAWI_DATA from '../data/hadith-nawawi.json';
import { IconStar, IconBookmarkFilled, IconHadith, IconCheck, IconShare, IconImage, IconMenu, IconCopy, IconDownload } from './Icons';
import { getCachedCount, getCollectionDownloadState, hasIncludedHadith, isFullyDownloaded, queueCollectionDownload, subscribeHadithDownloads, getDownloadQueue } from '../utils/hadithApi';
import { shareHadithAsImage, shareText } from '../utils/shareImage';
import { safeGetJSON } from '../utils/safeStorage';
import HadithFooter from './HadithFooter';

const TIER_STYLES = {
  essential: { bg: 'var(--gold-100)', color: 'var(--gold-600)', label: 'Essential' },
  primary: { bg: 'var(--emerald-50)', color: 'var(--emerald-600)', label: 'Primary' },
  secondary: { bg: 'var(--bg-secondary)', color: 'var(--text-tertiary)', label: 'Secondary' },
};

export default function HadithPage({ onOpenCollection }) {
  const [search, setSearch] = useState('');
  const [downloadTick, setDownloadTick] = useState(0);
  const [isOffline, setIsOffline] = useState(() => !navigator.onLine);
  const [bookmarks] = useState(() => safeGetJSON('mos_bookmarks', []));

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
      } else if (hasIncludedHadith(c.apiName || c.id)) {
        states[c.id] = { status: 'included', cached: getCachedCount(c.apiName || c.id) };
      } else if (isFullyDownloaded(c.id)) {
        states[c.id] = { ...getCollectionDownloadState(c.id), status: 'downloaded', cached: getCachedCount(c.id) };
      } else {
        const meta = getCollectionDownloadState(c.id);
        const count = getCachedCount(c.id);
        states[c.id] = { ...meta, status: meta.status || (count > 0 ? 'partial' : 'remote'), cached: count };
      }
    });
    return states;
  }, [downloadTick]);

  function formatNum(n) {
    return n.toLocaleString();
  }

  const [dailyMenu, setDailyMenu] = useState(false);

  useEffect(() => {
    if (!dailyMenu) return;
    const close = () => setDailyMenu(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [dailyMenu]);

  useEffect(() => subscribeHadithDownloads(() => setDownloadTick((tick) => tick + 1)), []);

  useEffect(() => {
    const handle = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', handle);
    window.addEventListener('offline', handle);
    return () => {
      window.removeEventListener('online', handle);
      window.removeEventListener('offline', handle);
    };
  }, []);

  async function shareDailyHadith() {
    if (!dailyHadith) return;
    const text = `${dailyHadith.arabic}\n\n"${dailyHadith.english}"\n\n— ${dailyHadith.reference}`;
    await shareText(text, dailyHadith.reference);
    setDailyMenu(false);
  }

  async function copyDailyText(field) {
    const text = field === 'arabic' ? dailyHadith.arabic : dailyHadith.english;
    try { await navigator.clipboard.writeText(text); } catch {}
    setDailyMenu(false);
  }

  function formatBytes(bytes) {
    if (!bytes) return '~0 MB';
    return `~${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function handleDownload(event, collection) {
    event.stopPropagation();
    const state = getCollectionDownloadState(collection.id);
    const total = collection.totalHadith.toLocaleString();
    const approx = formatBytes(Math.max(state.bytes || 0, collection.totalHadith * 1500));
    const prompt = state.status === 'error' || state.status === 'queued_resume'
      ? `Resume download for ${collection.nameEn}? (${total} hadith · ${approx})`
      : `Download ${collection.nameEn}? (${total} hadith · ${approx})`;
    if (!window.confirm(prompt)) return;
    queueCollectionDownload(collection.apiName, collection.id, collection.totalHadith);
  }

  function getCollectionActionLabel(collection, state) {
    if (collection.bundled || state.status === 'included' || state.status === 'downloaded') return null;
    if (state.status === 'downloading') return `Downloading ${Math.min(100, Math.round(((state.downloadedCount || 0) / (state.totalExpected || collection.totalHadith)) * 100))}%`;
    if (state.status === 'queued' || state.status === 'queued_resume') return 'Queued for download';
    if (state.status === 'error') return 'Resume download';
    if (state.status === 'partial') return 'Continue download';
    return 'Download offline';
  }

  return (
    <div className="animate-fade-up hadithv2-page">
      <div className="page-title f1">
        <IconHadith size={22} style={{ color: 'var(--emerald-500)' }} />
        Hadith
      </div>
      <div className="page-subtitle f2">
        Prophetic Traditions · أحاديث نبوية
      </div>

      {/* Hadith of the Day — always from Nawawi (offline) */}
      {dailyHadith && !search && (
        <div className="glass-elevated f3 hadithv2-feature" style={{
          padding: 'var(--sp-5)', marginBottom: 'var(--sp-4)',
          borderLeft: '4px solid var(--gold-400)',
          position: 'relative', zIndex: dailyMenu ? 60 : 'auto',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-3)' }}>
            <div className="section-label">
              <IconStar size={12} style={{ color: 'var(--gold-400)' }} />
              Hadith of the Day
            </div>
            <div style={{ position: 'relative' }}>
              <button onClick={(e) => { e.stopPropagation(); setDailyMenu(!dailyMenu); }} className="pressable" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '2px 6px' }}>
                <IconMenu size={18} />
              </button>
              {dailyMenu && (
                <div className="ayah-dropdown" style={{ right: 0, left: 'auto' }} onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => copyDailyText('arabic')}><IconCopy size={14} /> Copy Arabic</button>
                  <button onClick={() => copyDailyText('english')}><IconCopy size={14} /> Copy Translation</button>
                  <button onClick={shareDailyHadith}><IconShare size={14} /> Share Text</button>
                  <button onClick={() => { shareHadithAsImage(dailyHadith.arabic, dailyHadith.english, dailyHadith.reference); setDailyMenu(false); }}><IconImage size={14} /> Share as Image</button>
                </div>
              )}
            </div>
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
            <div key={h.id} className="glass-card hadithv2-card hadithv2-search-card" style={{ padding: 'var(--sp-4)', marginBottom: 'var(--sp-2)', position: 'relative' }}>
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
          <div className="f5 hadithv2-library-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 'var(--sp-4)' }}>
            {/* Saved/Bookmarks card */}
            <div
              onClick={() => onOpenCollection && onOpenCollection('_saved')}
              className="glass-card pressable hadithv2-library-card"
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
              const queueCount = getDownloadQueue().length;
              const canOpen = !isOffline || c.bundled || state.status === 'included' || state.status === 'downloaded';
              const pct = state.totalExpected ? Math.min(100, Math.round(((state.downloadedCount || 0) / state.totalExpected) * 100)) : 0;

              return (
                <div
                  key={c.id}
                  onClick={() => { if (canOpen) onOpenCollection && onOpenCollection(c.id); }}
                  className={`glass-card hadithv2-library-card${canOpen ? ' pressable' : ''}`}
                  style={{ padding: '18px 14px', textAlign: 'center', marginBottom: 0, position: 'relative', overflow: 'hidden' }}
                >
                  {!c.bundled && state.status === 'downloaded' && (
                    <div style={{ position: 'absolute', top: 10, right: 10, width: 22, height: 22, borderRadius: '999px', background: 'rgba(11,107,79,0.16)', color: 'var(--emerald-600)', display: 'grid', placeItems: 'center', zIndex: 2 }}>
                      <IconCheck size={12} />
                    </div>
                  )}

                  {!c.bundled && !hasIncludedHadith(c.apiName || c.id) && (
                    <button
                      type="button"
                      onClick={(event) => handleDownload(event, c)}
                      style={{ position: 'absolute', top: 8, left: 8, width: 28, height: 28, borderRadius: '999px', border: '1px solid rgba(11,107,79,0.16)', background: 'rgba(255,255,255,0.82)', color: 'var(--emerald-600)', display: 'grid', placeItems: 'center', zIndex: 2 }}
                    >
                      <IconDownload size={14} />
                    </button>
                  )}

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
                    <div className="font-amiri" style={{ fontSize: 'var(--text-sm)', color: state.status === 'downloaded' ? 'var(--emerald-600)' : 'var(--text-tertiary)', marginBottom: 'var(--sp-2)' }}>
                      {state.status === 'downloaded' ? 'Available Offline' : `${formatNum(c.totalHadith)} hadith`}
                    </div>

                    {/* Tier badge */}
                    <span style={{
                      display: 'inline-block', padding: '2px 8px', borderRadius: 'var(--r-full)',
                      background: tier.bg, fontSize: '0.6rem', fontWeight: 600, color: tier.color,
                    }}>
                      {tier.label}
                    </span>

                    {/* Status indicator */}
                    <div style={{ marginTop: 'var(--sp-2)', fontSize: '0.6rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--sp-1)', minHeight: 16 }}>
                      {(state.status === 'bundled' || state.status === 'downloaded') && (
                        <><IconCheck size={10} style={{ color: 'var(--success)' }} /> Available offline</>
                      )}
                      {state.status === 'included' && (
                        <><IconCheck size={10} style={{ color: 'var(--success)' }} /> {state.cached} included in app</>
                      )}
                      {(state.status === 'queued' || state.status === 'queued_resume') && (
                        <>Queued · {Math.max(queueCount - 1, 0)} remaining</>
                      )}
                      {state.status === 'downloading' && (
                        <>Downloading... {(state.downloadedCount || 0).toLocaleString()} / {c.totalHadith.toLocaleString()} · {pct}%</>
                      )}
                      {state.status === 'error' && (
                        <>Resume download</>
                      )}
                      {state.status === 'partial' && (
                        <>{state.cached} cached locally</>
                      )}
                      {state.status === 'remote' && (
                        <>{isOffline ? 'Download required' : 'Tap to browse'}</>
                      )}
                    </div>
                    {state.status === 'downloading' && (
                      <div style={{ marginTop: 'var(--sp-2)', height: 5, borderRadius: 999, background: 'rgba(11,107,79,0.08)', overflow: 'hidden', boxShadow: '0 0 10px rgba(11,107,79,0.08)' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--emerald-500), var(--gold-400))', boxShadow: '0 0 12px rgba(201,168,76,0.35)' }} />
                      </div>
                    )}
                    {getCollectionActionLabel(c, state) && (
                      <button
                        type="button"
                        onClick={(event) => handleDownload(event, c)}
                        disabled={state.status === 'downloading' || state.status === 'queued' || state.status === 'queued_resume'}
                        style={{
                          marginTop: 'var(--sp-3)',
                          width: '100%',
                          borderRadius: 999,
                          border: '1px solid rgba(11,107,79,0.16)',
                          background: state.status === 'error'
                            ? 'rgba(201,168,76,0.12)'
                            : 'rgba(11,107,79,0.08)',
                          color: state.status === 'error' ? 'var(--gold-600)' : 'var(--emerald-600)',
                          padding: '8px 10px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          opacity: state.status === 'queued' || state.status === 'queued_resume' ? 0.7 : 1,
                        }}
                      >
                        {getCollectionActionLabel(c, state)}
                      </button>
                    )}
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
