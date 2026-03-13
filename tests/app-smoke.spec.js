import { test, expect } from '@playwright/test';

async function installAudioHarness(page) {
  await page.addInitScript(() => {
    class MockAudio extends EventTarget {
      constructor() {
        super();
        this._src = '';
        this._currentTime = 0;
        this._duration = 7;
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

  await page.route('https://api.quran.com/api/v4/chapter_recitations/**', async (route) => {
    const timings = Array.from({ length: 7 }, (_, index) => {
      const ayah = index + 1;
      const from = index * 1000;
      const to = from + 1000;
      return {
        verse_key: `1:${ayah}`,
        timestamp_from: from,
        timestamp_to: to,
        segments: [
          [0, from, from + 400],
          [1, from + 400, from + 700],
          [2, from + 700, to],
        ],
      };
    });

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ audio_file: { timestamps: timings } }),
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

  await page.locator('.ayah-card button').nth(3).click({ force: true });

  await expect.poll(async () => {
    return page.evaluate(() => {
      const state = window.__mosAudioManager.getState();
      return `${state.playbackMode}:${state.currentVerseKey}`;
    });
  }).toBe('ayah:1:1');

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
