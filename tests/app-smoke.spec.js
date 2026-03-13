import { test, expect } from '@playwright/test';

async function installAudioHarness(page) {
  await page.addInitScript(() => {
    class MockAudio extends EventTarget {
      constructor() {
        super();
        this._src = '';
        this._currentTime = 0;
        this._duration = 400;
        this._playbackRate = 1;
        this.paused = true;
        this.error = null;
      }

      get src() { return this._src; }
      set src(value) {
        this._src = value;
        this._currentTime = 0;
        queueMicrotask(() => this.dispatchEvent(new Event('loadedmetadata')));
      }

      get currentTime() { return this._currentTime; }
      set currentTime(value) {
        this._currentTime = value;
        this.dispatchEvent(new Event('timeupdate'));
        this.dispatchEvent(new Event('seeked'));
      }

      get duration() { return this._duration; }
      set duration(value) { this._duration = value; }

      get playbackRate() { return this._playbackRate; }
      set playbackRate(value) { this._playbackRate = value; }

      play() {
        this.paused = false;
        this.dispatchEvent(new Event('play'));
        queueMicrotask(() => {
          this.dispatchEvent(new Event('playing'));
          this.dispatchEvent(new Event('timeupdate'));
        });
        return Promise.resolve();
      }

      pause() {
        this.paused = true;
        this.dispatchEvent(new Event('pause'));
      }

      load() {
        this._src = '';
        this._currentTime = 0;
      }
    }

    window.Audio = MockAudio;
  });

  await page.route('https://api.quran.com/api/v4/chapter_recitations/**/**', async (route) => {
    const url = new URL(route.request().url());
    const match = url.pathname.match(/chapter_recitations\/\d+\/(\d+)/);
    const surah = Number(match?.[1] || 1);
    const verseCount = surah === 1 ? 7 : 286;
    const timings = Array.from({ length: verseCount }, (_, index) => {
      const ayah = index + 1;
      const from = index * 1000;
      const to = from + 1000;
      return {
        verse_key: `${surah}:${ayah}`,
        timestamp_from: from,
        timestamp_to: to,
        segments: [
          [0, from, from + 250],
          [1, from + 250, from + 650],
          [2, from + 650, to],
        ],
      };
    });

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ audio_file: { audio_url: `https://example.com/surah-${surah}.mp3`, timestamps: timings } }),
    });
  });
}

test('home page renders promoted sections', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'MuslimOS' })).toBeVisible();
  await expect(page.getByText('Ayat of the Day')).toBeVisible();
  await expect(page.getByText('Your Path')).toBeVisible();
  await expect(page.getByText('Your Journey')).toBeVisible();
});

test('bottom nav reaches all main tabs', async ({ page }) => {
  await page.goto('/');

  await page.locator('.bottom-nav').getByRole('button', { name: 'Quran', exact: true }).click();
  await expect(page.locator('.page-title').filter({ hasText: 'Al-Quran' })).toBeVisible();

  await page.locator('.bottom-nav').getByRole('button', { name: 'Worship', exact: true }).click();
  await expect(page.locator('.page-title').filter({ hasText: 'Worship' })).toBeVisible();

  await page.locator('.bottom-nav').getByRole('button', { name: 'Hadith', exact: true }).click();
  await expect(page.locator('.page-title').filter({ hasText: 'Hadith' })).toBeVisible();

  await page.locator('.bottom-nav').getByRole('button', { name: 'Home', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'MuslimOS' })).toBeVisible();
});

test('hamburger menu opens and closes from the home header', async ({ page }) => {
  await page.goto('/');

  const menuButton = page.getByRole('button', { name: 'Open menu' }).first();
  await expect(menuButton).toBeVisible();
  await menuButton.click();

  await expect(page.locator('.appdrawer.open')).toBeVisible();
  await expect(page.locator('.appdrawer-overlay.open')).toBeVisible();

  await page.locator('.appdrawer-overlay.open').click({ position: { x: 10, y: 10 } });
  await expect(page.locator('.appdrawer.open')).toHaveCount(0);
});

