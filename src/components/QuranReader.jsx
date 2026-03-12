import React, { useState, useMemo, useEffect, useRef } from 'react';
import SURAHS_META from '../data/surahMeta';
import SURAH_TEXT from '../data/quranText.json';
import { getAbsoluteAyahNumber, toArabicNum } from '../utils/ayahMapping';
import { fetchTafseer, TAFSEER_EDITIONS, DEFAULT_TAFSEER } from '../utils/tafseerApi';
import { IconBack, IconForward, IconSettings, IconPlay, IconPause, IconMenu, IconCopy, IconShare, IconBookmark, IconBookmarkFilled, IconAutoScroll, IconSpeed, IconQuran } from './Icons';
import HadithFooter from './HadithFooter';

const FALLBACK_RECITER = 'ar.alafasy';

export default function QuranReader({ onPlaySurah, reciter = 'ar.alafasy', reciters }) {
  const [view, setView] = useState('list');
  const [activeSurah, setActiveSurah] = useState(null);
  const [search, setSearch] = useState('');
  const [lang, setLang] = useState(() => localStorage.getItem('mos_lang') || 'en');
  const [showTrans, setShowTrans] = useState(true);

  const [arabicSize, setArabicSize] = useState(() => parseFloat(localStorage.getItem('mos_arabicSize') || '1.5'));
  const [transSize, setTransSize] = useState(() => parseFloat(localStorage.getItem('mos_transSize') || '0.9'));
  const [showSettings, setShowSettings] = useState(false);

  const audioRef = useRef(null);
  const [playingAyah, setPlayingAyah] = useState(null);
  const [isSequential, setIsSequential] = useState(false);
  const [seqIndex, setSeqIndex] = useState(-1);
  const [audioToast, setAudioToast] = useState(null);
  const toastTimer = useRef(null);
  const errorHandled = useRef(false);

  function getAyahBitrate(recId) {
    const info = reciters?.find(r => r.id === recId);
    return info?.ayahBitrate || 128;
  }

  function ayahAudioUrl(recId, absAyah) {
    return `https://cdn.islamic.network/quran/audio/${getAyahBitrate(recId)}/${recId}/${absAyah}.mp3`;
  }

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

  const [openMenu, setOpenMenu] = useState(null);
  const [visibleCount, setVisibleCount] = useState(20);
  const sentinelRef = useRef(null);
  const [scrollPct, setScrollPct] = useState(0);

  const [bookmarks, setBookmarks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mos_ayah_bm') || '[]'); } catch { return []; }
  });

  const [showJump, setShowJump] = useState(false);
  const [jumpVal, setJumpVal] = useState('');
  const [targetAyah, setTargetAyah] = useState(null);

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

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener('error', () => {
        if (errorHandled.current) return;
        errorHandled.current = true;
        const failedUrl = audioRef.current.src;
        console.warn('[QuranReader] Audio failed:', failedUrl);
        if (!failedUrl.includes(FALLBACK_RECITER)) {
          showAudioToast('Audio unavailable for this reciter — playing Alafasy');
          const absNum = failedUrl.match(/\/(\d+)\.mp3$/)?.[1];
          if (absNum) {
            const fallbackUrl = `https://cdn.islamic.network/quran/audio/128/${FALLBACK_RECITER}/${absNum}.mp3`;
            console.log('[QuranReader] Falling back to:', fallbackUrl);
            audioRef.current.src = fallbackUrl;
            audioRef.current.play().catch(() => {});
          }
        } else {
          showAudioToast('Audio unavailable');
        }
      });
    }
    return () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; } };
  }, []);

  useEffect(() => { isSeqRef.current = isSequential; }, [isSequential]);
  useEffect(() => { seqIdxRef.current = seqIndex; }, [seqIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    function onEnded() {
      if (isSeqRef.current) {
        const next = seqIdxRef.current + 1;
        if (next < verses.length) playAtIndex(next);
        else stopAudio();
      } else {
        setPlayingAyah(null);
      }
    }
    audio.addEventListener('ended', onEnded);
    return () => audio.removeEventListener('ended', onEnded);
  }, [verses]);

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
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; }
    setPlayingAyah(null);
    setIsSequential(false);
    setSeqIndex(-1);
    setAutoScrollOn(false);
    // Reset tafseer in-memory state
    setTafseerOnCards(new Set());
    setTafseerOffCards(new Set());
    setTafseerCache({});
    setTafseerLoading(new Set());
    setTafseerErrors({});
    setTafseerExpanded(new Set());
  }, [activeSurah]);

  function setLangPref(l) { setLang(l); localStorage.setItem('mos_lang', l); }
  function saveArabicSize(v) { setArabicSize(v); localStorage.setItem('mos_arabicSize', v); }
  function saveTransSize(v) { setTransSize(v); localStorage.setItem('mos_transSize', v); }

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
    fetchTafseer(activeSurah, verse.vn, tafseerEdition)
      .then(text => {
        setTafseerCache(prev => ({ ...prev, [abs]: text }));
        setTafseerLoading(prev => { const n = new Set(prev); n.delete(abs); return n; });
      })
      .catch(err => {
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
    setShowTafseer(prev => !prev);
    setTafseerOnCards(new Set());
    setTafseerOffCards(new Set());
  }

  function saveTafseerEdition(ed) {
    setTafseerEdition(ed);
    localStorage.setItem('mos_tafseer_edition', ed);
    setTafseerCache({});
    setTafseerErrors({});
    setTafseerExpanded(new Set());
  }

  function openSurah(num) {
    if (!SURAH_TEXT[num]) return;
    setActiveSurah(num);
    setView('read');
    window.scrollTo({ top: 0 });
  }

  function closeReading() {
    if (audioRef.current) audioRef.current.pause();
    setPlayingAyah(null);
    setIsSequential(false);
    setAutoScrollOn(false);
    setView('list');
    setActiveSurah(null);
    window.scrollTo({ top: 0 });
  }

  function playAtIndex(idx) {
    const v = verses[idx];
    if (!v || !audioRef.current) return;
    errorHandled.current = false;
    const url = ayahAudioUrl(reciter, v.abs);
    console.log('[QuranReader] Playing ayah:', url);
    audioRef.current.src = url;
    audioRef.current.playbackRate = playbackSpeed;
    audioRef.current.play().catch(() => {});
    setPlayingAyah(v.abs);
    setSeqIndex(idx);
    if (idx >= visibleCount) setVisibleCount(idx + 5);
  }

  function playSingleAyah(verse, idx) {
    setIsSequential(false);
    if (!audioRef.current) return;
    if (playingAyah === verse.abs) {
      audioRef.current.pause();
      setPlayingAyah(null);
      return;
    }
    errorHandled.current = false;
    const url = ayahAudioUrl(reciter, verse.abs);
    console.log('[QuranReader] Playing ayah:', url);
    audioRef.current.src = url;
    audioRef.current.playbackRate = playbackSpeed;
    audioRef.current.play().catch(() => {});
    setPlayingAyah(verse.abs);
    setSeqIndex(idx);
  }

  function toggleSequentialPlay() {
    if (playingAyah && isSequential) {
      audioRef.current?.pause();
      setPlayingAyah(null);
      setIsSequential(false);
    } else {
      setIsSequential(true);
      playAtIndex(seqIndex >= 0 && seqIndex < verses.length ? seqIndex : 0);
    }
  }

  function stopAudio() {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; }
    setPlayingAyah(null);
    setIsSequential(false);
    setSeqIndex(-1);
  }

  function cycleSpeed() {
    const speeds = [0.75, 1, 1.25];
    const i = speeds.indexOf(playbackSpeed);
    const next = speeds[(i + 1) % speeds.length];
    setPlaybackSpeed(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  }

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
    return (
      <div className="animate-fade-up">
        <div className="page-title">
          <IconQuran size={22} style={{ color: 'var(--emerald-500)' }} />
          Al-Quran
        </div>
        <div className="page-subtitle">
          {availableCount > 0 ? `${availableCount} surahs · Arabic + English + Urdu` : 'Loading...'}
        </div>

        {/* Continue Reading */}
        {lastRead && SURAH_TEXT[lastRead.surah] && (
          <div
            onClick={() => { setTargetAyah(lastRead.ayah); openSurah(lastRead.surah); }}
            className="glass-dark pressable"
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

        <input
          className="search-box"
          placeholder="Search surah name or number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {filteredSurahs.map(s => {
          const hasText = !!SURAH_TEXT[s.n];
          return (
            <div key={s.n} className="glass-card pressable" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: 'var(--sp-3) var(--sp-4)', marginBottom: 'var(--sp-2)',
              opacity: hasText ? 1 : 0.45, cursor: hasText ? 'pointer' : 'default',
            }}>
              <div onClick={() => hasText && openSurah(s.n)} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', flex: 1, minWidth: 0 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 'var(--r-sm)', background: 'var(--emerald-50)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Amiri', serif", fontSize: 'var(--text-base)', fontWeight: 700,
                  color: 'var(--emerald-700)', flexShrink: 0,
                }}>
                  {s.n}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-base)' }}>{s.nm}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 1 }}>
                    {s.mn} · {s.v} verses · {s.type}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                {hasText && onPlaySurah && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onPlaySurah(s.n); }}
                    className="pressable"
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
                <div className="font-amiri" style={{ fontSize: 'var(--arabic-sm)', color: 'var(--gold-400)', flexShrink: 0 }}>
                  {s.ar}
                </div>
              </div>
            </div>
          );
        })}

        <HadithFooter />
      </div>
    );
  }

  // ══════════════ READING VIEW ══════════════
  return (
    <div>
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
        </div>
      </div>

      {/* Bismillah divider */}
      {activeSurah !== 1 && activeSurah !== 9 && (
        <div style={{ padding: 'var(--sp-5) 0 var(--sp-4)' }}>
          <div className="glass-surface" style={{
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
          <button className={`trans-pill${showTrans ? ' active' : ''}`} onClick={() => setShowTrans(!showTrans)}>
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
                    <button onClick={() => shareAyah(v)}><IconShare size={14} /> Share</button>
                    <button onClick={() => toggleBookmark(bmId)}>
                      {isBookmarked ? <IconBookmarkFilled size={14} /> : <IconBookmark size={14} />}
                      {isBookmarked ? ' Remove Bookmark' : ' Bookmark'}
                    </button>
                    <button onClick={() => { setIsSequential(true); playAtIndex(i); setOpenMenu(null); }}>
                      <IconPlay size={14} /> Play from here
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 'var(--sp-1)' }}>
                <button className={`trans-pill${showTrans ? ' active' : ''}`}
                  style={{ padding: '2px 8px', fontSize: '0.62rem' }}
                  onClick={() => setShowTrans(!showTrans)}>
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
              {v.ar} {'\uFD3F'}{toArabicNum(v.vn)}{'\uFD3E'}
            </div>

            {/* Translation */}
            {showTrans && (
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
              tafseerLoading.has(v.abs) ? (
                <div className="tafseer-skeleton">
                  <div className="skeleton-line" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line" />
                </div>
              ) : tafseerErrors[v.abs] ? (
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
                <div className="tafseer-hint" onClick={() => doFetchTafseer(v)}>
                  Tap to load tafseer for this ayah
                </div>
              )
            )}

            {/* Bottom: audio + bookmark */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
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
  );
}
