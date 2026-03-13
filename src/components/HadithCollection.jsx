import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { HADITH_COLLECTIONS } from '../data/hadithCollections';
import NAWAWI_DATA from '../data/hadith-nawawi.json';
import { fetchHadith, fetchChapters, mapApiHadith, getCachedCount, downloadCollection, isFullyDownloaded, loadAllCached } from '../utils/hadithApi';
import { IconBack, IconShare, IconBookmark, IconBookmarkFilled, IconCheck } from './Icons';

function SkeletonCard() {
  return (
    <div className="glass-card" style={{ padding: 'var(--sp-5)', marginBottom: 'var(--sp-3)' }}>
      <div className="skeleton" style={{ width: '30%', height: 12, marginBottom: 'var(--sp-3)' }} />
      <div className="skeleton" style={{ width: '100%', height: 20, marginBottom: 'var(--sp-2)' }} />
      <div className="skeleton" style={{ width: '100%', height: 20, marginBottom: 'var(--sp-3)' }} />
      <div className="skeleton" style={{ width: '80%', height: 14, marginBottom: 'var(--sp-2)' }} />
      <div className="skeleton" style={{ width: '60%', height: 14 }} />
    </div>
  );
}

export default function HadithCollection({ collectionId, onBack }) {
  const [lang, setLang] = useState(() => localStorage.getItem('mos_lang') || 'en');
  const [search, setSearch] = useState('');
  const [bookmarks, setBookmarks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mos_bookmarks') || '[]'); } catch { return []; }
  });

  // API-driven state
  const [hadithList, setHadithList] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [chapterFilter, setChapterFilter] = useState('All');

  // Download state
  const [downloading, setDownloading] = useState(false);
  const [dlProgress, setDlProgress] = useState({ done: 0, total: 0 });

  const sentinelRef = useRef(null);
  const loadedRef = useRef(false);

  const isSaved = collectionId === '_saved';
  const collection = HADITH_COLLECTIONS.find(c => c.id === collectionId);
  const isBundled = collection?.bundled;
  const isNawawi = collectionId === 'nawawi40';

  // Get all bookmarked hadith for saved view
  const allBookmarkedHadith = useMemo(() => {
    if (!isSaved) return [];
    // Load from Nawawi + all cached collections
    const all = [];
    NAWAWI_DATA.forEach(h => {
      if (bookmarks.includes(h.id)) all.push(h);
    });
    // Also check cached API hadith
    HADITH_COLLECTIONS.forEach(c => {
      if (c.bundled) return;
      const cached = loadAllCached(c.apiName);
      cached.forEach(apiH => {
        const mapped = mapApiHadith(apiH, c.id, c.nameEn);
        if (bookmarks.includes(mapped.id)) all.push(mapped);
      });
    });
    return all;
  }, [isSaved, bookmarks]);

  // Load data on mount
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    if (isSaved) return;

    if (isNawawi) {
      setHadithList(NAWAWI_DATA);
      setHasMore(false);
      return;
    }

    // API collection: check if fully downloaded
    if (collection && isFullyDownloaded(collection.id)) {
      const all = loadAllCached(collection.apiName);
      const mapped = all.map(h => mapApiHadith(h, collection.id, collection.nameEn));
      setHadithList(mapped);
      setHasMore(false);
      return;
    }

    // Load first page from API
    if (collection?.apiName) {
      loadPage(1);
      fetchChapters(collection.apiName).then(chs => {
        if (chs.length > 0) setChapters(chs);
      });
    }
  }, [collectionId]);

  async function loadPage(p) {
    if (loading || !collection?.apiName) return;
    setLoading(true);
    setError(null);
    try {
      const { data, hasMore: more, error: err } = await fetchHadith(collection.apiName, p, 20);
      if (err) { setError(err); setLoading(false); return; }
      const mapped = data.map(h => mapApiHadith(h, collection.id, collection.nameEn));
      setHadithList(prev => {
        const ids = new Set(prev.map(h => h.id));
        return [...prev, ...mapped.filter(h => !ids.has(h.id))];
      });
      setHasMore(more);
      setPage(p);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  // Infinite scroll observer
  useEffect(() => {
    if (!hasMore || loading || isSaved || isNawawi) return;
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && hasMore && !loading) {
        loadPage(page + 1);
      }
    }, { rootMargin: '400px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loading, page]);

  // Filter
  const displayList = useMemo(() => {
    const source = isSaved ? allBookmarkedHadith : hadithList;
    let list = source;
    if (chapterFilter !== 'All') {
      list = list.filter(h => h.chapter === chapterFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(h =>
        (h.english || '').toLowerCase().includes(q) ||
        (h.arabic || '').includes(search) ||
        (h.reference || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [isSaved, allBookmarkedHadith, hadithList, chapterFilter, search]);

  // Chapter list from data
  const chapterOptions = useMemo(() => {
    const set = new Set();
    const source = isSaved ? allBookmarkedHadith : hadithList;
    source.forEach(h => { if (h.chapter) set.add(h.chapter); });
    return ['All', ...Array.from(set)];
  }, [hadithList, allBookmarkedHadith, isSaved]);

  function toggleBookmark(id) {
    const updated = bookmarks.includes(id) ? bookmarks.filter(b => b !== id) : [...bookmarks, id];
    setBookmarks(updated);
    localStorage.setItem('mos_bookmarks', JSON.stringify(updated));
  }

  async function shareHadith(h) {
    const text = `${h.arabic}\n\n"${h.english}"\n\n\u2014 ${h.reference}`;
    if (navigator.share) {
      try { await navigator.share({ title: h.reference, text }); } catch {}
    } else {
      try { await navigator.clipboard.writeText(text); } catch {}
    }
  }

  async function handleDownload() {
    if (!collection?.apiName || downloading) return;
    setDownloading(true);
    setDlProgress({ done: 0, total: collection.totalHadith });
    try {
      await downloadCollection(collection.apiName, collection.id, collection.totalHadith, (done, total) => {
        setDlProgress({ done, total });
      });
      // Reload all data
      const all = loadAllCached(collection.apiName);
      const mapped = all.map(h => mapApiHadith(h, collection.id, collection.nameEn));
      setHadithList(mapped);
      setHasMore(false);
    } catch (e) {
      setError('Download failed: ' + e.message);
    }
    setDownloading(false);
  }

  const cachedCount = collection?.apiName ? getCachedCount(collection.apiName) : (isNawawi ? 42 : 0);
  const fullyDownloaded = collection ? (isBundled || isFullyDownloaded(collection.id)) : false;

  return (
    <div className="animate-fade-up hadithv2-collection">
      {/* Header */}
      <div className="hadithv2-header" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', padding: 'var(--sp-5) 0 var(--sp-2)' }}>
        <button className="back-btn" onClick={onBack}>
          <IconBack size={16} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          {isSaved ? (
            <>
              <div className="font-amiri" style={{ fontSize: 'var(--text-xl)', color: 'var(--emerald-700)', fontWeight: 700 }}>
                Saved Hadith
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                {bookmarks.length} bookmarked
              </div>
            </>
          ) : (
            <>
              <div className="font-amiri" style={{ fontSize: 'var(--text-xl)', color: 'var(--emerald-700)', fontWeight: 700 }}>
                {collection?.nameAr}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                {collection?.nameEn} · {collection?.compiler}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Collection info */}
      {collection && !isSaved && (
        <div className="glass-surface hadithv2-info" style={{ padding: 'var(--sp-3) var(--sp-4)', marginBottom: 'var(--sp-3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
              {collection.compilerDeath} · {collection.totalHadith.toLocaleString()} hadith
            </div>
            {cachedCount > 0 && (
              <div style={{ fontSize: '0.6rem', color: 'var(--success)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 'var(--sp-1)' }}>
                {fullyDownloaded ? (
                  <><IconCheck size={10} /> Fully available offline</>
                ) : (
                  <>{cachedCount} cached locally</>
                )}
              </div>
            )}
          </div>
          {/* Download button for API collections */}
          {!isBundled && !fullyDownloaded && (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="pressable hadithv2-download"
              style={{
                padding: '6px 12px', borderRadius: 'var(--r-sm)',
                background: 'var(--emerald-50)', border: '1px solid var(--emerald-200)',
                fontSize: '0.68rem', fontWeight: 600, color: 'var(--emerald-600)',
                cursor: downloading ? 'default' : 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                opacity: downloading ? 0.7 : 1,
              }}
            >
              {downloading ? `${dlProgress.done} / ${dlProgress.total}` : 'Download All'}
            </button>
          )}
        </div>
      )}

      {/* Download progress bar */}
      {downloading && (
        <div style={{ height: 4, background: 'var(--bg-secondary)', borderRadius: 'var(--r-full)', marginBottom: 'var(--sp-3)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 'var(--r-full)',
            background: 'linear-gradient(90deg, var(--emerald-500), var(--gold-400))',
            width: `${dlProgress.total > 0 ? Math.min(100, (dlProgress.done / dlProgress.total) * 100) : 0}%`,
            transition: 'width 0.3s',
          }} />
        </div>
      )}

      {collection?.description && (
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 'var(--sp-3)', padding: '0 var(--sp-1)' }}>
          {collection.description}
        </div>
      )}

      {/* Language toggle */}
      <div className="sub-tabs" style={{ marginBottom: 'var(--sp-3)' }}>
        <button className={`sub-tab${lang === 'en' ? ' active' : ''}`} onClick={() => { setLang('en'); localStorage.setItem('mos_lang', 'en'); }}>English</button>
        <button className={`sub-tab${lang === 'ur' ? ' active' : ''}`} onClick={() => { setLang('ur'); localStorage.setItem('mos_lang', 'ur'); }}>{'\u0627\u0631\u062F\u0648'}</button>
      </div>

      {/* Chapter filter */}
      {chapterOptions.length > 2 && (
        <div style={{ display: 'flex', gap: 'var(--sp-2)', overflowX: 'auto', paddingBottom: 'var(--sp-1)', marginBottom: 'var(--sp-3)', WebkitOverflowScrolling: 'touch' }}>
          {chapterOptions.map(c => (
            <button
              key={c}
              className={`sub-tab${chapterFilter === c ? ' active' : ''}`}
              style={{ whiteSpace: 'nowrap', padding: '6px 12px', fontSize: 'var(--text-xs)', flexShrink: 0 }}
              onClick={() => setChapterFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <input
        className="search-box"
        placeholder="Search within this collection..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Error message */}
      {error && (
        <div className="glass-surface" style={{ padding: 'var(--sp-3) var(--sp-4)', marginBottom: 'var(--sp-3)', color: 'var(--danger)', fontSize: 'var(--text-sm)' }}>
          {error === 'API key not configured'
            ? 'Hadith API key not configured. Please set VITE_SUNNAH_API_KEY in environment.'
            : `Error: ${error}`}
        </div>
      )}

      {/* Watermark */}
      <div className="font-amiri" style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '12rem', color: 'var(--gold-400)', opacity: 0.025,
        pointerEvents: 'none', zIndex: 0, lineHeight: 1,
      }}>
        {'\u0627\u0644\u0644\u0647'}
      </div>

      {/* Hadith list */}
      {displayList.map(h => {
        const isBookmarked = bookmarks.includes(h.id);
        return (
          <div key={h.id} className="glass-card hadithv2-card" style={{ padding: '18px var(--sp-5)', marginBottom: 'var(--sp-3)', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-3)' }}>
              <div className="hadithv2-number" style={{
                width: 30, height: 30, borderRadius: 'var(--r-full)', background: 'var(--emerald-50)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Amiri', serif", fontSize: 'var(--text-sm)', fontWeight: 700,
                color: 'var(--emerald-700)', flexShrink: 0,
              }}>
                {h.number}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {h.chapter && (
                  <span className="hadithv2-chapter" style={{ fontSize: '0.65rem', color: 'var(--gold-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {h.chapter}
                  </span>
                )}
              </div>
            </div>

            <div className="arabic-text" style={{ fontSize: 'var(--arabic-sm)', color: 'var(--emerald-700)', marginBottom: 'var(--sp-3)', lineHeight: 2 }}>
              {h.arabic}
            </div>

            {lang === 'en' || !h.urdu ? (
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                &ldquo;{h.english}&rdquo;
              </div>
            ) : (
              <div className="font-amiri" style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', lineHeight: 1.9, direction: 'rtl', textAlign: 'right' }}>
                {h.urdu}
              </div>
            )}

            {/* No Urdu note for API hadith */}
            {lang === 'ur' && !h.urdu && (
              <div style={{ fontSize: '0.6rem', color: 'var(--text-quaternary)', fontStyle: 'italic', marginTop: 'var(--sp-1)' }}>
                Urdu translation coming soon
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--sp-3)' }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>{h.reference}</div>
                {h.grade && (
                  <span className="hadithv2-grade" style={{ fontSize: '0.6rem', color: 'var(--success)', fontWeight: 600 }}>{h.grade}</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                <button
                  onClick={() => shareHadith(h)}
                  className="pressable"
                  style={{
                    padding: '5px 10px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)',
                    background: 'var(--bg-glass)', fontSize: '0.68rem', color: 'var(--text-tertiary)',
                    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                    display: 'flex', alignItems: 'center', gap: 'var(--sp-1)',
                  }}
                >
                  <IconShare size={12} /> Share
                </button>
                <button
                  onClick={() => toggleBookmark(h.id)}
                  className="pressable"
                  style={{
                    width: 30, height: 30, borderRadius: 'var(--r-sm)', border: '1px solid var(--border)',
                    background: isBookmarked ? 'var(--danger)' : 'var(--bg-glass)',
                    color: isBookmarked ? 'white' : 'var(--text-tertiary)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  {isBookmarked ? <IconBookmarkFilled size={14} /> : <IconBookmark size={14} />}
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Loading skeletons */}
      {loading && (
        <>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </>
      )}

      {/* Infinite scroll sentinel */}
      {hasMore && !loading && !isSaved && !isNawawi && (
        <div ref={sentinelRef} style={{ height: 1 }} />
      )}

      {/* Empty state */}
      {!loading && displayList.length === 0 && (
        <div style={{ textAlign: 'center', padding: 'var(--sp-10) 0', color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
          {isSaved ? 'No bookmarked hadith yet. Tap the bookmark icon on any hadith to save it.'
           : search ? 'No hadith found matching your search.'
           : error ? 'Unable to load hadith. Please check your connection.'
           : 'Loading...'}
        </div>
      )}
    </div>
  );
}
