import React, { useEffect, useMemo, useRef, useState } from 'react';
import { calculateQibla } from '../utils/qiblaCalc';
import { logError } from '../utils/logger';

function normalizeDegrees(value) {
  return ((value % 360) + 360) % 360;
}

function shortestAngleDelta(from, to) {
  return ((to - from + 540) % 360) - 180;
}

function getScreenAngle() {
  const angle = window.screen?.orientation?.angle;
  if (typeof angle === 'number') return angle;
  if (typeof window.orientation === 'number') return window.orientation;
  return 0;
}

function headingFromOrientation(event) {
  if (typeof event.webkitCompassHeading === 'number' && !Number.isNaN(event.webkitCompassHeading)) {
    return normalizeDegrees(event.webkitCompassHeading + getScreenAngle());
  }

  const { alpha, beta, gamma } = event;
  if ([alpha, beta, gamma].some((value) => typeof value !== 'number' || Number.isNaN(value))) {
    return null;
  }

  const alphaRad = alpha * (Math.PI / 180);
  const betaRad = beta * (Math.PI / 180);
  const gammaRad = gamma * (Math.PI / 180);

  const cX = Math.cos(betaRad) * Math.sin(gammaRad);
  const cY = Math.sin(betaRad) * Math.sin(gammaRad) * Math.cos(alphaRad) - Math.cos(gammaRad) * Math.sin(alphaRad);

  if (cX === 0 && cY === 0) return null;

  const heading = Math.atan2(cX, cY) * (180 / Math.PI);
  return normalizeDegrees(heading + getScreenAngle());
}

export default function Qibla({ location }) {
  const [heading, setHeading] = useState(0);
  const [compassActive, setCompassActive] = useState(false);
  const [permissionState, setPermissionState] = useState('idle');
  const [statusText, setStatusText] = useState('Enable compass access for live Qibla alignment.');
  const headingRef = useRef(0);
  const listenerRef = useRef(null);
  const qiblaAngle = calculateQibla(location.lat, location.lng);
  const relativeQibla = useMemo(() => normalizeDegrees(qiblaAngle - heading), [qiblaAngle, heading]);
  const aligned = Math.abs(shortestAngleDelta(heading, qiblaAngle)) <= 8;

  function detachListener() {
    if (listenerRef.current) {
      window.removeEventListener('deviceorientationabsolute', listenerRef.current, true);
      window.removeEventListener('deviceorientation', listenerRef.current, true);
      listenerRef.current = null;
    }
  }

  function attachListener() {
    detachListener();

    const handleOrientation = (event) => {
      const nextHeading = headingFromOrientation(event);
      if (nextHeading === null) {
        setStatusText('Move the phone in a gentle figure-eight to calibrate the compass.');
        return;
      }

      const smoothedHeading = normalizeDegrees(
        headingRef.current + shortestAngleDelta(headingRef.current, nextHeading) * 0.22
      );
      headingRef.current = smoothedHeading;
      setHeading(smoothedHeading);
      setCompassActive(true);
      setPermissionState('granted');
      setStatusText('Live compass active. Hold the phone flat or upright and turn until the marker aligns.');
    };

    listenerRef.current = handleOrientation;
    if ('ondeviceorientationabsolute' in window) {
      window.addEventListener('deviceorientationabsolute', handleOrientation, true);
    }
    window.addEventListener('deviceorientation', handleOrientation, true);
  }

  useEffect(() => {
    if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission !== 'function') {
      attachListener();
      setPermissionState('granted');
    }

    const handleOrientationChange = () => {
      if (compassActive) {
        setStatusText('Orientation changed. Re-align the phone for an updated heading.');
      }
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.screen?.orientation?.addEventListener?.('change', handleOrientationChange);

    return () => {
      detachListener();
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.screen?.orientation?.removeEventListener?.('change', handleOrientationChange);
    };
  }, [compassActive]);

  async function requestPermission() {
    try {
      if (!window.DeviceOrientationEvent) {
        setPermissionState('unsupported');
        setStatusText('Compass sensors are not available on this device.');
        return;
      }

      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        const result = await DeviceOrientationEvent.requestPermission();
        if (result !== 'granted') {
          setPermissionState('denied');
          setStatusText('Compass permission was denied. Allow motion access in browser settings.');
          return;
        }
      }

      attachListener();
      setPermissionState('granted');
    } catch (error) {
      logError('qibla:permission', error);
      setPermissionState('error');
      setStatusText('Unable to access the compass on this device.');
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
        <div className="qibla-copy" style={{ marginTop: 12 }}>
          Device heading: {Math.round(heading)}° · Qibla offset: {Math.round(relativeQibla)}°
        </div>

        {!compassActive ? (
          <button onClick={requestPermission} className="qibla-cta">
            {permissionState === 'denied' ? 'Retry Compass Access' : 'Enable Compass'}
          </button>
        ) : (
          <div className="qibla-status" style={aligned ? { color: 'var(--gold-600)', borderColor: 'rgba(201,168,76,0.22)', background: 'rgba(201,168,76,0.08)' } : undefined}>
            {aligned ? 'Aligned with the Qibla' : 'Turn the phone until the Kaaba marker points straight ahead'}
          </div>
        )}

        <div className="qibla-copy">
          {statusText}
        </div>
      </div>
    </div>
  );
}