test('surah and ayah playback never run together', async ({ page }) => {
  await installAudioHarness(page);
  await page.goto('/');

  await page.locator('.bottom-nav').getByRole('button', { name: 'Quran', exact: true }).click();
  await page.getByText('Al-Fatihah').first().click();
  await page.evaluate(async () => {
    await window.__mosAudioManager.playSource({
      playbackMode: 'surah',
      src: 'https://example.com/fatihah-surah.mp3',
      reciter: 'ar.alafasy',
      currentSurah: 1,
    });
  });

  await expect.poll(async () => {
    return page.evaluate(() => window.__mosAudioManager.getState().playbackMode);
  }).toBe('surah');

  await expect(page.locator('.audio-bar')).toBeVisible();

  await page.locator('.ayah-card button').nth(3).click({ force: true });

  await expect.poll(async () => {
    return page.evaluate(() => {
      const state = window.__mosAudioManager.getState();
      return `${state.playbackMode}:${state.currentVerseKey}`;
    });
  }).toBe('ayah:1:1');

  await expect(page.locator('.audio-bar')).toBeVisible();

  await page.evaluate(async () => {
    await window.__mosAudioManager.playSource({
      playbackMode: 'surah',
      src: 'https://example.com/fatihah-surah.mp3',
      reciter: 'ar.alafasy',
      currentSurah: 1,
    });
  });

  await expect.poll(async () => {
    return page.evaluate(() => {
      const state = window.__mosAudioManager.getState();
      return `${state.playbackMode}:${state.currentSurah}`;
    });
  }).toBe('surah:1');
});

test('ayah highlight stays in sync after play and seek', async ({ page }) => {
  await installAudioHarness(page);
  await page.goto('/');

  await page.locator('.bottom-nav').getByRole('button', { name: 'Quran', exact: true }).click();
  await page.getByText('Al-Fatihah').first().click();
  await page.evaluate(async () => {
    await window.__mosAudioManager.playSource({
      playbackMode: 'surah',
      src: 'https://example.com/fatihah-surah.mp3',
      reciter: 'ar.alafasy',
      currentSurah: 1,
    });
  });

  await expect.poll(async () => {
    return page.evaluate(() => window.__mosAudioManager.getState().playbackMode);
  }).toBe('surah');

  await page.evaluate(() => {
    window.__mosAudioManager.seekTo(2.2);
  });

  await expect.poll(async () => {
    return page.locator('.ayah-card.active').textContent();
  }).toContain('1.3');

  await expect(page.locator('.ayah-card.active .karaoke-word.active')).toHaveCount(1);

  await page.evaluate(() => {
    window.__mosAudioManager.seekTo(4.3);
  });

  await expect.poll(async () => {
    return page.locator('.ayah-card.active').textContent();
  }).toContain('1.5');
});

test('ayah highlight only appears after playing and clears on pause', async ({ page }) => {
  await installAudioHarness(page);
  await page.goto('/');

  await page.locator('.bottom-nav').getByRole('button', { name: 'Quran', exact: true }).click();
  await page.getByText('Al-Fatihah').first().click();
  await page.locator('.ayah-card button').nth(3).click({ force: true });

  await expect.poll(async () => {
    return page.evaluate(() => {
      const state = window.__mosAudioManager.getState();
      return `${state.playbackMode}:${state.isPlaying}:${state.currentVerseKey}`;
    });
  }).toBe('ayah:true:1:1');

  await expect(page.locator('.ayah-card.active')).toContainText('1.1');
  await expect(page.locator('.audio-bar')).toBeVisible();

  await page.evaluate(() => window.__mosAudioManager.pause());

  await expect.poll(async () => page.locator('.ayah-card.active').count()).toBe(0);
});

