import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import SURAHS_META from '../data/surahMeta';
import SURAH_TEXT from '../data/quranText.json';
import JUZ_DATA from '../data/juzData';
import { getAbsoluteAyahNumber, toArabicNum } from '../utils/ayahMapping';
import { fetchTafseer, TAFSEER_EDITIONS, DEFAULT_TAFSEER } from '../utils/tafseerApi';
import { markTodayRead } from '../utils/streakTracker';
import { markSurahProgress } from '../utils/khatmTracker';
import { shareAyahAsImage } from '../utils/shareImage';
import audioManager from '../utils/audioManager';
import { ayahAudioUrl } from '../utils/quranAudio';
import { findSegmentIndex, findTimingIndex, getSurahTimingData } from '../utils/quranTiming';
import { IconBack, IconForward, IconSettings, IconPlay, IconPause, IconMenu, IconCopy, IconShare, IconBookmark, IconBookmarkFilled, IconAutoScroll, IconSpeed, IconQuran, IconClose, IconSearch, IconImage, IconHeart } from './Icons';
import HadithFooter from './HadithFooter';

// Build search index once on module load
const SEARCH_INDEX = [];
for (const surahNum of Object.keys(SURAH_TEXT)) {
  const s = parseInt(surahNum);
  const text = SURAH_TEXT[s];
  const meta = SURAHS_META.find(m => m.n === s);
  if (!text || !meta) continue;
  for (let i = 0; i < text.e.length; i++) {
    SEARCH_INDEX.push({
      surah: s, ayah: i + 1,
      en: text.e[i].toLowerCase(),
      ur: (text.u?.[i] || '').toLowerCase(),
      ar: text.a[i],
      enRaw: text.e[i],
      urRaw: text.u?.[i] || '',
      arRaw: text.a[i],
      name: meta.nm, nameAr: meta.ar,
      abs: getAbsoluteAyahNumber(s, i + 1),
    });
  }
}
// Also index surah names for search
const SURAH_NAME_INDEX = SURAHS_META.map(s => ({
  ...s, nmLower: s.nm.toLowerCase(), mnLower: s.mn.toLowerCase(),
}));

