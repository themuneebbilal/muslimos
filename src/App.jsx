import React, { useState, useEffect, useCallback } from 'react';
import BottomNav from './components/BottomNav';
import AppDrawer from './components/AppDrawer';
import HomePage from './components/HomePage';
import QuranReader from './components/QuranReader';
import Worship from './components/Worship';
import HadithPage from './components/HadithPage';
import HadithCollection from './components/HadithCollection';
import LearnPage from './components/LearnPage';
import GuideReader from './components/GuideReader';
import PrayerTimesPage from './components/PrayerTimesPage';
import SettingsPage from './components/SettingsPage';
import AudioPlayer from './components/AudioPlayer';
import Qibla from './components/Qibla';
import { IconHamburger, IconBack } from './components/Icons';
import { calculatePrayerTimes } from './utils/prayerCalc';
import audioManager from './utils/audioManager';
import { getSurahAudioUrl } from './utils/quranAudio';

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
  const [drawerOpen, setDrawerOpen] = useState(false);

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
    setDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function toggleCalcMethod() {
    const next = (calcMethodIdx + 1) % 4;
    setCalcMethodIdx(next);
    localStorage.setItem('mos_calc', next);
  }

  async function startSurahPlayback(num, requestedReciter = reciter) {
    try {
      const src = await getSurahAudioUrl(requestedReciter, num, RECITERS);
      await audioManager.playSource({
        playbackMode: 'surah',
        src,
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
    setDrawerOpen(false);
    setActiveCollection(id);
    window.scrollTo({ top: 0 });
  }

  function handleOpenGuide(id) {
    setDrawerOpen(false);
    setPage('learn');
    setActiveGuide(id);
    window.scrollTo({ top: 0 });
  }

  function handleOpenQibla() {
    setDrawerOpen(false);
    setActiveCollection(null);
    setActiveGuide(null);
    setPage('qibla');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleOpenSettings() {
    setDrawerOpen(false);
    setActiveCollection(null);
    setActiveGuide(null);
    setPage('settings');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  useEffect(() => {
    if (audioState.playbackMode === 'surah' && audioState.currentSurah) {
      localStorage.setItem('mos_audio_surah', String(audioState.currentSurah));
      return;
    }
    localStorage.removeItem('mos_audio_surah');
  }, [audioState.playbackMode, audioState.currentSurah]);

  const hasAudio = (!!audioState.sourceUrl || audioState.isPlaying) && !!audioState.currentSurah;

  return (
    <div className="app" style={{ paddingBottom: hasAudio ? 140 : 100 }}>
      <AppDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activePage={page}
        onNavigate={handleNavigate}
        onOpenGuide={handleOpenGuide}
        onOpenQibla={handleOpenQibla}
        location={location}
        onOpenSettings={handleOpenSettings}
      />

      {page !== 'home' && (
        <button
          type="button"
          className="app-shell-menu"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
        >
          <IconHamburger size={18} />
        </button>
      )}

      {page === 'home' && <HomePage location={location} calcMethodIdx={calcMethodIdx} onNavigate={handleNavigate} theme={theme} onThemeChange={handleThemeChange} onOpenDrawer={() => setDrawerOpen(true)} />}
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
      {page === 'qibla' && (
        <div className="animate-fade-up">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', padding: 'var(--sp-5) 0 var(--sp-2)' }}>
            <button className="back-btn" onClick={() => handleNavigate('home')}>
              <IconBack size={16} />
            </button>
            <div className="page-title" style={{ padding: 0 }}>Qibla Direction</div>
          </div>
          <Qibla location={location} />
        </div>
      )}
      {page === 'settings' && (
        <SettingsPage
          onBack={() => handleNavigate('home')}
          calcMethodIdx={calcMethodIdx}
          onToggleCalcMethod={toggleCalcMethod}
          theme={theme}
          onThemeChange={handleThemeChange}
          reciter={reciter}
          reciters={RECITERS}
          onReciterChange={handleReciterChange}
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
