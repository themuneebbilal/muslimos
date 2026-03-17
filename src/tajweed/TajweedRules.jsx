import React, { useState } from 'react';
import { TAJWEED_RULES } from './tajweedRulesData';
import { TAJWEED_COLORS } from './tajweedColors';
import { getWordAudioUrl } from './tajweedApi';
import { IconPlay } from '../components/Icons';

export default function TajweedRules() {
  const [activeAudio, setActiveAudio] = useState(null);

  async function playRuleAudio(rule) {
    try {
      if (activeAudio) activeAudio.pause();
      const [surah, ayah] = rule.verseKey.split(':').map(Number);
      const audio = new Audio(getWordAudioUrl(surah, ayah, rule.wordPosition));
      setActiveAudio(audio);
      await audio.play();
    } catch {}
  }

  return (
    <section className="tajweed-rules">
      {TAJWEED_RULES.map((rule) => {
        const tone = TAJWEED_COLORS[rule.colorKey];
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
              <span className="font-amiri" style={{ color: tone.color }}>{rule.example}</span>
              <small>{rule.note}</small>
            </div>
          </article>
        );
      })}
    </section>
  );
}
