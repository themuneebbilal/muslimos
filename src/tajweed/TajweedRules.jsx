import React, { useEffect, useState } from 'react';
import { TAJWEED_RULES } from './tajweedRulesData';
import { TAJWEED_COLORS } from './tajweedColors';
import { fetchVerseRecitation, fetchVerseWords, getSegmentForWord, mapApiWordsToTajweedWords } from './tajweedApi';
import { IconPlay } from '../components/Icons';

export default function TajweedRules() {
  const [activeAudio, setActiveAudio] = useState(null);
  const [exampleWords, setExampleWords] = useState({});

  useEffect(() => {
    let cancelled = false;

    async function loadExamples() {
      const entries = await Promise.all(TAJWEED_RULES.map(async (rule) => {
        try {
          const words = await fetchVerseWords(rule.verseKey);
          const mapped = mapApiWordsToTajweedWords(words);
          return [rule.id, mapped.find((word) => word.position === rule.wordPosition) || null];
        } catch {
          return [rule.id, null];
        }
      }));

      if (!cancelled) {
        setExampleWords(Object.fromEntries(entries));
      }
    }

    loadExamples();
    return () => { cancelled = true; };
  }, []);

  async function playRuleAudio(rule) {
    try {
      if (activeAudio) activeAudio.pause();
      const { audioUrl, timings } = await fetchVerseRecitation(rule.verseKey);
      const verseTiming = timings.find((item) => item.verseKey === rule.verseKey);
      const segment = getSegmentForWord(verseTiming, rule.wordPosition);
      const audio = new Audio(audioUrl);
      setActiveAudio(audio);
      if (segment) {
        audio.currentTime = Math.max(0, segment.timestampFrom / 1000);
        audio.ontimeupdate = () => {
          if (audio.currentTime >= segment.timestampTo / 1000) {
            audio.pause();
            audio.ontimeupdate = null;
          }
        };
      }
      await audio.play();
    } catch {}
  }

  return (
    <section className="tajweed-rules">
      {TAJWEED_RULES.map((rule) => {
        const tone = TAJWEED_COLORS[rule.colorKey];
        const exampleWord = exampleWords[rule.id];
        return (
          <article key={rule.id} id={`tajweed-rule-${rule.id}`} className="glass-card tajweed-rule-card">
            <div className="tajweed-rule-head">
              <div className="tajweed-rule-title">
                <span className="tajweed-dot" style={{ background: tone.color }} />
                <div>
                  <strong>{rule.name}</strong>
                  <div className="font-amiri">{rule.arabic}</div>
                </div>
              </div>
              <button type="button" className="tajweed-audio-btn" onClick={() => playRuleAudio(rule)}>
                <IconPlay size={14} />
                Tap to hear
              </button>
            </div>
            <p>{rule.explanation}</p>
            <div className="tajweed-rule-example">
              {exampleWord ? (
                <span className="font-amiri" dangerouslySetInnerHTML={{ __html: exampleWord.html }} />
              ) : (
                <span className="font-amiri" style={{ color: tone.color }}>{rule.example}</span>
              )}
              <small>{rule.note}</small>
            </div>
          </article>
        );
      })}
    </section>
  );
}
