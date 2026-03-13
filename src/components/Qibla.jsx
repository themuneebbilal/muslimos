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
    <div className="animate-fade-up qibla-page">
      <div className="page-title">Qibla Direction</div>
      <div className="qibla-shell glass-elevated">
        <div className="qibla-shell-watermark">قِبْلَة</div>
        <div className="qibla-orbit">
          <div className="qibla-orbit-ring qibla-orbit-ring-a" />
          <div className="qibla-orbit-ring qibla-orbit-ring-b" />
          <div
            className="qibla-compass glass-card"
            style={{ transform: `rotate(${-heading}deg)` }}
          >
            <div className="qibla-north">N</div>
            <div
              className="qibla-arrow"
              style={{ transform: `translate(-50%, -86%) rotate(${qiblaAngle}deg)` }}
            />
            <div className="qibla-core" />
            <div
              className="qibla-kaaba"
              style={{ transform: `translateX(-50%) rotate(${qiblaAngle}deg)` }}
            >
              🕋
            </div>
          </div>
        </div>

        <div className="qibla-degree">{Math.round(qiblaAngle)}°</div>
        <div className="qibla-sub">from North</div>
        <div className="qibla-location">{location.label}</div>

        {!compassActive ? (
          <button onClick={requestPermission} className="qibla-cta">
            Enable Compass
          </button>
        ) : (
          <div className="qibla-status">Compass active — point phone North</div>
        )}

        <div className="qibla-copy">
          Point the top of your phone toward North. The arrow and Ka'bah marker show the direction to the Ka'bah.
        </div>
      </div>
    </div>
  );
}
