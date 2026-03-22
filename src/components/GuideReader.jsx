import React, { useState, useEffect, useRef, useCallback } from 'react';
import { loadGuide } from '../data/guides/index.js';
import GuideIllustration from './GuideIllustrations';
import { IconBack, IconForward } from './Icons';
import { safeGetItem, safeSetItem } from '../utils/safeStorage';

export default function GuideReader({ guideId, onBack }) {
  const [guide, setGuide] = useState(null);
  const [guidedMode, setGuidedMode] = useState(() => safeGetItem(`mos_guide_${guideId}_mode`, 'reference') === 'guided');
  const [step, setStep] = useState(() => {
    const saved = safeGetItem(`mos_guide_${guideId}_last_step`, null);
    return saved ? Math.max(0, parseInt(saved, 10) - 1) : 0;
  });
  const touchRef = useRef({ startX: 0, startY: 0 });
  const contentRef = useRef(null);

  useEffect(() => {
    loadGuide(guideId).then(setGuide);
  }, [guideId]);

  useEffect(() => {
    if (guide) {
      safeSetItem(`mos_guide_${guideId}_last_step`, step + 1);
      if (guidedMode) {
        safeSetItem(`mos_guide_${guideId}_guided_step`, step + 1);
      }
    }
  }, [step, guide, guideId, guidedMode]);

  useEffect(() => {
    safeSetItem(`mos_guide_${guideId}_mode`, guidedMode ? 'guided' : 'reference');
  }, [guideId, guidedMode]);

  useEffect(() => {
    if (!guide || !guidedMode) return;
    const saved = safeGetItem(`mos_guide_${guideId}_guided_step`, null);
    if (saved) {
      setStep(Math.max(0, parseInt(saved, 10) - 1));
    }
  }, [guideId, guide, guidedMode]);

  const goNext = useCallback(() => {
    if (guide && step < guide.steps.length - 1) {
      setStep(s => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [guide, step]);

  const goPrev = useCallback(() => {
    if (step > 0) {
      setStep(s => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [step]);

  // Swipe support
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    function onTouchStart(e) {
      touchRef.current.startX = e.touches[0].clientX;
      touchRef.current.startY = e.touches[0].clientY;
    }
    function onTouchEnd(e) {
      const dx = e.changedTouches[0].clientX - touchRef.current.startX;
      const dy = e.changedTouches[0].clientY - touchRef.current.startY;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx < 0) goNext();
        else goPrev();
      }
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [goNext, goPrev]);

  if (!guide) {
    return (
      <div className="animate-fade-up guide-reader-loading">
        <div className="guide-reader-loading-copy">Loading guide...</div>
      </div>
    );
  }

  const current = guide.steps[step];
  const total = guide.steps.length;
  const pct = ((step + 1) / total) * 100;

  return (
    <div className="animate-fade-up guide-reader-page" ref={contentRef}>
      <div className="guide-reader-header f1">
        <button className="back-btn" onClick={onBack}>
          <IconBack size={16} />
        </button>
        <div className="guide-reader-header-copy">
          <div className="guide-reader-title">{guide.title}</div>
          <div className="guide-reader-meta">
            {guidedMode ? `Guided mode · step ${step + 1} of ${total}` : `Reference mode · section ${step + 1} of ${total}`}
          </div>
        </div>
        <div className="guide-reader-title-ar">{guide.titleAr}</div>
      </div>

      <div className="glass-card guide-reader-mode-card">
        <div className="guide-reader-mode-tabs">
          <button
            type="button"
            className={`sub-tab${!guidedMode ? ' active' : ''}`}
            onClick={() => setGuidedMode(false)}
          >
            Reference Mode
          </button>
          <button
            type="button"
            className={`sub-tab${guidedMode ? ' active' : ''}`}
            onClick={() => setGuidedMode(true)}
          >
            Guided Mode
          </button>
        </div>
        <div className="guide-reader-mode-copy">
          {guidedMode
            ? 'Sequential walkthrough with remembered progress.'
            : 'Open-ended reading. Jump anywhere without the guide feeling like a daily task.'}
        </div>
        {guidedMode && (
          <div className="guide-progress-bar" style={{ marginTop: 'var(--sp-3)' }}>
            <div className="guide-progress-fill" style={{ width: `${pct}%` }} />
          </div>
        )}
      </div>

      <div className="glass-card guide-reader-sections-card">
        <div className="section-label">Sections</div>
        <div className="guide-reader-sections-row">
          {guide.steps.map((guideStep, index) => (
            <button
              key={guideStep.id}
              type="button"
              className={`sub-tab${index === step ? ' active' : ''}`}
              onClick={() => {
                setStep(index);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{ whiteSpace: 'nowrap' }}
            >
              {guideStep.id}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card guide-reader-step-card f1">
        {current.illustration && (
          <div className="guide-reader-illustration">
            <GuideIllustration type={current.illustration} size={100} />
          </div>
        )}

        <div className="guide-reader-step-head">
          <div className="guide-step-badge">{current.id}</div>
          <div>
            <div className="guide-reader-step-title">{current.title}</div>
            <div className="guide-reader-step-title-ar">{current.titleAr}</div>
          </div>
        </div>

        <div className={`guide-reader-body${current.arabic ? ' guide-reader-body-with-arabic' : ''}`}>
          {current.body}
        </div>

        {current.arabic && (
          <div className="guide-dua-block">
            <div className="arabic-text guide-reader-dua-ar">
              {current.arabic.split('\n').map((line, i) => (
                <span key={i}>{line}{i < current.arabic.split('\n').length - 1 && <br />}</span>
              ))}
            </div>
            {current.transliteration && (
              <div className="guide-reader-transliteration">
                {current.transliteration.split('\n').map((line, i) => (
                  <span key={i}>{line}{i < current.transliteration.split('\n').length - 1 && <br />}</span>
                ))}
              </div>
            )}
            {current.translation && (
              <div className="guide-reader-translation">
                {current.translation.split('\n').map((line, i) => (
                  <span key={i}>{line}{i < current.translation.split('\n').length - 1 && <br />}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {current.tip && (
          <div className="guide-tip-box">
            <strong className="guide-reader-tip-label">Tip</strong>
            <div>{current.tip}</div>
          </div>
        )}

        {current.note && (
          <div className="guide-reader-note">
            {current.note}
          </div>
        )}
      </div>

      <div className="guide-reader-nav">
        <button
          className="guide-nav-btn"
          onClick={goPrev}
          disabled={step === 0}
          style={{ opacity: step === 0 ? 0.5 : 1 }}
        >
          <IconBack size={14} /> Previous
        </button>
        <button
          className={`guide-nav-btn${step === total - 1 ? ' guide-nav-btn-primary' : ''}`}
          onClick={step === total - 1 ? onBack : goNext}
        >
          {step === total - 1 ? (guidedMode ? 'Finish Guided Path' : 'Back to Guide') : 'Next'} {step < total - 1 && <IconForward size={14} />}
        </button>
      </div>
    </div>
  );
}
