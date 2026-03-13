import React, { useState, useEffect, useCallback } from 'react';
import BottomNav from './components/BottomNav';
import HomePage from './components/HomePage';
import QuranReader from './components/QuranReader';
import Worship from './components/Worship';
import MorePage from './components/MorePage';
import HadithPage from './components/HadithPage';
import HadithCollection from './components/HadithCollection';
import LearnPage from './components/LearnPage';
import GuideReader from './components/GuideReader';
import AudioPlayer from './components/AudioPlayer';
import { calculatePrayerTimes } from './utils/prayerCalc';

const RECITERS = [
  { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy', ayahBitrate: 128, surahBitrate: 128 },
  { id: 'ar.abdurrahmaansudais', name: 'Abdul Rahman Al-Sudais', ayahBitrate: 64, surahBitrate: null },
  { id: 'ar.abdulbasitmurattal', name: 'Abdul Basit Murattal', ayahBitrate: 64, surahBitrate: 128 },
  { id: 'ar.husary', name: 'Mahmoud Khalil Al-Husary', ayahBitrate: 128, surahBitrate: null },
];

export default function App() {
  const [page, setPage] = useState('home');
  const [location, setLocation] = useState({
    lat: 31.5204, lng: 74.3587, tz: 5, label: 'Lahore (default)'
  });
  const [calcMethodIdx, setCalcMethodIdx] = useState(() =>
    parseInt(localStorage.getItem('mos_calc') || '0')
  );

  // Hadith sub-navigation
  const [activeCollection, setActiveCollection] = useState(null);

  // Learn sub-navigation
  const [activeGuide, setActiveGuide] = useState(null);

  // Audio state
  const [currentSurah, setCurrentSurah] = useState(() => {
    const saved = localStorage.getItem('mos_audio_surah');
    return saved ? parseInt(saved) : null;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [reciter, setReciter] = useState(() =>
    localStorage.getItem('mos_reciter') || 'ar.alafasy'
  );

  // Theme state
  const [theme, setTheme] = useState(() =>
    localStorage.getItem('mos_theme') || 'light'
  );

  const applyTheme = useCallback((mode) => {
    if (mode === 'auto') {
      const times = calculatePrayerTimes(location.lat, location.lng, location.tz, calcMethodIdx);
      const nowH = new Date().getHours() + new Date().getMinutes() / 60;
      const ishaH = times.Isha % 24;
      const fajrH = times.Fajr % 24;
      const isDark = nowH >= ishaH || nowH < fajrH;
      document.body.classList.toggle('dark-mode', isDark);
    } else {
      document.body.classList.toggle('dark-mode', mode === 'dark');
    }
  }, [location, calcMethodIdx]);

  useEffect(() => {
    applyTheme(theme);
    if (theme === 'auto') {
      const interval = setInterval(() => applyTheme('auto'), 60000);
      return () => clearInterval(interval);
    }
  }, [theme, applyTheme]);

  function handleThemeChange(t) {
    setTheme(t);
    localStorage.setItem('mos_theme', t);
  }

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            tz: -new Date().getTimezoneOffset() / 60,
            label: `${pos.coords.latitude.toFixed(2)}\u00B0N, ${pos.coords.longitude.toFixed(2)}\u00B0E`,
          });
        },
        () => {},
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, []);

  function handleNavigate(newPage) {
    setPage(newPage);
    setActiveCollection(null);
    setActiveGuide(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function toggleCalcMethod() {
    const next = (calcMethodIdx + 1) % 4;
    setCalcMethodIdx(next);
    localStorage.setItem('mos_calc', next);
  }

  function handlePlaySurah(num) {
    setCurrentSurah(num);
    setIsPlaying(true);
    localStorage.setItem('mos_audio_surah', num);
  }

  function handlePlayPause() {
    setIsPlaying(!isPlaying);
  }

  function handleCloseAudio() {
    setIsPlaying(false);
    setCurrentSurah(null);
    localStorage.removeItem('mos_audio_surah');
  }

  function handleNextSurah() {
    if (currentSurah < 114) {
      const next = currentSurah + 1;
      setCurrentSurah(next);
      setIsPlaying(true);
      localStorage.setItem('mos_audio_surah', next);
    }
  }

  function handlePrevSurah() {
    if (currentSurah > 1) {
      const prev = currentSurah - 1;
      setCurrentSurah(prev);
      setIsPlaying(true);
      localStorage.setItem('mos_audio_surah', prev);
    }
  }

  function handleReciterChange(r) {
    setReciter(r);
    localStorage.setItem('mos_reciter', r);
  }

  function handleOpenCollection(id) {
    setActiveCollection(id);
    window.scrollTo({ top: 0 });
  }

  function handleOpenGuide(id) {
    setActiveGuide(id);
    window.scrollTo({ top: 0 });
  }

  const hasAudio = !!currentSurah;

  return (
    <div className="app" style={{ paddingBottom: hasAudio ? 140 : 100 }}>
      {page === 'home' && <HomePage location={location} calcMethodIdx={calcMethodIdx} onNavigate={handleNavigate} theme={theme} onThemeChange={handleThemeChange} />}
      {page === 'quran' && <QuranReader onPlaySurah={handlePlaySurah} reciter={reciter} reciters={RECITERS} />}
      {page === 'worship' && <Worship />}
      {page === 'hadith' && !activeCollection && (
        <HadithPage onOpenCollection={handleOpenCollection} />
      )}
      {page === 'hadith' && activeCollection && (
        <HadithCollection
          collectionId={activeCollection}
          onBack={() => { setActiveCollection(null); window.scrollTo({ top: 0 }); }}
        />
      )}
      {page === 'learn' && !activeGuide && (
        <LearnPage onOpenGuide={handleOpenGuide} onBack={() => handleNavigate('home')} />
      )}
      {page === 'learn' && activeGuide && (
        <GuideReader guideId={activeGuide} onBack={() => { setActiveGuide(null); window.scrollTo({ top: 0 }); }} />
      )}
      {page === 'more' && (
        <MorePage
          calcMethodIdx={calcMethodIdx}
          onToggleCalcMethod={toggleCalcMethod}
          location={location}
          reciter={reciter}
          reciters={RECITERS}
          onReciterChange={handleReciterChange}
          onNavigate={handleNavigate}
          theme={theme}
          onThemeChange={handleThemeChange}
        />
      )}
      {hasAudio && (
        <AudioPlayer
          currentSurah={currentSurah}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onClose={handleCloseAudio}
          onNext={handleNextSurah}
          onPrev={handlePrevSurah}
          reciter={reciter}
          reciters={RECITERS}
        />
      )}
      <BottomNav activePage={page} onNavigate={handleNavigate} hasAudio={hasAudio} />
    </div>
  );
}
