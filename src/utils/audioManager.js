const INITIAL_STATE = {
  playbackMode: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  currentSurah: null,
  currentAyahAbs: null,
  currentVerseKey: null,
  sourceUrl: '',
  reciter: null,
  playbackRate: 1,
  revision: 0,
};

class AudioManager {
  constructor() {
    this.audio = typeof window !== 'undefined' ? new Audio() : null;
    this.listeners = new Set();
    this.handlers = {
      onEnded: null,
      onError: null,
      onSeeked: null,
    };
    this.state = { ...INITIAL_STATE };
    this.revision = 0;

    if (this.audio) {
      this.bindEvents();
    }
  }

  bindEvents() {
    this.audio.addEventListener('play', () => {
      this.patch({ isPlaying: true });
    });

    this.audio.addEventListener('pause', () => {
      this.patch({ isPlaying: false, currentTime: this.audio.currentTime || 0 });
    });

    this.audio.addEventListener('timeupdate', () => {
      this.patch({ currentTime: this.audio.currentTime || 0 });
    });

    this.audio.addEventListener('loadedmetadata', () => {
      this.patch({ duration: this.audio.duration || 0 });
    });

    this.audio.addEventListener('ratechange', () => {
      this.patch({ playbackRate: this.audio.playbackRate || 1 });
    });

    this.audio.addEventListener('seeked', () => {
      this.patch({ currentTime: this.audio.currentTime || 0 });
      this.handlers.onSeeked?.(this.getState());
    });

    this.audio.addEventListener('ended', () => {
      this.patch({ isPlaying: false, currentTime: this.audio.duration || this.audio.currentTime || 0 });
      this.handlers.onEnded?.(this.getState());
    });

    this.audio.addEventListener('error', () => {
      this.handlers.onError?.(this.getState(), this.audio.error);
    });
  }

  getState() {
    return this.state;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  patch(patch) {
    this.state = {
      ...this.state,
      ...patch,
      revision: ++this.revision,
    };
    this.notify();
  }

  resetState() {
    this.state = {
      ...INITIAL_STATE,
      playbackRate: this.state.playbackRate || 1,
      revision: ++this.revision,
    };
    this.notify();
  }

  async playSource({
    playbackMode,
    src,
    reciter,
    currentSurah = null,
    currentAyahAbs = null,
    currentVerseKey = null,
    playbackRate = 1,
    onEnded,
    onError,
    onSeeked,
  }) {
    if (!this.audio) return;

    this.stop();
    this.handlers = { onEnded, onError, onSeeked };

    this.audio.src = src;
    this.audio.currentTime = 0;
    this.audio.playbackRate = playbackRate;

    this.patch({
      playbackMode,
      sourceUrl: src,
      reciter,
      currentSurah,
      currentAyahAbs,
      currentVerseKey,
      currentTime: 0,
      duration: 0,
      isPlaying: false,
      playbackRate,
    });

    await this.audio.play();
  }

  stop() {
    if (!this.audio) return;
    this.handlers = { onEnded: null, onError: null, onSeeked: null };
    this.audio.pause();
    if (typeof this.audio.removeAttribute === 'function') {
      this.audio.removeAttribute('src');
    } else {
      this.audio.src = '';
    }
    if (typeof this.audio.load === 'function') {
      this.audio.load();
    }
    this.resetState();
  }

  pause() {
    this.audio?.pause();
  }

  resume() {
    if (!this.audio || !this.state.sourceUrl) return;
    this.audio.playbackRate = this.state.playbackRate || 1;
    this.audio.play().catch(() => {});
  }

  toggle() {
    if (!this.audio || !this.state.sourceUrl) return;
    if (this.state.isPlaying) this.pause();
    else this.resume();
  }

  seekTo(seconds) {
    if (!this.audio || !Number.isFinite(seconds)) return;
    const duration = this.audio.duration || 0;
    const nextTime = duration > 0
      ? Math.max(0, Math.min(seconds, duration))
      : Math.max(0, seconds);
    this.audio.currentTime = nextTime;
    this.patch({ currentTime: nextTime });
  }

  setPlaybackRate(rate) {
    if (!Number.isFinite(rate) || !this.audio) return;
    this.audio.playbackRate = rate;
    this.patch({ playbackRate: rate });
  }
}

const audioManager = new AudioManager();

if (typeof window !== 'undefined') {
  window.__mosAudioManager = audioManager;
}

export default audioManager;
