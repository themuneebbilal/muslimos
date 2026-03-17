import React, { useMemo } from 'react';
import TajweedRules from './TajweedRules';
import TajweedPractice, { getPracticedCount } from './TajweedPractice';
import { TAJWEED_RULES } from './tajweedRulesData';

export default function TajweedPage() {
  const practiced = useMemo(() => getPracticedCount(), []);

  return (
    <div className="tajweed-page animate-fade-up">
      <section className="settingsv2-panel settingsv2-panel-hero tajweed-hero">
        <div className="settingsv2-watermark">تجويد</div>
        <div className="settingsv2-label">Tajweed</div>
        <h2>Tajweed</h2>
        <p>تجويد القرآن · Master Quran pronunciation</p>
        <div className="learnv3-hero-meta">
          <div className="learnv3-hero-metric">
            <strong>{TAJWEED_RULES.length}</strong>
            <span>Rule sets</span>
          </div>
          <div className="learnv3-hero-metric">
            <strong>{practiced}</strong>
            <span>Practiced</span>
          </div>
          <div className="learnv3-hero-metric">
            <strong>114</strong>
            <span>Total surahs</span>
          </div>
        </div>
      </section>

      <section className="tajweed-section">
        <div className="tajweed-section-label">Tajweed Rules</div>
        <h3>Learn the rules</h3>
        <TajweedRules />
      </section>

      <section className="tajweed-section">
        <div className="tajweed-section-label">Practice</div>
        <h3>Apply rules to real verses</h3>
        <TajweedPractice />
      </section>
    </div>
  );
}
