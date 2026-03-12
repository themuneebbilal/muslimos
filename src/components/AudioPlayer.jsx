import React, { useEffect, useRef, useState, useCallback } from 'react';
import SURAHS_META from '../data/surahMeta';
import { IconPlay, IconPause, IconClose } from './Icons';

const FALLBACK_RECITER = 'ar.alafasy';

export default function AudioPlayer({ currentSurah, isPlaying, onPlayPause, onClose, onNext, onPrev, reciter, reciters }) {
  const audioRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const progressBarRef = useRef(null);
  const errorHandled = useRef(false);

  const meta = SURAHS_META.find(s => s.n === currentSurah);
  const reciterInfo = reciters?.find(r => r.id === reciter);
  const reciterName = reciterInfo?.name || 'Reciter';

  const showToast = useCallback((msg) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  function getSurahUrl(recId, rec) {
    const info = rec || reciters?.find(r => r.id === recId);
    if (!info?.surahBitrate) {
      // No surah audio for this reciter — fall back to Alafasy
      return `https://cdn.islamic.network/quran/audio-surah/128/${FALLBACK_RECITER}/${currentSurah}.mp3`;
    }
    return `https://cdn.islamic.network/quran/audio-surah/${info.surahBitrate}/${recId}/${currentSurah}.mp3`;
  }

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener('timeupdate', () => {
        setProgress(audioRef.current.currentTime);
      });
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current.duration);
      });
      audioRef.current.addEventListener('ended', () => {
        if (currentSurah < 114) {
          onNext();
        } else {
          onClose();
        }
      });
      audioRef.current.addEventListener('error', () => {
        if (errorHandled.current) return;
        errorHandled.current = true;
        const failedUrl = audioRef.current.src;
        console.warn('[AudioPlayer] Audio failed:', failedUrl);

        // Fall back to Alafasy if not already
        if (!failedUrl.includes(FALLBACK_RECITER)) {
          showToast('Audio unavailable for this reciter — playing Alafasy');
          const fallbackUrl = `https://cdn.islamic.network/quran/audio-surah/128/${FALLBACK_RECITER}/${currentSurah}.mp3`;
          console.log('[AudioPlayer] Falling back to:', fallbackUrl);
          audioRef.current.src = fallbackUrl;
          audioRef.current.play().catch(() => {});
        } else {
          showToast('Audio unavailable');
        }
      });
    }
    return () => {};
  }, []);

  useEffect(() => {
    if (!audioRef.current || !currentSurah) return;
    errorHandled.current = false;
    const newUrl = getSurahUrl(reciter, reciterInfo);
    if (audioRef.current.src !== newUrl) {
      console.log('[AudioPlayer] Loading:', newUrl);
      audioRef.current.src = newUrl;
      setProgress(0);
      setDuration(0);

      // Notify if falling back
      if (!reciterInfo?.surahBitrate && reciter !== FALLBACK_RECITER) {
        showToast(`Surah audio not available for ${reciterName} — playing Alafasy`);
      }
    }
  }, [currentSurah, reciter]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentSurah, reciter]);

  // Media Session API
  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentSurah || !meta) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: `${meta.nm} (${meta.ar})`,
      artist: reciterName,
      album: 'Al-Quran',
      artwork: [
        { src: '/icons/icon-96.png', sizes: '96x96', type: 'image/png' },
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
    });

    navigator.mediaSession.setActionHandler('play', () => onPlayPause());
    navigator.mediaSession.setActionHandler('pause', () => onPlayPause());
    navigator.mediaSession.setActionHandler('previoustrack', currentSurah > 1 ? () => onPrev() : null);
    navigator.mediaSession.setActionHandler('nexttrack', currentSurah < 114 ? () => onNext() : null);
  }, [currentSurah, reciter, meta, reciterName]);

  function handleSeek(e) {
    if (!audioRef.current || !duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioRef.current.currentTime = pct * duration;
  }

  function formatDur(s) {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  }

  if (!currentSurah) return null;

  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 130, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(6,74,55,0.92)', color: 'white', padding: '8px 16px',
          borderRadius: 'var(--r-md)', fontSize: 'var(--text-xs)', zIndex: 100,
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          maxWidth: 'calc(100% - 32px)', textAlign: 'center',
          animation: 'fadeUp 0.25s ease',
        }}>
          {toast}
        </div>
      )}

      <div className="audio-bar">
        <button className="ab-btn pressable" onClick={onPlayPause} aria-label={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying ? <IconPause size={14} /> : <IconPlay size={14} />}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="ab-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {meta?.nm} — {meta?.ar}
          </div>
          <div
            ref={progressBarRef}
            onClick={handleSeek}
            style={{ height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 'var(--r-full)', cursor: 'pointer', marginTop: 4 }}
          >
            <div style={{ height: '100%', background: 'var(--gold-400)', borderRadius: 'var(--r-full)', width: `${pct}%`, transition: 'width 0.2s' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', opacity: .6, marginTop: 2 }}>
            <span>{formatDur(progress)}</span>
            <span>{formatDur(duration)}</span>
          </div>
        </div>
        <button className="ab-btn pressable" onClick={onClose} aria-label="Close">
          <IconClose size={14} />
        </button>
      </div>
    </>
  );
}
