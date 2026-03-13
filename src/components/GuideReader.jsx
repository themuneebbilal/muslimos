import React, { useState, useEffect, useRef, useCallback } from 'react';
import { loadGuide } from '../data/guides/index.js';
import GuideIllustration from './GuideIllustrations';
import { IconBack, IconForward } from './Icons';

export default function GuideReader({ guideId, onBack }) {
  const [guide, setGuide] = useState(null);
  const [step, setStep] = useState(() => {
    const saved = localStorage.getItem(`mos_guide_${guideId}_step`);
    return saved ? Math.max(0, parseInt(saved) - 1) : 0;
  });
  const touchRef = useRef({ startX: 0, startY: 0 });
  const contentRef = useRef(null);

  useEffect(() => {
    loadGuide(guideId).then(setGuide);
  }, [guideId]);

  useEffect(() => {
    if (guide) {
      localStorage.setItem(`mos_guide_${guideId}_step`, step + 1);
    }
  }, [step, guide, guideId]);

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
      <div className="animate-fade-up" style={{ padding: 'var(--sp-10) 0', textAlign: 'center' }}>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>Loading guide...</div>
      </div>
    );
  }

  const current = guide.steps[step];
  const total = guide.steps.length;
  const pct = ((step + 1) / total) * 100;

  return (
    <div className="animate-fade-up guide-reader-page" ref={contentRef}>
      {/* Header */}
      <div className="page-title f1" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
        <button className="back-btn" onClick={onBack}>
          <IconBack size={16} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="font-amiri" style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--emerald-700)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {guide.title}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}>
            Step {step + 1} of {total}
          </div>
        </div>
        <div className="font-amiri" style={{ fontSize: 'var(--text-sm)', color: 'var(--gold-400)', flexShrink: 0 }}>
          {guide.titleAr}
        </div>
      </div>

      {/* Progress bar */}
      <div className="guide-progress-bar" style={{ marginBottom: 'var(--sp-4)' }}>
        <div className="guide-progress-fill" style={{ width: `${pct}%` }} />
      </div>

      {/* Step card */}
      <div className="glass-card f1" style={{ padding: 'var(--sp-5)', marginBottom: 'var(--sp-3)' }}>
        {/* Illustration */}
        {current.illustration && (
          <div style={{ marginBottom: 'var(--sp-4)' }}>
            <GuideIllustration type={current.illustration} size={100} />
          </div>
        )}

        {/* Step badge + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-3)' }}>
          <div className="guide-step-badge">{current.id}</div>
          <div>
            <div className="font-amiri" style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--emerald-700)' }}>
              {current.title}
            </div>
            <div className="font-amiri" style={{ fontSize: 'var(--text-sm)', color: 'var(--gold-400)' }}>
              {current.titleAr}
            </div>
          </div>
        </div>

        {/* Body text */}
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: current.arabic ? 'var(--sp-3)' : 0 }}>
          {current.body}
        </div>

        {/* Arabic dua block */}
        {current.arabic && (
          <div className="guide-dua-block">
            <div className="arabic-text" style={{ fontSize: 'var(--arabic-sm)', color: 'var(--emerald-700)', lineHeight: 2.2, marginBottom: 'var(--sp-2)' }}>
              {current.arabic.split('\n').map((line, i) => (
                <span key={i}>{line}{i < current.arabic.split('\n').length - 1 && <br />}</span>
              ))}
            </div>
            {current.transliteration && (
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontStyle: 'italic', lineHeight: 1.6, marginBottom: 'var(--sp-1)' }}>
                {current.transliteration.split('\n').map((line, i) => (
                  <span key={i}>{line}{i < current.transliteration.split('\n').length - 1 && <br />}</span>
                ))}
              </div>
            )}
            {current.translation && (
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {current.translation.split('\n').map((line, i) => (
                  <span key={i}>{line}{i < current.translation.split('\n').length - 1 && <br />}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tip box */}
        {current.tip && (
          <div className="guide-tip-box">
            <strong style={{ fontSize: 'var(--text-xs)', color: 'var(--gold-500)', display: 'block', marginBottom: 2 }}>Tip</strong>
            <div>{current.tip}</div>
          </div>
        )}

        {/* Note */}
        {current.note && (
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--sp-3)', lineHeight: 1.6, fontStyle: 'italic', padding: '0 var(--sp-1)' }}>
            {current.note}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 'var(--sp-3)', marginBottom: 'var(--sp-6)' }}>
        <button
          className="guide-nav-btn"
          onClick={goPrev}
          disabled={step === 0}
          style={{
            flex: 1,
            background: step === 0 ? 'var(--bg-secondary)' : 'var(--emerald-50)',
            color: step === 0 ? 'var(--text-tertiary)' : 'var(--emerald-700)',
            opacity: step === 0 ? 0.5 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--sp-2)',
          }}
        >
          <IconBack size={14} /> Previous
        </button>
        <button
          className="guide-nav-btn"
          onClick={step === total - 1 ? onBack : goNext}
          style={{
            flex: 1,
            background: step === total - 1 ? 'var(--emerald-500)' : 'var(--emerald-50)',
            color: step === total - 1 ? 'white' : 'var(--emerald-700)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--sp-2)',
          }}
        >
          {step === total - 1 ? 'Finish' : 'Next'} {step < total - 1 && <IconForward size={14} />}
        </button>
      </div>
    </div>
  );
}
