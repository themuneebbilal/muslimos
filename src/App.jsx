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
import PrayerTimesPage from './components/PrayerTimesPage';
import AudioPlayer from './components/AudioPlayer';
import { calculatePrayerTimes } from './utils/prayerCalc';
import audioManager from './utils/audioManager';
import { surahAudioUrl } from './utils/quranAudio';

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
  const [audioState, setAudioState] = useState(audioManager.getState());
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

  useEffect(() => {
    return audioManager.subscribe(setAudioState);
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

  async function startSurahPlayback(num, requestedReciter = reciter) {
    try {
      await audioManager.playSource({
        playbackMode: 'surah',
        src: surahAudioUrl(requestedReciter, num, RECITERS),
        reciter: requestedReciter,
        currentSurah: num,
        onEnded: () => {
          if (num < 114) {
            startSurahPlayback(num + 1, requestedReciter);
          } else {
            audioManager.stop();
          }
        },
      });
      localStorage.setItem('mos_audio_surah', String(num));
    } catch {}
  }

  function handlePlaySurah(num) {
    startSurahPlayback(num);
  }

  function handlePlayPause() {
    audioManager.toggle();
  }

  function handleCloseAudio() {
    audioManager.stop();
    localStorage.removeItem('mos_audio_surah');
  }

  function handleNextSurah() {
    if (audioState.currentSurah < 114) {
      startSurahPlayback(audioState.currentSurah + 1);
    }
  }

  function handlePrevSurah() {
    if (audioState.currentSurah > 1) {
      startSurahPlayback(audioState.currentSurah - 1);
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

  useEffect(() => {
    if (audioState.playbackMode === 'surah' && audioState.currentSurah) {
      localStorage.setItem('mos_audio_surah', String(audioState.currentSurah));
      return;
    }
    localStorage.removeItem('mos_audio_surah');
  }, [audioState.playbackMode, audioState.currentSurah]);

  const hasAudio = audioState.playbackMode === 'surah' && !!audioState.currentSurah;

  return (
    <div className="app" style={{ paddingBottom: hasAudio ? 140 : 100 }}>
      {page === 'home' && <HomePage location={location} calcMethodIdx={calcMethodIdx} onNavigate={handleNavigate} theme={theme} onThemeChange={handleThemeChange} />}
      {page === 'prayers' && <PrayerTimesPage location={location} calcMethodIdx={calcMethodIdx} onNavigate={handleNavigate} onToggleCalcMethod={toggleCalcMethod} />}
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
          currentSurah={audioState.currentSurah}
          isPlaying={audioState.isPlaying}
          progress={audioState.currentTime}
          duration={audioState.duration}
          onPlayPause={handlePlayPause}
          onClose={handleCloseAudio}
          onNext={handleNextSurah}
          onPrev={handlePrevSurah}
          onSeek={(nextTime) => audioManager.seekTo(nextTime)}
          reciter={reciter}
          reciters={RECITERS}
        />
      )}
      <BottomNav activePage={page} onNavigate={handleNavigate} hasAudio={hasAudio} />
    </div>
  );
}
