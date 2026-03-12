import React, { useState, useEffect } from 'react';
import { calculateQibla } from '../utils/qiblaCalc';

export default function Qibla({ location }) {
  const [heading, setHeading] = useState(0);
  const [compassActive, setCompassActive] = useState(false);
  const qiblaAngle = calculateQibla(location.lat, location.lng);

  useEffect(() => {
    function handleOrientation(e) {
      let h = e.alpha;
      if (e.webkitCompassHeading) h = e.webkitCompassHeading;
      if (h !== null) {
        setHeading(h);
        setCompassActive(true);
      }
    }

    if (window.DeviceOrientationEvent) {
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        // iOS 13+ requires permission
      } else {
        window.addEventListener('deviceorientation', handleOrientation);
      }
    }

    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  function requestPermission() {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission().then(r => {
        if (r === 'granted') {
          window.addEventListener('deviceorientation', (e) => {
            let h = e.webkitCompassHeading || e.alpha;
            if (h !== null) { setHeading(h); setCompassActive(true); }
          });
        }
      });
    }
  }

  return (
    <div className="animate-fade-up">
      <div className="page-title">🕋 Qibla Direction</div>
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <div style={{ position: 'relative', width: 260, height: 260, margin: '0 auto 24px' }}>
          <div style={{
            width: 260, height: 260, borderRadius: '50%', border: '3px solid var(--border)',
            background: 'var(--white)', position: 'relative',
            transform: `rotate(${-heading}deg)`, transition: 'transform 0.3s ease',
          }}>
            <div className="font-amiri" style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', fontSize: '1rem', fontWeight: 700, color: 'var(--emerald)' }}>N</div>
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              width: 4, height: 100,
              background: 'linear-gradient(to top, transparent 0%, var(--emerald) 50%, var(--gold) 100%)',
              transform: `translate(-50%, -85%) rotate(${qiblaAngle}deg)`,
              transformOrigin: 'bottom center', borderRadius: 2,
            }} />
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              width: 16, height: 16, borderRadius: '50%', background: 'var(--emerald-deep)',
              transform: 'translate(-50%, -50%)', border: '3px solid var(--white)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)', zIndex: 2,
            }} />
            <div style={{
              position: 'absolute', top: 8, left: '50%',
              transform: `translateX(-50%) rotate(${qiblaAngle}deg)`,
              fontSize: '1.5rem', zIndex: 3,
              transformOrigin: `50% ${260/2 - 8}px`,
            }}>🕋</div>
          </div>
        </div>

        <div className="font-amiri" style={{ fontSize: '1.8rem', color: 'var(--emerald-deep)', fontWeight: 700 }}>
          {Math.round(qiblaAngle)}°
        </div>
        <div style={{ fontSize: '.82rem', color: 'var(--ink-muted)', marginTop: 2 }}>from North</div>

        {!compassActive && (
          <button
            onClick={requestPermission}
            style={{
              padding: '12px 20px', borderRadius: 12, background: 'var(--emerald-light)',
              color: 'var(--emerald)', fontSize: '.82rem', fontWeight: 500,
              marginTop: 16, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif"
            }}
          >
            Enable Compass
          </button>
        )}
        {compassActive && (
          <div style={{ padding: '12px 20px', borderRadius: 12, background: 'var(--emerald-light)', color: 'var(--emerald)', fontSize: '.82rem', fontWeight: 500, marginTop: 16, display: 'inline-block' }}>
            Compass active — point phone North
          </div>
        )}

        <div style={{ fontSize: '.75rem', color: 'var(--ink-muted)', marginTop: 20, lineHeight: 1.5, maxWidth: 300, margin: '20px auto 0' }}>
          Point the top of your phone toward North. The arrow and 🕋 show the direction to the Ka'bah.
        </div>
      </div>
    </div>
  );
}
