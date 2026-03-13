import React from 'react';
import SURAHS_META from '../data/surahMeta';
import { IconPlay, IconPause, IconClose } from './Icons';
export default function AudioPlayer({
  currentSurah,
  isPlaying,
  progress,
  duration,
  onPlayPause,
  onClose,
  onNext,
  onPrev,
  onSeek,
  reciter,
  reciters,
}) {
  const progressBarRef = React.useRef(null);

  const meta = SURAHS_META.find(s => s.n === currentSurah);
  const reciterInfo = reciters?.find(r => r.id === reciter);

  function handleSeek(e) {
    if (!duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek?.(pct * duration);
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
      <div className="audio-bar">
        <button className="ab-btn pressable" onClick={onPrev} aria-label="Previous Surah">
          ‹
        </button>
        <button className="ab-btn pressable" onClick={onPlayPause} aria-label={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying ? <IconPause size={14} /> : <IconPlay size={14} />}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="ab-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {meta?.nm} — {meta?.ar}
          </div>
          <div style={{ fontSize: '0.65rem', opacity: 0.72, marginTop: 1 }}>
            {reciterInfo?.name || 'Reciter'}
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
        <button className="ab-btn pressable" onClick={onNext} aria-label="Next Surah">
          ›
        </button>
        <button className="ab-btn pressable" onClick={onClose} aria-label="Close">
          <IconClose size={14} />
        </button>
      </div>
    </>
  );
}