export default function QuranReader({ onPlaySurah, reciter = 'ar.alafasy', reciters, ayahAutoplayEnabled = true, requestedSurahOpen = null }) {
  const [view, setView] = useState('list');
  const [activeSurah, setActiveSurah] = useState(null);
  const [search, setSearch] = useState('');
  const [listMode, setListMode] = useState('surahs'); // 'surahs' | 'juz'
  const [lang, setLang] = useState(() => localStorage.getItem('mos_lang') || 'en');

  // Full-text search
  const [ftSearch, setFtSearch] = useState('');
  const [ftQuery, setFtQuery] = useState('');
  const [ftVisibleCount, setFtVisibleCount] = useState(20);
  const ftDebounce = useRef(null);
  const ftSentinelRef = useRef(null);
  const [showTrans, setShowTrans] = useState(true);

  const [arabicSize, setArabicSize] = useState(() => parseFloat(localStorage.getItem('mos_arabicSize') || '1.5'));
  const [transSize, setTransSize] = useState(() => parseFloat(localStorage.getItem('mos_transSize') || '0.9'));
  const [showSettings, setShowSettings] = useState(false);

  const [audioState, setAudioState] = useState(audioManager.getState());
  const [playingAyah, setPlayingAyah] = useState(null);
  const [isSequential, setIsSequential] = useState(false);
  const [seqIndex, setSeqIndex] = useState(-1);
  const [audioToast, setAudioToast] = useState(null);
  const toastTimer = useRef(null);

  function showAudioToast(msg) {
    setAudioToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setAudioToast(null), 3500);
  }
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const isSeqRef = useRef(false);
  const seqIdxRef = useRef(-1);

  const [autoScrollOn, setAutoScrollOn] = useState(false);
  const rafRef = useRef(null);

  // ── Prev/Next navigation state ──
  const [pendingPlayAyah, setPendingPlayAyah] = useState(null); // 'first' | 'last' | null
  const longPressTimer = useRef(null);
  const longPressFired = useRef(false);

  const [openMenu, setOpenMenu] = useState(null);
  const [visibleCount, setVisibleCount] = useState(20);
  const sentinelRef = useRef(null);
  const [scrollPct, setScrollPct] = useState(0);

  // ── Karaoke word-by-word highlighting ──
  const [activeWordIdx, setActiveWordIdx] = useState(-1);
  const activeWordElRef = useRef(null);

  const [bookmarks, setBookmarks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mos_ayah_bm') || '[]'); } catch { return []; }
  });

  // ── Collections state ──
  const DEFAULT_COLLECTIONS = [
    { id: 'col_fav', name: 'Favorites', icon: 'heart', color: 'gold', ayahs: [], createdAt: new Date().toISOString() },
    { id: 'col_motiv', name: 'Motivation', icon: 'lightning', color: 'emerald', ayahs: [], createdAt: new Date().toISOString() },
    { id: 'col_duas', name: 'Duas from Quran', icon: 'hands', color: 'emerald', ayahs: [], createdAt: new Date().toISOString() },
  ];
  const [collections, setCollections] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('mos_ayah_collections') || 'null');
      return saved?.collections || DEFAULT_COLLECTIONS;
    } catch { return DEFAULT_COLLECTIONS; }
  });
  const [showCollections, setShowCollections] = useState(false);
  const [activeCollectionId, setActiveCollectionId] = useState(null);
  const [saveToCollectionAyah, setSaveToCollectionAyah] = useState(null); // {surah, ayah} to show bottom sheet
  const [collectionToast, setCollectionToast] = useState(null);
  const colToastTimer = useRef(null);
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColIcon, setNewColIcon] = useState('heart');
  const [newColColor, setNewColColor] = useState('gold');

  function saveCollections(cols) {
    setCollections(cols);
    localStorage.setItem('mos_ayah_collections', JSON.stringify({ collections: cols }));
  }

  function showColToast(msg) {
    setCollectionToast(msg);
    if (colToastTimer.current) clearTimeout(colToastTimer.current);
    colToastTimer.current = setTimeout(() => setCollectionToast(null), 2500);
  }

  function addAyahToCollection(colId, surah, ayah) {
    const updated = collections.map(c => {
      if (c.id !== colId) return c;
      if (c.ayahs.find(a => a.surah === surah && a.ayah === ayah)) return c;
      return { ...c, ayahs: [...c.ayahs, { surah, ayah }] };
    });
    saveCollections(updated);
    const col = collections.find(c => c.id === colId);
    showColToast(`Saved to ${col?.name || 'collection'}`);
    setSaveToCollectionAyah(null);
  }

  function removeAyahFromCollection(colId, surah, ayah) {
    const updated = collections.map(c => {
      if (c.id !== colId) return c;
      return { ...c, ayahs: c.ayahs.filter(a => !(a.surah === surah && a.ayah === ayah)) };
    });
    saveCollections(updated);
  }

  function favoriteCollection() {
    return collections.find((collection) => collection.id === 'col_fav') || null;
  }

  function isFavoritedAyah(surah, ayah) {
    return !!favoriteCollection()?.ayahs?.some((item) => item.surah === surah && item.ayah === ayah);
  }

  function toggleFavoriteAyah(surah, ayah) {
    const favorites = favoriteCollection();
    if (!favorites) return;

    if (favorites.ayahs.some((item) => item.surah === surah && item.ayah === ayah)) {
      removeAyahFromCollection(favorites.id, surah, ayah);
      showColToast('Removed from Favorites');
      return;
    }

    addAyahToCollection(favorites.id, surah, ayah);
  }

  function createCollection() {
    if (!newColName.trim()) return;
    const col = {
      id: `col_${Date.now()}`,
      name: newColName.trim(),
      icon: newColIcon,
      color: newColColor,
      ayahs: [],
      createdAt: new Date().toISOString(),
    };
    saveCollections([...collections, col]);
    setShowNewCollection(false);
    setNewColName('');
  }

  function deleteCollection(colId) {
    saveCollections(collections.filter(c => c.id !== colId));
    if (activeCollectionId === colId) setActiveCollectionId(null);
  }

  const COLLECTION_ICONS = { heart: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z', lightning: 'M13 2L3 14h9l-1 8 10-12h-9l1-8', hands: 'M7 20c0-4 1-6 3-8 1.5-1.5 2-3 2-5V4 M17 20c0-4-1-6-3-8-1.5-1.5-2-3-2-5V4 M5 20h14', shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', star: 'M12,2 L15.09,8.26 L22,9.27 L17,14.14 L18.18,21.02 L12,17.77 L5.82,21.02 L7,14.14 L2,9.27 L8.91,8.26z', bookmark: 'M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z' };
  const COLLECTION_COLORS = { gold: 'var(--gold-400)', emerald: 'var(--emerald-500)', blue: 'var(--blue)', danger: 'var(--danger)' };

  const [showJump, setShowJump] = useState(false);
  const [jumpVal, setJumpVal] = useState('');
  const [targetAyah, setTargetAyah] = useState(null);
  const [surahTimings, setSurahTimings] = useState([]);
  const [timingError, setTimingError] = useState('');
  const preloadRefs = useRef([]);

  // ── Per-card translation overrides ──
  const [transOnCards, setTransOnCards] = useState(new Set());
  const [transOffCards, setTransOffCards] = useState(new Set());

  // ── Tafseer state ──
  const [showTafseer, setShowTafseer] = useState(false);
  const [tafseerOnCards, setTafseerOnCards] = useState(new Set());
  const [tafseerOffCards, setTafseerOffCards] = useState(new Set());
  const [tafseerCache, setTafseerCache] = useState({});
  const [tafseerLoading, setTafseerLoading] = useState(new Set());
  const [tafseerErrors, setTafseerErrors] = useState({});
  const [tafseerExpanded, setTafseerExpanded] = useState(new Set());
  const [tafseerEdition, setTafseerEdition] = useState(() => {
    const saved = localStorage.getItem('mos_tafseer_edition');
    if (saved && TAFSEER_EDITIONS.find(e => e.id === saved)) return saved;
    const userLang = localStorage.getItem('mos_lang') || 'en';
    return userLang === 'ur' ? 'tafseer-ibn-e-kaseer-urdu' : DEFAULT_TAFSEER;
  });
  const tafseerAbortRef = useRef(new AbortController());

  const ayahElems = useRef({});

  const filteredSurahs = useMemo(() => {
    if (!search) return SURAHS_META;
    const q = search.toLowerCase();
    return SURAHS_META.filter(s =>
      s.nm.toLowerCase().includes(q) || s.mn.toLowerCase().includes(q) || String(s.n).includes(q)
    );
  }, [search]);

  const availableCount = Object.keys(SURAH_TEXT).length;
  const meta = activeSurah ? SURAHS_META.find(s => s.n === activeSurah) : null;

  const verses = useMemo(() => {
    if (!activeSurah) return [];
    const text = SURAH_TEXT[activeSurah];
    if (!text) return [];
    const arr = [];
    // Strip Bismillah prefix from verse 1 for surahs 2-114 (except 9).
    // We show a decorative Bismillah banner separately, so don't duplicate it in the text.
    const bismillahRe = /^[\u0628][\u0650]?[\u0633][\u0652]?[\u0645][\u0650]?\s+[\u0671\u0627]?[\u0644][\u0644][\u0651]?[\u064E]?[\u0647][\u0650]?\s+[\u0671\u0627]?[\u0644][\u0631][\u0651]?[\u064E]?[\u062D][\u0652]?[\u0645][\u064E]?[\u0670]?[\u0646][\u0650]?\s+[\u0671\u0627]?[\u0644][\u0631][\u0651]?[\u064E]?[\u062D][\u0650]?[\u064A][\u0645][\u0650]?\s*/;
    const stripBismillah = activeSurah !== 1 && activeSurah !== 9;
    for (let i = 0; i < text.a.length; i++) {
      let ar = text.a[i];
      if (i === 0 && stripBismillah) ar = ar.replace(bismillahRe, '');
      arr.push({ idx: i, vn: i + 1, ar, en: text.e[i], ur: text.u?.[i] || '', abs: getAbsoluteAyahNumber(activeSurah, i + 1) });
    }
    return arr;
  }, [activeSurah]);

  const visibleVerses = verses.slice(0, visibleCount);

  const lastRead = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('mos_lastRead')); } catch { return null; }
  }, [view]);

  // Full-text search results
  const ftResults = useMemo(() => {
    if (!ftQuery || ftQuery.length < 3) return [];
    const q = ftQuery.toLowerCase();
    const results = [];
    for (const v of SEARCH_INDEX) {
      if (results.length >= 50) break;
      if (v.en.includes(q) || v.ur.includes(q)) results.push(v);
    }
    if (results.length < 50) {
      for (const s of SURAH_NAME_INDEX) {
        if (s.nmLower.includes(q) || s.mnLower.includes(q)) {
          const first = SEARCH_INDEX.find(v => v.surah === s.n && v.ayah === 1);
          if (first && !results.find(r => r.surah === first.surah && r.ayah === first.ayah)) {
            results.push(first);
            if (results.length >= 50) break;
          }
        }
      }
    }
    return results;
  }, [ftQuery]);

  function handleFtSearchChange(val) {
    setFtSearch(val);
    setFtVisibleCount(20);
    if (ftDebounce.current) clearTimeout(ftDebounce.current);
    ftDebounce.current = setTimeout(() => setFtQuery(val.trim()), 300);
  }

  function clearFtSearch() {
    setFtSearch('');
    setFtQuery('');
    setFtVisibleCount(20);
  }

  useEffect(() => {
    if (!ftQuery || view !== 'list') return;
    const el = ftSentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setFtVisibleCount(c => Math.min(c + 20, ftResults.length));
    }, { rootMargin: '400px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, [ftQuery, view, ftResults.length, ftVisibleCount]);

  function highlightMatch(text, query) {
    if (!query || query.length < 3) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx < 0) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span style={{ background: 'rgba(201,168,76,0.35)', borderRadius: 2, padding: '0 2px' }}>
          {text.slice(idx, idx + query.length)}
        </span>
        {text.slice(idx + query.length)}
      </>
    );
  }

  useEffect(() => {
    return audioManager.subscribe(setAudioState);
  }, []);

  useEffect(() => { isSeqRef.current = isSequential; }, [isSequential]);
  useEffect(() => { seqIdxRef.current = seqIndex; }, [seqIndex]);

  useEffect(() => {
    audioManager.setPlaybackRate(playbackSpeed);
  }, [playbackSpeed]);

  useEffect(() => {
    if (view !== 'read' || !activeSurah) return;
    let cancelled = false;

    getSurahTimingData(activeSurah, reciter)
      .then((timings) => {
        if (!cancelled) {
          setSurahTimings(timings);
          setTimingError('');
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.warn('[QuranReader] Falling back to estimated verse timing', err);
          setSurahTimings([]);
          setTimingError(err.message || 'Timing unavailable');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [view, activeSurah, reciter]);

  useEffect(() => {
    preloadRefs.current.forEach((audio) => audio?.pause?.());
    preloadRefs.current = [];

    if (view !== 'read' || !activeSurah || visibleVerses.length === 0) return;

    const startIndex = Math.max(seqIndex, 0);
    const nextVerses = verses.slice(startIndex + 1, startIndex + 3);
    preloadRefs.current = nextVerses.map((verse) => {
      const preloadAudio = new Audio();
      preloadAudio.preload = 'auto';
      preloadAudio.src = ayahAudioUrl(reciter, verse.abs, reciters);
      return preloadAudio;
    });

    return () => {
      preloadRefs.current.forEach((audio) => audio?.pause?.());
      preloadRefs.current = [];
    };
  }, [view, activeSurah, reciter, reciters, verses, seqIndex, visibleVerses.length]);

  useEffect(() => {
    if (view !== 'read') return;
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setVisibleCount(v => Math.min(v + 20, verses.length));
    }, { rootMargin: '400px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, [view, visibleCount, verses.length]);

  useEffect(() => {
    if (view !== 'read') return;
    function onScroll() {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [view]);

  useEffect(() => {
    if (view !== 'read' || !activeSurah || !meta) return;
    let timeout;
    function onScroll() {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const center = window.innerHeight / 2;
        let closestVn = 1, closestDist = Infinity;
        for (const v of visibleVerses) {
          const el = ayahElems.current[v.abs];
          if (!el) continue;
          const rect = el.getBoundingClientRect();
          const dist = Math.abs(rect.top + rect.height / 2 - center);
          if (dist < closestDist) { closestDist = dist; closestVn = v.vn; }
        }
        localStorage.setItem('mos_lastRead', JSON.stringify({ surah: activeSurah, ayah: closestVn, name: meta.nm, ar: meta.ar }));
        markTodayRead();
        markSurahProgress(activeSurah, closestVn, meta.v);
      }, 600);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); clearTimeout(timeout); };
  }, [view, activeSurah, meta, visibleVerses]);

  useEffect(() => {
    if (autoScrollOn) {
      function step() { window.scrollBy(0, 0.8); rafRef.current = requestAnimationFrame(step); }
      rafRef.current = requestAnimationFrame(step);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [autoScrollOn]);

  useEffect(() => {
    if (playingAyah && ayahElems.current[playingAyah]) {
      ayahElems.current[playingAyah].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [playingAyah]);

  useEffect(() => {
    if (!activeSurah) {
      setActiveWordIdx(-1);
      if (audioState.playbackMode !== 'ayah') setPlayingAyah(null);
      return;
    }

    const effectiveTimings = surahTimings.length
      ? surahTimings
      : (
        audioState.playbackMode === 'surah' &&
        audioState.currentSurah === activeSurah &&
        audioState.duration > 0 &&
        verses.length > 0
      )
        ? verses.map((verse, index) => {
            const slice = (audioState.duration * 1000) / verses.length;
            return {
              verseKey: `${activeSurah}:${verse.vn}`,
              timestampFrom: Math.round(index * slice),
              timestampTo: Math.round((index + 1) * slice),
              segments: [],
            };
          })
        : [];

    if (!effectiveTimings.length) {
      setActiveWordIdx(-1);
      if (audioState.playbackMode !== 'ayah') setPlayingAyah(null);
      return;
    }

    if (audioState.playbackMode === 'surah' && audioState.currentSurah === activeSurah) {
      const positionMs = Math.max(0, Math.round(audioState.currentTime * 1000));
      const verseIdx = findTimingIndex(effectiveTimings, positionMs);
      const verseTiming = effectiveTimings[verseIdx];
      const [surahNum, ayahNum] = (verseTiming?.verseKey || '').split(':').map(Number);

      if (surahNum === activeSurah && ayahNum) {
        const abs = getAbsoluteAyahNumber(surahNum, ayahNum);
        const verse = verses.find((item) => item.abs === abs);
        const words = verse?.ar.trim().split(/\s+/) || [];
        setPlayingAyah(abs);

        if (verseTiming?.segments?.length && words.length) {
          const segIdx = findSegmentIndex(verseTiming.segments, positionMs);
          const segment = verseTiming.segments[segIdx];
          const rawWordIndex = Number(segment?.wordIndex);
          const nextIdx = Number.isFinite(rawWordIndex)
            ? rawWordIndex >= 1 && rawWordIndex <= words.length
              ? rawWordIndex - 1
              : rawWordIndex >= 0 && rawWordIndex < words.length
                ? rawWordIndex
                : Math.round((segIdx / Math.max(verseTiming.segments.length - 1, 1)) * Math.max(words.length - 1, 0))
            : Math.round((segIdx / Math.max(verseTiming.segments.length - 1, 1)) * Math.max(words.length - 1, 0));
          setActiveWordIdx(nextIdx);
        } else {
          setActiveWordIdx(-1);
        }
      }
      return;
    }

    if (audioState.playbackMode === 'ayah' && audioState.currentAyahAbs) {
      if (!audioState.isPlaying) {
        setPlayingAyah(null);
        setActiveWordIdx(-1);
        return;
      }
      const verse = verses.find((item) => item.abs === audioState.currentAyahAbs);
      const words = verse?.ar.trim().split(/\s+/) || [];
      const verseTiming = effectiveTimings.find((item) => item.verseKey === audioState.currentVerseKey);
      setPlayingAyah(audioState.currentAyahAbs);

      if (verseTiming?.segments?.length && words.length) {
        const positionMs = Math.max(0, Math.round(audioState.currentTime * 1000) + verseTiming.timestampFrom);
        const segIdx = findSegmentIndex(verseTiming.segments, positionMs);
        const segment = verseTiming.segments[segIdx];
        const rawWordIndex = Number(segment?.wordIndex);
        const nextIdx = Number.isFinite(rawWordIndex)
          ? rawWordIndex >= 1 && rawWordIndex <= words.length
            ? rawWordIndex - 1
            : rawWordIndex >= 0 && rawWordIndex < words.length
              ? rawWordIndex
              : Math.round((segIdx / Math.max(verseTiming.segments.length - 1, 1)) * Math.max(words.length - 1, 0))
          : Math.round((segIdx / Math.max(verseTiming.segments.length - 1, 1)) * Math.max(words.length - 1, 0));
        setActiveWordIdx(nextIdx);
      } else {
        setActiveWordIdx(-1);
      }
      return;
    }

    if (audioState.playbackMode !== 'ayah') {
      setPlayingAyah(null);
    }
  }, [
    activeSurah,
    audioState.currentAyahAbs,
    audioState.currentSurah,
    audioState.currentTime,
    audioState.currentVerseKey,
    audioState.duration,
    audioState.isPlaying,
    audioState.playbackMode,
    surahTimings,
    verses,
  ]);

  // ── Karaoke: auto-scroll active word into center third ──
  useEffect(() => {
    if (activeWordIdx < 0 || !activeWordElRef.current) return;
    const el = activeWordElRef.current;
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const topThird = vh / 3;
    const bottomThird = vh * 2 / 3;
    if (rect.top < topThird || rect.bottom > bottomThird) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeWordIdx]);

  // Auto-play after cross-surah navigation
  useEffect(() => {
    if (view === 'read' && verses.length > 0 && pendingPlayAyah) {
      if (pendingPlayAyah === 'first') {
        setIsSequential(true);
        playAtIndex(0);
      } else if (pendingPlayAyah === 'last') {
        setIsSequential(true);
        const lastIdx = verses.length - 1;
        if (lastIdx >= visibleCount) setVisibleCount(lastIdx + 5);
        playAtIndex(lastIdx);
      }
      setPendingPlayAyah(null);
    }
  }, [view, activeSurah, verses.length, pendingPlayAyah]);

  useEffect(() => {
    if (!requestedSurahOpen?.surah) return;
    if (view !== 'read' || activeSurah !== requestedSurahOpen.surah) {
      openSurah(requestedSurahOpen.surah);
    }
  }, [requestedSurahOpen?.revision]);

  // Auto-fetch tafseer for visible ayahs via IntersectionObserver
  useEffect(() => {
    if (!showTafseer || view !== 'read' || verses.length === 0) return;

    const elMap = new WeakMap();
    const obs = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const verse = elMap.get(entry.target);
        if (verse) doFetchTafseer(verse);
        obs.unobserve(entry.target);
      }
    }, { rootMargin: '300px' });

    for (const v of visibleVerses) {
      const el = ayahElems.current[v.abs];
      if (el && !tafseerCache[v.abs]) {
        elMap.set(el, v);
        obs.observe(el);
      }
    }

    return () => obs.disconnect();
  }, [showTafseer, view, visibleCount, tafseerEdition, activeSurah]);

  useEffect(() => {
    if (view === 'read' && targetAyah && verses.length > 0) {
      const idx = verses.findIndex(v => v.vn === targetAyah);
      if (idx >= 0) {
        if (idx >= visibleCount) { setVisibleCount(idx + 10); return; }
        setTimeout(() => {
          const v = verses[idx];
          if (v && ayahElems.current[v.abs]) {
            ayahElems.current[v.abs].scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          setTargetAyah(null);
        }, 200);
      }
    }
  }, [view, targetAyah, verses, visibleCount]);

  useEffect(() => {
    if (openMenu === null) return;
    const h = () => setOpenMenu(null);
    setTimeout(() => document.addEventListener('click', h), 0);
    return () => document.removeEventListener('click', h);
  }, [openMenu]);

  useEffect(() => {
    setVisibleCount(20);
    setOpenMenu(null);
    setShowSettings(false);
    setShowJump(false);
    setScrollPct(0);
    ayahElems.current = {};
    if (
      audioState.playbackMode === 'ayah' ||
      (audioState.playbackMode === 'surah' && audioState.currentSurah && audioState.currentSurah !== activeSurah)
    ) {
      audioManager.stop();
    }
    setPlayingAyah(null);
    setIsSequential(false);
    setSeqIndex(-1);
    setAutoScrollOn(false);
    setActiveWordIdx(-1);
    setSurahTimings([]);
    setTimingError('');
    // Reset per-card overrides (abs numbers are surah-specific in practice)
    setTransOnCards(new Set());
    setTransOffCards(new Set());
    setTafseerOnCards(new Set());
    setTafseerOffCards(new Set());
    // Cancel pending tafseer fetches for old surah
    tafseerAbortRef.current.abort();
    tafseerAbortRef.current = new AbortController();
    setTafseerLoading(new Set());
    setTafseerErrors({});
    setTafseerExpanded(new Set());
    // Keep tafseerCache — abs keys are globally unique, so cache persists across surahs
  }, [activeSurah]);

  function setLangPref(l) {
    setLang(l);
    localStorage.setItem('mos_lang', l);
    // Reset per-card translation overrides so all cards follow new global lang
    setTransOnCards(new Set());
    setTransOffCards(new Set());
  }
  function saveArabicSize(v) { setArabicSize(v); localStorage.setItem('mos_arabicSize', v); }
  function saveTransSize(v) { setTransSize(v); localStorage.setItem('mos_transSize', v); }

  // ── Translation per-card logic ──
  function shouldShowTrans(abs) {
    if (transOnCards.has(abs)) return true;
    if (transOffCards.has(abs)) return false;
    return showTrans;
  }

  function toggleCardTrans(abs) {
    const currently = shouldShowTrans(abs);
    if (currently) {
      setTransOnCards(prev => { const n = new Set(prev); n.delete(abs); return n; });
      setTransOffCards(prev => new Set(prev).add(abs));
    } else {
      setTransOffCards(prev => { const n = new Set(prev); n.delete(abs); return n; });
      setTransOnCards(prev => new Set(prev).add(abs));
    }
  }

  function toggleGlobalTrans() {
    setShowTrans(prev => !prev);
    // Reset all per-card overrides to match new global state
    setTransOnCards(new Set());
    setTransOffCards(new Set());
  }

  // ── Tafseer logic ──
  function shouldShowTafseer(abs) {
    if (tafseerOnCards.has(abs)) return true;
    if (tafseerOffCards.has(abs)) return false;
    return showTafseer;
  }

  function doFetchTafseer(verse) {
    const abs = verse.abs;
    if (tafseerCache[abs] || tafseerLoading.has(abs)) return;
    setTafseerLoading(prev => new Set(prev).add(abs));
    setTafseerErrors(prev => { const n = { ...prev }; delete n[abs]; return n; });
    fetchTafseer(activeSurah, verse.vn, tafseerEdition, tafseerAbortRef.current.signal)
      .then(text => {
        setTafseerCache(prev => ({ ...prev, [abs]: text }));
        setTafseerLoading(prev => { const n = new Set(prev); n.delete(abs); return n; });
      })
      .catch(err => {
        if (err.name === 'AbortError') return; // Cancelled — ignore silently
        setTafseerLoading(prev => { const n = new Set(prev); n.delete(abs); return n; });
        setTafseerErrors(prev => ({ ...prev, [abs]: err.message || 'Failed to load' }));
      });
  }

  function toggleCardTafseer(verse) {
    const abs = verse.abs;
    const currently = shouldShowTafseer(abs);
    if (currently) {
      // Turn off this card
      setTafseerOnCards(prev => { const n = new Set(prev); n.delete(abs); return n; });
      setTafseerOffCards(prev => new Set(prev).add(abs));
    } else {
      // Turn on this card
      setTafseerOffCards(prev => { const n = new Set(prev); n.delete(abs); return n; });
      setTafseerOnCards(prev => new Set(prev).add(abs));
      doFetchTafseer(verse);
    }
  }

  function toggleGlobalTafseer() {
    const willBeOn = !showTafseer;
    setShowTafseer(willBeOn);
    setTafseerOnCards(new Set());
    setTafseerOffCards(new Set());
    if (!willBeOn) {
      // Cancel all pending fetches when disabling
      tafseerAbortRef.current.abort();
      tafseerAbortRef.current = new AbortController();
      setTafseerLoading(new Set());
    }
  }

  function saveTafseerEdition(ed) {
    // Cancel pending fetches for old edition
    tafseerAbortRef.current.abort();
    tafseerAbortRef.current = new AbortController();
    setTafseerEdition(ed);
    localStorage.setItem('mos_tafseer_edition', ed);
    setTafseerCache({});
    setTafseerLoading(new Set());
    setTafseerErrors({});
    setTafseerExpanded(new Set());
  }

  function openSurah(num) {
    if (!SURAH_TEXT[num]) return;
    setActiveSurah(num);
    setView('read');
    window.scrollTo({ top: 0 });
  }

  function openJuz(juz) {
    const j = JUZ_DATA.find(d => d.juz === juz);
    if (!j || !SURAH_TEXT[j.start.s]) return;
    setTargetAyah(j.start.a);
    openSurah(j.start.s);
  }

  function closeReading() {
    if (audioState.playbackMode === 'ayah') {
      audioManager.stop();
    }
    setPlayingAyah(null);
    setIsSequential(false);
    setAutoScrollOn(false);
    setView('list');
    setActiveSurah(null);
    window.scrollTo({ top: 0 });
  }

  async function playAtIndex(idx) {
    const v = verses[idx];
    if (!v) return;
    const url = ayahAudioUrl(reciter, v.abs, reciters);
    try {
      await audioManager.playSource({
        playbackMode: 'ayah',
        src: url,
        reciter,
        currentSurah: activeSurah,
        currentAyahAbs: v.abs,
        currentVerseKey: `${activeSurah}:${v.vn}`,
        playbackRate: playbackSpeed,
        onEnded: () => {
          if (isSeqRef.current) {
            const next = seqIdxRef.current + 1;
            if (next < verses.length) playAtIndex(next);
            else stopAudio();
          } else {
            stopAudio();
          }
        },
        onError: () => showAudioToast('Audio unavailable'),
      });
      setSeqIndex(idx);
    } catch {}
    if (idx >= visibleCount) setVisibleCount(idx + 5);
  }

  function playSingleAyah(verse, idx) {
    setIsSequential(ayahAutoplayEnabled);
    if (audioState.playbackMode === 'ayah' && audioState.currentAyahAbs === verse.abs) {
      if (audioState.isPlaying) {
        audioManager.pause();
      } else {
        audioManager.resume();
      }
      return;
    }
    playAtIndex(idx);
  }

  function toggleSequentialPlay() {
    if (audioState.playbackMode === 'ayah' && isSequential && playingAyah) {
      if (audioState.isPlaying) {
        audioManager.pause();
      } else {
        audioManager.resume();
      }
    } else {
      setIsSequential(true);
      playAtIndex(seqIndex >= 0 && seqIndex < verses.length ? seqIndex : 0);
    }
  }

  function stopAudio() {
    audioManager.stop();
    setPlayingAyah(null);
    setIsSequential(false);
    setSeqIndex(-1);
  }

  function cycleSpeed() {
    const speeds = [0.75, 1, 1.25];
    const i = speeds.indexOf(playbackSpeed);
    const next = speeds[(i + 1) % speeds.length];
    setPlaybackSpeed(next);
  }

  // ── Prev/Next ayah navigation ──
  function playPrevAyah() {
    if (seqIndex > 0) {
      setIsSequential(true);
      playAtIndex(seqIndex - 1);
    } else {
      goToSurahStart();
    }
  }

  function playNextAyah() {
    if (seqIndex < verses.length - 1) {
      setIsSequential(true);
      playAtIndex(seqIndex + 1);
    } else {
      stopAudio();
    }
  }

  function skipToPrevSurah() {
    if (activeSurah > 1 && SURAH_TEXT[activeSurah - 1]) {
      setPendingPlayAyah('last');
      openSurah(activeSurah - 1);
    }
  }

  function skipToNextSurah() {
    if (activeSurah < 114 && SURAH_TEXT[activeSurah + 1]) {
      setPendingPlayAyah('first');
      openSurah(activeSurah + 1);
    }
  }

  function goToSurahStart() {
    setIsSequential(true);
    playAtIndex(0);
  }

  function handlePrevPointerDown() {
    longPressFired.current = false;
    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true;
      skipToPrevSurah();
    }, 500);
  }

  function handlePrevPointerUp() {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    if (!longPressFired.current) playPrevAyah();
  }

  function handleNextPointerDown() {
    longPressFired.current = false;
    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true;
      skipToNextSurah();
    }, 500);
  }

  function handleNextPointerUp() {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    if (!longPressFired.current) playNextAyah();
  }

  useEffect(() => {
    function handleExternalPrevAyah() {
      playPrevAyah();
    }

    function handleExternalNextAyah() {
      playNextAyah();
    }

    window.addEventListener('mos:quran-prev-ayah', handleExternalPrevAyah);
    window.addEventListener('mos:quran-next-ayah', handleExternalNextAyah);

    return () => {
      window.removeEventListener('mos:quran-prev-ayah', handleExternalPrevAyah);
      window.removeEventListener('mos:quran-next-ayah', handleExternalNextAyah);
    };
  }, [seqIndex, activeSurah, verses.length, audioState.playbackMode]);

  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); } catch {}
    setOpenMenu(null);
  }

  async function shareAyah(verse) {
    const t = lang === 'en' ? verse.en : (verse.ur || verse.en);
    const text = `${verse.ar}\n\n"${t}"\n\n-- Quran ${activeSurah}:${verse.vn}`;
    if (navigator.share) {
      try { await navigator.share({ title: `Quran ${activeSurah}:${verse.vn}`, text }); } catch {}
    } else {
      await copyText(text);
    }
    setOpenMenu(null);
  }

  function toggleBookmark(id) {
    const updated = bookmarks.includes(id) ? bookmarks.filter(b => b !== id) : [...bookmarks, id];
    setBookmarks(updated);
    localStorage.setItem('mos_ayah_bm', JSON.stringify(updated));
    setOpenMenu(null);
  }

  function jumpToAyah() {
    const num = parseInt(jumpVal);
    if (!num || num < 1) return;
    const idx = verses.findIndex(v => v.vn === num);
    if (idx < 0) return;
    if (idx >= visibleCount) setVisibleCount(idx + 5);
    setShowJump(false);
    setJumpVal('');
    setTimeout(() => {
      const v = verses[idx];
      if (v && ayahElems.current[v.abs]) {
        ayahElems.current[v.abs].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  }

  // ══════════════ LIST VIEW ══════════════
  if (view === 'list') {
    const isSearching = ftQuery.length >= 3;
    const visibleResults = ftResults.slice(0, ftVisibleCount);

    return (
      <div className="animate-fade-up">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="page-title">
            <IconQuran size={22} style={{ color: 'var(--emerald-500)' }} />
            Al-Quran
          </div>
          <button
            onClick={() => setShowCollections(!showCollections)}
            className="pressable quranv2-collections-btn"
            style={{
              background: showCollections ? 'var(--emerald-500)' : 'var(--bg-glass)',
              border: `1.5px solid ${showCollections ? 'var(--emerald-500)' : 'var(--border)'}`,
              borderRadius: 'var(--r-sm)', cursor: 'pointer', padding: '5px 10px',
              display: 'flex', alignItems: 'center', gap: 'var(--sp-1)',
              fontSize: '0.68rem', fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
              color: showCollections ? 'white' : 'var(--text-secondary)',
            }}
          >
            <IconBookmark size={14} /> Collections
          </button>
        </div>
        <div className="page-subtitle">
          {availableCount > 0 ? `${availableCount} surahs · Arabic + English + Urdu` : 'Loading...'}
        </div>

        {/* Continue Reading */}
        {!isSearching && lastRead && SURAH_TEXT[lastRead.surah] && (
          <div
            onClick={() => { setTargetAyah(lastRead.ayah); openSurah(lastRead.surah); }}
            className="glass-dark pressable quran-continue-card"
            style={{
              display: 'flex', alignItems: 'center', gap: 'var(--sp-3)',
              background: 'linear-gradient(135deg, var(--emerald-700), var(--emerald-500))',
              borderRadius: 'var(--r-lg)', padding: '14px 18px', marginBottom: 'var(--sp-4)',
            }}
          >
            <IconQuran size={20} style={{ color: 'white', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Continue Reading</div>
              <div style={{ fontSize: 'var(--text-xs)', opacity: .75 }}>
                {lastRead.name || `Surah ${lastRead.surah}`} {lastRead.ar ? `- ${lastRead.ar}` : ''} · Ayah {lastRead.ayah}
              </div>
            </div>
            <IconForward size={16} style={{ color: 'white', flexShrink: 0 }} />
          </div>
        )}

        {/* Collections View */}
        {showCollections && !isSearching && (
          activeCollectionId ? (() => {
            const col = collections.find(c => c.id === activeCollectionId);
            if (!col) return null;
            return (
              <div style={{ marginBottom: 'var(--sp-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 'var(--sp-3)' }}>
                  <button onClick={() => setActiveCollectionId(null)} className="pressable" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-secondary)' }}>
                    <IconBack size={18} />
                  </button>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-base)' }}>{col.name}</div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>{col.ayahs.length} ayah{col.ayahs.length !== 1 ? 's' : ''}</div>
                  </div>
                  <button onClick={() => { if (confirm(`Delete "${col.name}"?`)) deleteCollection(col.id); }} className="pressable" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-tertiary)' }}>
                    <IconClose size={16} />
                  </button>
                </div>
                {col.ayahs.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 'var(--sp-8) 0', color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
                    No ayahs saved yet. Use the bookmark button on any ayah to save it here.
                  </div>
                )}
                {col.ayahs.map(a => {
                  const text = SURAH_TEXT[a.surah];
                  const sMeta = SURAHS_META.find(m => m.n === a.surah);
                  if (!text || !sMeta) return null;
                  const ar = text.a[a.ayah - 1] || '';
                  const en = text.e[a.ayah - 1] || '';
                  return (
                    <div key={`${a.surah}:${a.ayah}`} className="glass-card" style={{ padding: 'var(--sp-3) var(--sp-4)', marginBottom: 'var(--sp-2)', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-2)' }}>
                        <div onClick={() => { setTargetAyah(a.ayah); setShowCollections(false); setActiveCollectionId(null); openSurah(a.surah); }} style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--emerald-700)', cursor: 'pointer' }}>
                          {sMeta.nm} {a.surah}:{a.ayah}
                        </div>
                        <button onClick={() => removeAyahFromCollection(col.id, a.surah, a.ayah)} className="pressable" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--text-tertiary)', fontSize: '0.6rem' }}>
                          Remove
                        </button>
                      </div>
                      <div className="font-amiri" style={{ fontSize: '1rem', color: 'var(--emerald-700)', direction: 'rtl', textAlign: 'right', lineHeight: 2, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                        {ar}
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5, fontStyle: 'italic', marginTop: 'var(--sp-1)' }}>
                        &ldquo;{en}&rdquo;
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })() : (
            <div style={{ marginBottom: 'var(--sp-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 'var(--sp-3)' }}>
                <button className="back-btn" onClick={() => setShowCollections(false)}>
                  <IconBack size={16} />
                </button>
                <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-primary)' }}>Collections</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 'var(--sp-3)' }}>
                {collections.map(c => (
                  <div
                    key={c.id}
                    onClick={() => setActiveCollectionId(c.id)}
                    className="glass-card pressable"
                    style={{ padding: 'var(--sp-4)', marginBottom: 0, cursor: 'pointer', textAlign: 'center' }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={COLLECTION_COLORS[c.color] || 'var(--gold-400)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 'var(--sp-2)' }}>
                      <path d={COLLECTION_ICONS[c.icon] || COLLECTION_ICONS.heart} />
                    </svg>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{c.ayahs.length} ayah{c.ayahs.length !== 1 ? 's' : ''}</div>
                  </div>
                ))}
              </div>

              {/* New Collection Form */}
              {showNewCollection ? (
                <div className="glass-surface" style={{ padding: 'var(--sp-4)', marginBottom: 'var(--sp-2)' }}>
                  <input
                    value={newColName} onChange={(e) => setNewColName(e.target.value)}
                    placeholder="Collection name..."
                    className="search-box" style={{ marginBottom: 'var(--sp-3)' }}
                  />
                  <div style={{ display: 'flex', gap: 'var(--sp-2)', marginBottom: 'var(--sp-3)', flexWrap: 'wrap' }}>
                    {Object.keys(COLLECTION_ICONS).map(ic => (
                      <button key={ic} onClick={() => setNewColIcon(ic)} className="pressable" style={{
                        width: 36, height: 36, borderRadius: 'var(--r-sm)',
                        border: `2px solid ${newColIcon === ic ? 'var(--emerald-500)' : 'var(--border)'}`,
                        background: newColIcon === ic ? 'var(--emerald-50)' : 'var(--bg-glass)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={COLLECTION_ICONS[ic]} /></svg>
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--sp-2)', marginBottom: 'var(--sp-3)' }}>
                    {Object.keys(COLLECTION_COLORS).map(cl => (
                      <button key={cl} onClick={() => setNewColColor(cl)} className="pressable" style={{
                        width: 28, height: 28, borderRadius: 'var(--r-full)',
                        background: COLLECTION_COLORS[cl],
                        border: `3px solid ${newColColor === cl ? 'var(--text-primary)' : 'transparent'}`,
                        cursor: 'pointer',
                      }} />
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                    <button onClick={createCollection} className="pressable" style={{
                      flex: 1, padding: '8px', borderRadius: 'var(--r-sm)', border: 'none',
                      background: 'var(--emerald-500)', color: 'white', cursor: 'pointer',
                      fontSize: 'var(--text-sm)', fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                    }}>Create</button>
                    <button onClick={() => setShowNewCollection(false)} className="pressable" style={{
                      padding: '8px 14px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)',
                      background: 'var(--bg-glass)', cursor: 'pointer',
                      fontSize: 'var(--text-sm)', fontFamily: "'DM Sans', sans-serif", color: 'var(--text-secondary)',
                    }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowNewCollection(true)} className="pressable" style={{
                  width: '100%', padding: '10px', borderRadius: 'var(--r-md)',
                  border: '1.5px dashed var(--border)', background: 'none', cursor: 'pointer',
                  fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', fontFamily: "'DM Sans', sans-serif",
                }}>+ New Collection</button>
              )}
            </div>
          )
        )}

        {/* Full-text search box */}
        {!showCollections && <div style={{ position: 'relative', marginBottom: 'var(--sp-3)' }}>
          <IconSearch size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-quaternary)', pointerEvents: 'none' }} />
          <input
            className="search-box"
            style={{ paddingLeft: 38, marginBottom: 0 }}
            placeholder="Search the Quran..."
            value={ftSearch}
            onChange={(e) => handleFtSearchChange(e.target.value)}
          />
          {ftSearch && (
            <button
              onClick={clearFtSearch}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-tertiary)' }}
            >
              <IconClose size={16} />
            </button>
          )}
        </div>}

        {/* Search results */}
        {!showCollections && isSearching ? (
          <>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--sp-3)', paddingLeft: 'var(--sp-1)' }}>
              {ftResults.length} result{ftResults.length !== 1 ? 's' : ''} for &ldquo;{ftQuery}&rdquo;
            </div>
            {visibleResults.map(r => (
              <div
                key={`${r.surah}:${r.ayah}`}
                className="glass-card pressable"
                onClick={() => { setTargetAyah(r.ayah); clearFtSearch(); openSurah(r.surah); }}
                style={{ padding: 'var(--sp-3) var(--sp-4)', marginBottom: 'var(--sp-2)', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-2)' }}>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--emerald-700)' }}>
                    {r.name} {r.surah}:{r.ayah}
                  </div>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        await audioManager.playSource({
                          playbackMode: 'ayah',
                          src: ayahAudioUrl(reciter, r.abs, reciters),
                          reciter,
                          currentSurah: r.surah,
                          currentAyahAbs: r.abs,
                          currentVerseKey: `${r.surah}:${r.ayah}`,
                          playbackRate: playbackSpeed,
                          onEnded: () => audioManager.stop(),
                          onError: () => showAudioToast('Audio unavailable'),
                        });
                      } catch {}
                    }}
                    className="pressable"
                    style={{
                      width: 26, height: 26, borderRadius: 'var(--r-full)', border: '1px solid var(--border)',
                      background: 'var(--bg-glass)', cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}
                  >
                    <IconPlay size={10} style={{ color: 'var(--emerald-500)' }} />
                  </button>
                </div>
                <div className="font-amiri" style={{
                  fontSize: '1rem', color: 'var(--emerald-700)', direction: 'rtl', textAlign: 'right',
                  lineHeight: 2, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                }}>
                  {r.arRaw}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5, fontStyle: 'italic', marginTop: 'var(--sp-1)' }}>
                  {highlightMatch(r.enRaw, ftQuery)}
                </div>
              </div>
            ))}
            {ftVisibleCount < ftResults.length && (
              <div ref={ftSentinelRef} style={{ height: 1 }}>
                <div style={{ textAlign: 'center', padding: 'var(--sp-5) 0', color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)' }}>
                  Loading more results...
                </div>
              </div>
            )}
            {ftResults.length === 0 && (
              <div style={{ textAlign: 'center', padding: 'var(--sp-10) 0', color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
                No verses found matching your search.
              </div>
            )}
          </>
        ) : !showCollections ? (
          <>
            {/* Surahs / Juz toggle pills */}
            {!ftSearch && (
              <div style={{ display: 'flex', gap: 'var(--sp-2)', marginBottom: 'var(--sp-3)' }}>
                <button
                  className={`trans-pill${listMode === 'surahs' ? ' active' : ''}`}
                  onClick={() => setListMode('surahs')}
                  style={{ padding: '5px 14px', fontSize: '0.72rem' }}
                >Surahs</button>
                <button
                  className={`trans-pill${listMode === 'juz' ? ' active' : ''}`}
                  onClick={() => setListMode('juz')}
                  style={{ padding: '5px 14px', fontSize: '0.72rem' }}
                >Juz</button>
              </div>
            )}

            {listMode === 'surahs' ? (
              <>
                {/* Surah filter (only when not doing full-text search) */}
                {search || !ftSearch ? (
                  <>
                    {!ftSearch && (
                      <input
                        className="search-box"
                        placeholder="Filter surah name or number..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ marginBottom: 'var(--sp-3)' }}
                      />
                    )}

                    {filteredSurahs.map(s => {
                      const hasText = !!SURAH_TEXT[s.n];
                      return (
                        <div key={s.n} className="glass-card pressable quranv2-surah-card" style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: 'var(--sp-3) var(--sp-4)', marginBottom: 'var(--sp-2)',
                          opacity: hasText ? 1 : 0.45, cursor: hasText ? 'pointer' : 'default',
                        }}>
                          <div onClick={() => hasText && openSurah(s.n)} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', flex: 1, minWidth: 0 }}>
                            <div className="quranv2-surah-index" style={{
                              width: 36, height: 36, borderRadius: 'var(--r-sm)', background: 'var(--emerald-50)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontFamily: "'Amiri', serif", fontSize: 'var(--text-base)', fontWeight: 700,
                              color: 'var(--emerald-700)', flexShrink: 0,
                            }}>
                              {s.n}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div className="quranv2-surah-name" style={{ fontWeight: 600, fontSize: 'var(--text-base)' }}>{s.nm}</div>
                              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 1 }}>
                                {s.mn} · {s.v} verses · {s.type}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                            {hasText && onPlaySurah && (
                              <button
                                onClick={(e) => { e.stopPropagation(); onPlaySurah(s.n); }}
                                className="pressable quranv2-mini-action"
                                style={{
                                  width: 30, height: 30, borderRadius: 'var(--r-full)', border: '1.5px solid var(--border)',
                                  background: 'var(--bg-glass)', cursor: 'pointer', display: 'flex',
                                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                }}
                                aria-label={`Play ${s.nm}`}
                              >
                                <IconPlay size={12} style={{ color: 'var(--emerald-500)' }} />
                              </button>
                            )}
                            <div className="font-amiri quranv2-surah-ar" style={{ fontSize: 'var(--arabic-sm)', color: 'var(--gold-400)', flexShrink: 0 }}>
                              {s.ar}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : null}
              </>
            ) : (
              /* ── Juz Grid ── */
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {JUZ_DATA.map(j => {
                  const startMeta = SURAHS_META.find(s => s.n === j.start.s);
                  const endMeta = SURAHS_META.find(s => s.n === j.end.s);
                  return (
                    <div
                      key={j.juz}
                      onClick={() => openJuz(j.juz)}
                      className="glass-card pressable quranv2-juz-card"
                      style={{ padding: 'var(--sp-3) var(--sp-4)', marginBottom: 0, cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 'var(--sp-2)' }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 'var(--r-full)',
                          background: 'var(--emerald-50)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: "'Amiri', serif", fontSize: 'var(--text-sm)', fontWeight: 700,
                          color: 'var(--emerald-700)', flexShrink: 0,
                        }}>
                          {j.juz}
                        </div>
                        <div className="font-amiri" style={{ fontSize: '0.85rem', color: 'var(--gold-400)', lineHeight: 1.3 }}>
                          {j.name}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                        {j.nameEn}
                      </div>
                      <div style={{ fontSize: '0.58rem', color: 'var(--text-tertiary)', lineHeight: 1.4 }}>
                        {startMeta?.nm || `Surah ${j.start.s}`}:{j.start.a} — {endMeta?.nm || `Surah ${j.end.s}`}:{j.end.a}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : null}

        <HadithFooter />
      </div>
    );
  }

  // ── Derive current ayah reference ──
  const playingVerse = playingAyah ? verses.find(v => v.abs === playingAyah) : null;
  const playingRef = playingVerse && meta ? `${meta.nm} ${activeSurah}:${playingVerse.vn}` : null;

  // ══════════════ READING VIEW ══════════════
  return (
    <div className="quran-layout">
      {/* Desktop surah sidebar */}
      <aside className="quran-sidebar">
        <div className="quran-sidebar-header">
          <div className="font-amiri" style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--emerald-700)' }}>Surahs</div>
        </div>
        <div className="quran-sidebar-list">
          {SURAHS_META.filter(s => !!SURAH_TEXT[s.n]).map(s => (
            <div
              key={s.n}
              onClick={() => openSurah(s.n)}
              className={`quran-sidebar-item${s.n === activeSurah ? ' active' : ''}`}
            >
              <span className="quran-sidebar-num">{s.n}</span>
              <span className="quran-sidebar-name">{s.nm}</span>
              <span className="quran-sidebar-ar font-amiri">{s.ar}</span>
            </div>
          ))}
        </div>
      </aside>

      <div className="quran-main">
      {/* Audio toast */}
      {audioToast && (
        <div style={{
          position: 'fixed', bottom: 130, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(6,74,55,0.92)', color: 'white', padding: '8px 16px',
          borderRadius: 'var(--r-md)', fontSize: 'var(--text-xs)', zIndex: 100,
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          maxWidth: 'calc(100% - 32px)', textAlign: 'center',
          animation: 'fadeUp 0.25s ease',
        }}>
          {audioToast}
        </div>
      )}

      <div className="reading-progress">
        <div className="reading-progress-fill" style={{ width: `${scrollPct}%` }} />
      </div>

      {/* Surah banner */}
      <div className="surah-banner">
        <div className="font-amiri quranv2-banner-watermark">بِسْمِ اللَّهِ</div>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.05,
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill='none' stroke='%23C9A84C' stroke-width='0.5'%3E%3Cpolygon points='30,0 60,15 60,45 30,60 0,45 0,15'/%3E%3Cpolygon points='30,8 52,19 52,41 30,52 8,41 8,19'/%3E%3C/g%3E%3C/svg%3E\")",
          backgroundRepeat: 'repeat', backgroundSize: '60px 60px',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-3)' }}>
            <button onClick={closeReading} className="pressable" style={{
              background: 'none', border: 'none', cursor: 'pointer', color: 'white', padding: 4,
              display: 'flex', alignItems: 'center',
            }}>
              <IconBack size={22} style={{ color: 'white' }} />
            </button>

            <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
              <button onClick={() => setShowJump(!showJump)} className="pressable" style={{
                background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 'var(--r-sm)',
                cursor: 'pointer', color: 'white', padding: '4px 8px', fontSize: '0.68rem',
                fontFamily: "'DM Sans', sans-serif",
              }}>
                #{meta?.v || ''}
              </button>

              <div style={{ position: 'relative' }}>
                <button onClick={() => setShowSettings(!showSettings)} className="pressable" style={{
                  background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 'var(--r-sm)',
                  cursor: 'pointer', color: 'white', padding: 4, display: 'flex',
                }}>
                  <IconSettings size={18} style={{ color: 'white' }} />
                </button>

                {showSettings && (
                  <div className="settings-popup" onClick={(e) => e.stopPropagation()}>
                    <label>Arabic Size: {arabicSize.toFixed(1)}rem</label>
                    <input type="range" min="1.2" max="2.5" step="0.1" value={arabicSize}
                      onChange={(e) => saveArabicSize(parseFloat(e.target.value))} />
                    <label>Translation Size: {transSize.toFixed(1)}rem</label>
                    <input type="range" min="0.8" max="1.4" step="0.1" value={transSize}
                      onChange={(e) => saveTransSize(parseFloat(e.target.value))} />
                    <div className="settings-divider" />
                    <label>Tafseer Edition</label>
                    <select value={tafseerEdition} onChange={(e) => saveTafseerEdition(e.target.value)}>
                      {TAFSEER_EDITIONS.map(ed => (
                        <option key={ed.id} value={ed.id}>{ed.label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {showJump && (
            <div style={{ display: 'flex', gap: 'var(--sp-2)', marginBottom: 'var(--sp-3)' }}>
              <input
                type="number" placeholder="Ayah #" value={jumpVal}
                onChange={(e) => setJumpVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && jumpToAyah()}
                style={{
                  flex: 1, padding: '6px 12px', borderRadius: 'var(--r-sm)',
                  border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.15)',
                  color: 'white', fontSize: 'var(--text-sm)', fontFamily: "'DM Sans', sans-serif", outline: 'none',
                }}
              />
              <button onClick={jumpToAyah} className="pressable" style={{
                padding: '6px 14px', borderRadius: 'var(--r-sm)', border: 'none',
                background: 'rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer',
                fontSize: 'var(--text-xs)', fontFamily: "'DM Sans', sans-serif",
              }}>Go</button>
            </div>
          )}

          <div className="font-amiri" style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 'var(--sp-1)' }}>
            {meta?.ar}
          </div>
          <div style={{ fontSize: 'var(--text-sm)', opacity: .7, marginBottom: 'var(--sp-1)' }}>
            {meta?.nm}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', opacity: .5 }}>
            {meta?.v} verses · {meta?.type}
          </div>
          {timingError && (
            <div style={{ fontSize: '0.62rem', opacity: 0.7, marginTop: 'var(--sp-2)' }}>
              Live timing sync unavailable for this reciter right now.
            </div>
          )}
        </div>
      </div>

      {/* Bismillah divider */}
      {activeSurah !== 1 && activeSurah !== 9 && (
        <div style={{ padding: 'var(--sp-5) 0 var(--sp-4)' }}>
          <div className="glass-surface quranv2-bismillah" style={{
            padding: 'var(--sp-4) var(--sp-3) var(--sp-3)', textAlign: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
              <svg width="50" height="12" viewBox="0 0 50 12" style={{ flexShrink: 0 }}>
                <line x1="0" y1="6" x2="42" y2="6" stroke="var(--gold-400)" strokeWidth="0.8" opacity="0.4"/>
                <polygon points="44,6 48,3 48,9" fill="var(--gold-400)" opacity="0.4"/>
              </svg>
              <div className="font-amiri" style={{
                fontSize: 'var(--text-xl)', color: 'var(--gold-400)', textAlign: 'center',
                padding: '0 10px', direction: 'rtl', whiteSpace: 'nowrap', opacity: 0.9,
              }}>
                {'\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u0647\u0650 \u0627\u0644\u0631\u0651\u064E\u062D\u0652\u0645\u064E\u0670\u0646\u0650 \u0627\u0644\u0631\u0651\u064E\u062D\u0650\u064A\u0645\u0650'}
              </div>
              <svg width="50" height="12" viewBox="0 0 50 12" style={{ flexShrink: 0, transform: 'scaleX(-1)' }}>
                <line x1="0" y1="6" x2="42" y2="6" stroke="var(--gold-400)" strokeWidth="0.8" opacity="0.4"/>
                <polygon points="44,6 48,3 48,9" fill="var(--gold-400)" opacity="0.4"/>
              </svg>
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--sp-2)' }}>
              {lang === 'ur' ? '\u0634\u0631\u0648\u0639 \u0627\u0644\u0644\u06C1 \u06A9\u06D2 \u0646\u0627\u0645 \u0633\u06D2 \u062C\u0648 \u0628\u0691\u0627 \u0645\u06C1\u0631\u0628\u0627\u0646 \u0646\u06C1\u0627\u06CC\u062A \u0631\u062D\u0645 \u0648\u0627\u0644\u0627 \u06C1\u06D2' : 'In the name of Allah, the Most Gracious, the Most Merciful'}
            </div>
          </div>
        </div>
      )}

      {/* Language / Translation controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-3)', padding: '0 var(--sp-1)' }}>
        <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
          <button className={`trans-pill${showTrans ? ' active' : ''}`} onClick={toggleGlobalTrans}>
            Translation
          </button>
          <button className={`trans-pill${showTafseer ? ' active' : ''}`} onClick={toggleGlobalTafseer}>
            Tafseer
          </button>
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-1)' }}>
          <button
            onClick={() => setLangPref('en')}
            className="pressable"
            style={{
              padding: '3px 8px', borderRadius: 'var(--r-sm)', border: 'none', cursor: 'pointer',
              background: lang === 'en' ? 'var(--emerald-500)' : 'var(--emerald-50)',
              color: lang === 'en' ? 'white' : 'var(--emerald-700)',
              fontSize: '0.65rem', fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
            }}
          >EN</button>
          <button
            onClick={() => setLangPref('ur')}
            className="font-amiri pressable"
            style={{
              padding: '3px 8px', borderRadius: 'var(--r-sm)', border: 'none', cursor: 'pointer',
              background: lang === 'ur' ? 'var(--emerald-500)' : 'var(--emerald-50)',
              color: lang === 'ur' ? 'white' : 'var(--emerald-700)',
              fontSize: 'var(--text-xs)', fontWeight: 600,
            }}
          >{'\u0627\u0631\u062F\u0648'}</button>
        </div>
      </div>

      {/* Ayah cards */}
      {visibleVerses.map((v, i) => {
        const isActive = playingAyah === v.abs;
        const bmId = `${activeSurah}:${v.vn}`;
        const isBookmarked = bookmarks.includes(bmId);
        const isFavorited = isFavoritedAyah(activeSurah, v.vn);

        return (
          <div
            key={v.abs}
            ref={el => { ayahElems.current[v.abs] = el; }}
            className={`ayah-card${isActive ? ' active' : ''}`}
          >
            {/* Top row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === v.abs ? null : v.abs); }}
                  className="pressable"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', color: 'var(--text-tertiary)' }}
                >
                  <IconMenu size={18} />
                </button>

                {openMenu === v.abs && (
                  <div className="ayah-dropdown" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => copyText(v.ar)}><IconCopy size={14} /> Copy Arabic</button>
                    <button onClick={() => copyText(lang === 'en' ? v.en : (v.ur || v.en))}><IconCopy size={14} /> Copy Translation</button>
                    <button onClick={() => shareAyah(v)}><IconShare size={14} /> Share Text</button>
                    <button onClick={() => { shareAyahAsImage(v.ar, lang === 'en' ? v.en : (v.ur || v.en), `Quran ${activeSurah}:${v.vn}`, lang); setOpenMenu(null); }}><IconImage size={14} /> Share as Image</button>
                    <button onClick={() => { setSaveToCollectionAyah({ surah: activeSurah, ayah: v.vn }); setOpenMenu(null); }}>
                      <IconBookmark size={14} /> Save to Collection
                    </button>
                    <button onClick={() => { setIsSequential(true); playAtIndex(i); setOpenMenu(null); }}>
                      <IconPlay size={14} /> Play from here
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 'var(--sp-1)' }}>
                <button className={`trans-pill${shouldShowTrans(v.abs) ? ' active' : ''}`}
                  style={{ padding: '2px 8px', fontSize: '0.62rem' }}
                  onClick={() => toggleCardTrans(v.abs)}>
                  Translation
                </button>
                <button className={`trans-pill${shouldShowTafseer(v.abs) ? ' active' : ''}`}
                  style={{ padding: '2px 8px', fontSize: '0.62rem' }}
                  onClick={() => toggleCardTafseer(v)}>
                  Tafseer
                </button>
              </div>

              <div className="font-amiri" style={{
                display: 'flex', alignItems: 'center', gap: 2,
                fontSize: 'var(--text-sm)', color: 'var(--emerald-700)', fontWeight: 700,
              }}>
                <svg width="14" height="14" viewBox="0 0 20 20" style={{ opacity: 0.4 }}>
                  <circle cx="10" cy="10" r="9" fill="none" stroke="var(--gold-400)" strokeWidth="1"/>
                  <circle cx="10" cy="10" r="6" fill="none" stroke="var(--gold-400)" strokeWidth="0.5"/>
                </svg>
                <span>{activeSurah}.{v.vn}</span>
                <svg width="14" height="14" viewBox="0 0 20 20" style={{ opacity: 0.4 }}>
                  <circle cx="10" cy="10" r="9" fill="none" stroke="var(--gold-400)" strokeWidth="1"/>
                  <circle cx="10" cy="10" r="6" fill="none" stroke="var(--gold-400)" strokeWidth="0.5"/>
                </svg>
              </div>
            </div>

            {/* Arabic text */}
            <div className="font-amiri" style={{
              fontSize: `${arabicSize}rem`, color: 'var(--emerald-700)',
              textAlign: 'center', direction: 'rtl', lineHeight: 2.4,
              letterSpacing: '0.02em', marginBottom: showTrans ? 16 : 4,
            }}>
              {isActive ? (
                <>
                  {v.ar.trim().split(/\s+/).map((word, wi, words) => (
                    <span
                      key={wi}
                      ref={wi === activeWordIdx ? (el) => { activeWordElRef.current = el; } : null}
                      className={`karaoke-word${wi === activeWordIdx ? ' active' : wi < activeWordIdx ? ' read' : ''}`}
                    >
                      {word}{wi < words.length - 1 ? ' ' : ''}
                    </span>
                  ))}
                  {' '}{'\uFD3F'}{toArabicNum(v.vn)}{'\uFD3E'}
                </>
              ) : (
                <>{v.ar} {'\uFD3F'}{toArabicNum(v.vn)}{'\uFD3E'}</>
              )}
            </div>

            {/* Translation */}
            {shouldShowTrans(v.abs) && (
              lang === 'en' ? (
                <div style={{
                  fontSize: `${transSize}rem`, color: 'var(--text-secondary)',
                  lineHeight: 1.65, fontStyle: 'italic', textAlign: 'center',
                }}>
                  &ldquo;{v.en}&rdquo;
                </div>
              ) : v.ur ? (
                <div className="font-amiri" style={{
                  fontSize: `${transSize + 0.15}rem`, color: 'var(--text-secondary)',
                  lineHeight: 1.9, direction: 'rtl', textAlign: 'right',
                }}>
                  {v.ur}
                </div>
              ) : (
                <div style={{
                  fontSize: `${transSize}rem`, color: 'var(--text-secondary)',
                  lineHeight: 1.65, fontStyle: 'italic', textAlign: 'center',
                }}>
                  &ldquo;{v.en}&rdquo;
                </div>
              )
            )}

            {/* Tafseer block */}
            {shouldShowTafseer(v.abs) && (
              tafseerErrors[v.abs] ? (
                <div className="tafseer-error">
                  {tafseerErrors[v.abs]}
                  <a onClick={() => doFetchTafseer(v)}>Retry</a>
                </div>
              ) : tafseerCache[v.abs] ? (
                <div className="tafseer-block">
                  <div className="tafseer-label">
                    {TAFSEER_EDITIONS.find(e => e.id === tafseerEdition)?.label || 'Tafseer'}
                  </div>
                  <div
                    className={`tafseer-text${tafseerExpanded.has(v.abs) ? '' : ' collapsed'}`}
                    style={{
                      fontFamily: (tafseerEdition.startsWith('ar.') || tafseerEdition.includes('urdu')) ? "'Amiri', serif" : "'DM Sans', sans-serif",
                      direction: tafseerEdition.startsWith('ar.') ? 'rtl' : 'ltr',
                      textAlign: tafseerEdition.startsWith('ar.') ? 'right' : 'left',
                    }}
                  >
                    {tafseerCache[v.abs]}
                  </div>
                  {tafseerCache[v.abs].length > 300 && (
                    <button
                      className="tafseer-read-more"
                      onClick={() => setTafseerExpanded(prev => {
                        const n = new Set(prev);
                        n.has(v.abs) ? n.delete(v.abs) : n.add(v.abs);
                        return n;
                      })}
                    >
                      {tafseerExpanded.has(v.abs) ? 'Show less' : 'Read more...'}
                    </button>
                  )}
                </div>
              ) : (
                /* Skeleton shimmer while loading or waiting for IO auto-fetch */
                <div className="tafseer-skeleton">
                  <div className="skeleton-line" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line" />
                </div>
              )
            )}

            {/* Bottom: audio + bookmark */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  onClick={() => playSingleAyah(v, i)}
                  className={`pressable${isActive ? ' audio-pulse' : ''}`}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                    color: isActive ? 'var(--emerald-500)' : 'var(--text-tertiary)',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}
                >
                  {isActive ? <IconPause size={16} /> : <IconPlay size={16} />}
                </button>

                <button
                  type="button"
                  onClick={() => toggleFavoriteAyah(activeSurah, v.vn)}
                  className="pressable"
                  aria-label={isFavorited ? `Remove ${activeSurah}:${v.vn} from favorites` : `Add ${activeSurah}:${v.vn} to favorites`}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                    color: isFavorited ? 'var(--gold-500)' : 'var(--text-tertiary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconHeart size={16} fill={isFavorited ? 'currentColor' : 'none'} />
                </button>
              </div>

              {isBookmarked && (
                <span style={{ fontSize: '0.6rem', color: 'var(--gold-500)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 'var(--sp-1)' }}>
                  <IconBookmarkFilled size={12} /> Saved
                </span>
              )}
            </div>
          </div>
        );
      })}

      {/* Virtualization sentinel */}
      {visibleCount < verses.length && (
        <div ref={sentinelRef} style={{ height: 1 }}>
          <div style={{ textAlign: 'center', padding: 'var(--sp-5) 0', color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)' }}>
            Loading more ayahs...
          </div>
        </div>
      )}

      {/* Surah navigation */}
      <div style={{ display: 'flex', gap: 'var(--sp-2)', margin: 'var(--sp-5) 0 80px' }}>
        {activeSurah > 1 && SURAH_TEXT[activeSurah - 1] && (
          <button
            onClick={() => { openSurah(activeSurah - 1); window.scrollTo({ top: 0 }); }}
            className="glass-card pressable"
            style={{ flex: 1, padding: '14px var(--sp-4)', textAlign: 'left', marginBottom: 0, cursor: 'pointer' }}
          >
            <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginBottom: 2 }}>Previous</div>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--emerald-700)' }}>
              {SURAHS_META[activeSurah - 2]?.nm}
            </div>
            <div className="font-amiri" style={{ fontSize: 'var(--text-sm)', color: 'var(--gold-400)' }}>
              {SURAHS_META[activeSurah - 2]?.ar}
            </div>
          </button>
        )}
        {activeSurah < 114 && SURAH_TEXT[activeSurah + 1] && (
          <button
            onClick={() => { openSurah(activeSurah + 1); window.scrollTo({ top: 0 }); }}
            className="glass-card pressable"
            style={{ flex: 1, padding: '14px var(--sp-4)', textAlign: 'right', marginBottom: 0, cursor: 'pointer' }}
          >
            <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginBottom: 2 }}>Next</div>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--emerald-700)' }}>
              {SURAHS_META[activeSurah]?.nm}
            </div>
            <div className="font-amiri" style={{ fontSize: 'var(--text-sm)', color: 'var(--gold-400)' }}>
              {SURAHS_META[activeSurah]?.ar}
            </div>
          </button>
        )}
      </div>

      {/* Floating reading controls */}
      <div className="reading-controls">
        {/* Top row: ayah reference */}
        {playingRef && (
          <div className="reading-controls-ref">
            {playingRef}
          </div>
        )}
        {/* Bottom row: controls */}
        <div className="reading-controls-row">
          {/* Left: auto-scroll */}
          <button
            onClick={() => setAutoScrollOn(!autoScrollOn)}
            className="pressable"
            style={{
              background: 'none', border: 'none', cursor: 'pointer', color: 'white',
              display: 'flex', alignItems: 'center', gap: 'var(--sp-1)', padding: 4,
              fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem', opacity: autoScrollOn ? 1 : 0.6,
            }}
          >
            <IconAutoScroll size={16} />
            <span>Scroll</span>
            {autoScrollOn && <span style={{ width: 6, height: 6, borderRadius: 'var(--r-full)', background: '#4ADE80', flexShrink: 0 }} />}
          </button>

          {/* Center: prev | play/pause | next */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onPointerDown={handlePrevPointerDown}
              onPointerUp={handlePrevPointerUp}
              onPointerCancel={handlePrevPointerUp}
              className="pressable"
              style={{
                width: 34, height: 34, borderRadius: 'var(--r-full)',
                background: 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', WebkitTapHighlightColor: 'transparent',
              }}
            >
              <IconBack size={16} />
            </button>

            <button
              onClick={toggleSequentialPlay}
              className="pressable"
              style={{
                width: 44, height: 44, borderRadius: 'var(--r-full)',
                background: 'white', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              {playingAyah && isSequential
                ? <IconPause size={18} style={{ color: 'var(--emerald-700)' }} />
                : <IconPlay size={18} style={{ color: 'var(--emerald-700)' }} />
              }
            </button>

            <button
              onPointerDown={handleNextPointerDown}
              onPointerUp={handleNextPointerUp}
              onPointerCancel={handleNextPointerUp}
              className="pressable"
              style={{
                width: 34, height: 34, borderRadius: 'var(--r-full)',
                background: 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', WebkitTapHighlightColor: 'transparent',
              }}
            >
              <IconForward size={16} />
            </button>
          </div>

          {/* Right: speed */}
          <button
            onClick={cycleSpeed}
            className="pressable"
            style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 'var(--r-sm)',
              cursor: 'pointer', color: 'white', padding: '4px 10px',
              fontSize: 'var(--text-xs)', fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
              display: 'flex', alignItems: 'center', gap: 'var(--sp-1)',
            }}
          >
            <IconSpeed size={14} /> {playbackSpeed}x
          </button>
        </div>
      </div>

      {/* Collection save bottom sheet */}
      {saveToCollectionAyah && (
        <div
          onClick={() => setSaveToCollectionAyah(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 480, background: 'var(--bg-primary)',
              borderRadius: 'var(--r-xl) var(--r-xl) 0 0', padding: 'var(--sp-5)',
              maxHeight: '60vh', overflowY: 'auto', animation: 'fadeUp 0.25s ease',
            }}
          >
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--sp-3)' }}>
              Save to Collection
            </div>
            {collections.map(c => (
              <div
                key={c.id}
                onClick={() => addAyahToCollection(c.id, saveToCollectionAyah.surah, saveToCollectionAyah.ayah)}
                className="pressable"
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', padding: 'var(--sp-3) var(--sp-4)',
                  borderRadius: 'var(--r-md)', marginBottom: 'var(--sp-1)', cursor: 'pointer',
                  background: 'var(--bg-glass)', border: '1px solid var(--border)',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={COLLECTION_COLORS[c.color] || 'var(--gold-400)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={COLLECTION_ICONS[c.icon] || COLLECTION_ICONS.heart} />
                </svg>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{c.name}</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>{c.ayahs.length} ayah{c.ayahs.length !== 1 ? 's' : ''}</div>
                </div>
                {c.ayahs.find(a => a.surah === saveToCollectionAyah.surah && a.ayah === saveToCollectionAyah.ayah) && (
                  <span style={{ fontSize: '0.6rem', color: 'var(--emerald-500)', fontWeight: 600 }}>Saved</span>
                )}
              </div>
            ))}
            <button
              onClick={() => { setSaveToCollectionAyah(null); setShowNewCollection(true); }}
              className="pressable"
              style={{
                display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginTop: 'var(--sp-2)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--emerald-500)',
                fontSize: 'var(--text-sm)', fontWeight: 600, padding: 'var(--sp-2) 0',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              + New Collection
            </button>
          </div>
        </div>
      )}

      {/* Collection toast */}
      {collectionToast && (
        <div style={{
          position: 'fixed', bottom: 180, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(6,74,55,0.92)', color: 'white', padding: '8px 16px',
          borderRadius: 'var(--r-md)', fontSize: 'var(--text-xs)', zIndex: 210,
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          animation: 'fadeUp 0.25s ease', whiteSpace: 'nowrap',
        }}>
          {collectionToast}
        </div>
      )}
      </div>{/* end quran-main */}
    </div>
  );
}