test('long surah timing stays aligned through at least twenty ayahs', async ({ page }) => {
  await installAudioHarness(page);
  await page.goto('/');

  await page.locator('.bottom-nav').getByRole('button', { name: 'Quran', exact: true }).click();
  await page.getByText('Al-Baqarah').first().click();
  await page.evaluate(async () => {
    await window.__mosAudioManager.playSource({
      playbackMode: 'surah',
      src: 'https://example.com/baqarah-surah.mp3',
      reciter: 'ar.alafasy',
      currentSurah: 2,
    });
  });

  await expect(page.locator('.audio-bar')).toBeVisible();

  await page.evaluate(() => {
    window.__mosAudioManager.seekTo(19.2);
  });

  await expect.poll(async () => {
    return page.locator('.ayah-card.active').textContent();
  }).toContain('2.20');
});

test('playing a surah from the list opens the reader view', async ({ page }) => {
  await installAudioHarness(page);
  await page.goto('/');

  await page.locator('.bottom-nav').getByRole('button', { name: 'Quran', exact: true }).click();
  await page.getByRole('button', { name: 'Play Al-Fatihah' }).click();

  await expect(page.locator('.surah-banner')).toBeVisible();
  await expect(page.locator('.surah-banner')).toContainText('Al-Fatihah');
});

test('surah playback advances reader to the next surah when one finishes', async ({ page }) => {
  await installAudioHarness(page);
  await page.goto('/');

  await page.locator('.bottom-nav').getByRole('button', { name: 'Quran', exact: true }).click();
  await page.getByRole('button', { name: 'Play Al-Fatihah' }).click();
  await expect(page.locator('.surah-banner')).toContainText('Al-Fatihah');

  await page.evaluate(() => {
    window.__mosAudioManager.audio.dispatchEvent(new Event('ended'));
  });

  await expect.poll(async () => {
    return page.locator('.surah-banner').textContent();
  }).toContain('Al-Baqarah');
});

test('ayah autoplay setting advances to the next ayah', async ({ page }) => {
  await installAudioHarness(page);
  await page.goto('/');

  await page.getByRole('button', { name: 'Open menu' }).first().click();
  await page.getByRole('button', { name: /Settings/i }).click();
  await page.getByRole('button', { name: 'On', exact: true }).click();

  await page.locator('.bottom-nav').getByRole('button', { name: 'Quran', exact: true }).click();
  await page.getByText('Al-Fatihah').first().click();
  await page.locator('.ayah-card button').nth(3).click({ force: true });

  await page.evaluate(() => {
    window.__mosAudioManager.audio.dispatchEvent(new Event('ended'));
  });

  await expect.poll(async () => {
    return page.evaluate(() => window.__mosAudioManager.getState().currentVerseKey);
  }).toBe('1:2');
});

test('browser back returns to home instead of leaving the app', async ({ page }) => {
  await page.goto('/');

  await page.locator('.bottom-nav').getByRole('button', { name: 'Hadith', exact: true }).click();
  await expect(page.locator('.page-title').filter({ hasText: 'Hadith' })).toBeVisible();

  await page.goBack();

  await expect(page.getByRole('heading', { name: 'MuslimOS' })).toBeVisible();
});

test('floating player next button advances to next ayah during ayah playback', async ({ page }) => {
  await installAudioHarness(page);
  await page.goto('/');

  await page.getByRole('button', { name: 'Open menu' }).first().click();
  await page.getByRole('button', { name: /Settings/i }).click();
  await page.getByRole('button', { name: 'On', exact: true }).click();

  await page.locator('.bottom-nav').getByRole('button', { name: 'Quran', exact: true }).click();
  await page.getByText('Al-Fatihah').first().click();
  await page.locator('.ayah-card button').nth(3).click({ force: true });

  await expect(page.locator('.audio-bar')).toBeVisible();
  await page.locator('.audio-bar').getByRole('button', { name: 'Next Surah' }).click();

  await expect.poll(async () => {
    return page.evaluate(() => window.__mosAudioManager.getState().currentVerseKey);
  }).toBe('1:2');
});
