import React, { useEffect, useMemo, useState } from 'react';
import { PRACTICE_SURAHS } from './tajweedRulesData';
import { TAJWEED_COLORS } from './tajweedColors';
import { fetchTajweedVerse, fetchVerseWords, fetchVerseRecitation, getSegmentForWord, mapApiWordsToTajweedWords } from './tajweedApi';
import TajweedLegend from './TajweedLegend';
import TajweedWordPopup from './TajweedWordPopup';
import { IconBack, IconForward } from '../components/Icons';

const PROGRESS_KEY = 'mos_tajweed_progress';

function readProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveProgress(progress) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function getPracticedCount() {
  return readProgress().length;
}

export default function TajweedPractice() {
  const [surahId, setSurahId] = useState(1);
  const [ayah, setAyah] = useState(1);
  const [loading, setLoading] = useState(false);
  const [verseWords, setVerseWords] = useState([]);
  const [selectedWord, setSelectedWord] = useState(null);
  const [error, setError] = useState('');

  const surah = PRACTICE_SURAHS.find((item) => item.id === surahId) || PRACTICE_SURAHS[0];
  const verseKey = `${surahId}:${ayah}`;

  useEffect(() => {
    let cancelled = false;

    async function loadVerse() {
      setLoading(true);
      setError('');
      try {
        const [, words] = await Promise.all([
          fetchTajweedVerse(verseKey),
          fetchVerseWords(verseKey),
        ]);
        if (cancelled) return;
        const merged = mapApiWordsToTajweedWords(words).map((item) => ({
          ...item,
          ruleText: TAJWEED_COLORS[item.ruleKey]?.arabic || '',
        }));
        setVerseWords(merged);

        const progress = readProgress();
        if (!progress.includes(surahId)) {
          saveProgress([...progress, surahId].sort((a, b) => a - b));
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError.message || 'Unable to load tajweed verse');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadVerse();
    return () => { cancelled = true; };
  }, [verseKey, surahId]);

  const legendItems = useMemo(() => Array.from(new Set(verseWords.map((word) => word.ruleKey))).filter((key) => key !== 'default'), [verseWords]);

  function playWord(word) {
    fetchVerseRecitation(verseKey).then(({ audioUrl, timings }) => {
      const verseTiming = timings.find((item) => item.verseKey === verseKey);
      const segment = getSegmentForWord(verseTiming, word.position);
      const audio = new Audio(audioUrl);
      if (segment) {
        audio.currentTime = Math.max(0, segment.timestampFrom / 1000);
        audio.ontimeupdate = () => {
          if (audio.currentTime >= segment.timestampTo / 1000) {
            audio.pause();
            audio.ontimeupdate = null;
          }
        };
      }
      audio.play().catch(() => {});
    }).catch(() => {});
  }

  function jumpToRule(ruleKey) {
    const section = document.getElementById(`tajweed-rule-${ruleKey}`);
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <section className="tajweed-practice glass-card">
      <div className="tajweed-practice-head">
        <div>
          <div className="tajweed-section-label">Practice</div>
          <h3>{surah.name} · Ayah {ayah}</h3>
        </div>
        <select className="search-box tajweed-select" value={surahId} onChange={(event) => { setSurahId(Number(event.target.value)); setAyah(1); }}>
          {PRACTICE_SURAHS.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
      </div>

      <TajweedLegend items={legendItems} onJumpToRule={jumpToRule} />

      {loading && <div className="tajweed-empty">Loading verse...</div>}
      {error && <div className="tajweed-empty">{error}</div>}
      {!loading && !error && (
        <div className="tajweed-verse font-amiri">
          {verseWords.map((word) => (
            <button key={word.id} type="button" className="tajweed-word-btn" onClick={() => setSelectedWord(word)} dangerouslySetInnerHTML={{ __html: word.html }} />
          ))}
        </div>
      )}

      <div className="tajweed-nav">
        <button type="button" className="pressable tajweed-nav-btn" onClick={() => setAyah((current) => Math.max(1, current - 1))} disabled={ayah === 1}>
          <IconBack size={14} />
          Previous
        </button>
        <button type="button" className="pressable tajweed-nav-btn" onClick={() => setAyah((current) => Math.min(surah.ayahs, current + 1))} disabled={ayah === surah.ayahs}>
          Next
          <IconForward size={14} />
        </button>
      </div>

      <TajweedWordPopup word={selectedWord} onClose={() => setSelectedWord(null)} onPlay={() => selectedWord && playWord(selectedWord)} />
    </section>
  );
}
