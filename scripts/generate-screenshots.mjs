#!/usr/bin/env node
/**
 * MuslimOS — Play Store Screenshot Generator
 * Captures 8 phone screenshots + 1 feature graphic using Playwright.
 * Usage: node scripts/generate-screenshots.mjs
 */

import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { preview, build } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT = resolve(ROOT, 'playstore/assets');
const PORT = 4199;

// Ensure output dir
mkdirSync(OUT, { recursive: true });

// ── localStorage seed data ─────────────────────────────────────────────

// 14-day streak — app expects { dates: [...], current, longest }
const streakDates = [];
for (let i = 13; i >= 0; i--) {
  const d = new Date('2026-03-15');
  d.setDate(d.getDate() - i);
  streakDates.push(d.toISOString().slice(0, 10));
}
const streakData = { dates: streakDates, current: 14, longest: 14 };

// ~30% khatm — app expects { surahs: { "1": { maxAyah, complete, readAt }, ... }, startedAt, completedAt }
const khatmSurahs = {};
for (let i = 1; i <= 34; i++) {
  khatmSurahs[i] = { maxAyah: 999, complete: true, readAt: '2026-03-14T12:00:00Z' };
}
const khatmData = { surahs: khatmSurahs, startedAt: '2026-02-01T00:00:00Z', completedAt: null };

// Worship tracker — module-based checklist
const worshipTracker = {
  daily: { fajr: true, dhuhr: true, asr: false, maghrib: false, isha: false, taraweeh: false },
  surahs: { quran_ar: true, quran_tr: false, mulk: false, hadith: false, memorise: false },
  dhikr: { morning: true, evening: false, postprayer: true, istighfar: false, salawat: true },
  planner: { salah_block: true, quran_slot: false, goal: false, family: false },
  journal: { gratitude: false, dua_written: false, lesson: false, repentance: false },
};

// 5-day worship streak
const worshipDays = [
  '2026-03-11',
  '2026-03-12',
  '2026-03-13',
  '2026-03-14',
  '2026-03-15',
];

// Journal entries — app expects { id, text, mood, anchor, createdAt }
const journalEntries = [
  {
    id: 'journal_1710460800000',
    text: 'Started the morning with Fajr on time and felt a deep sense of peace during recitation. The stillness before sunrise is something I want to hold on to.',
    mood: 'Grateful',
    anchor: 'Fajr',
    createdAt: '2026-03-15T08:00:00+05:00',
  },
  {
    id: 'journal_1710374400000',
    text: "Completed Surah Al-Kahf today. The story of the people of the cave reminds me to trust Allah's plan even when things feel uncertain.",
    mood: 'Focused',
    anchor: 'General',
    createdAt: '2026-03-14T14:00:00+05:00',
  },
  {
    id: 'journal_1710288000000',
    text: 'Evening dhikr session felt grounding. 33 rounds of SubhanAllah, Alhamdulillah, and Allahu Akbar. Simple but powerful.',
    mood: 'Calm',
    anchor: 'Isha',
    createdAt: '2026-03-13T21:00:00+05:00',
  },
];

const LOCAL_STORAGE = {
  mos_theme: 'light',
  mos_calc: '0',
  mos_streak: JSON.stringify(streakData),
  mos_khatm: JSON.stringify(khatmData),
  mos_lastRead: JSON.stringify({ surah: 18, ayah: 46, name: 'Al-Kahf', ar: '\u0627\u0644\u0643\u0647\u0641' }),
  mos_tb_subhanallah: '27',
  mos_tb_alhamdulillah: '33',
  mos_tb_allahuakbar: '18',
  mos_worship_tracker: JSON.stringify(worshipTracker),
  mos_worship_tracker_days: JSON.stringify(worshipDays),
  mos_journal_entries: JSON.stringify(journalEntries),
  mos_bookmarks: JSON.stringify([1, 18, 36, 55, 67, 112]),
};

// ── Screenshot definitions ─────────────────────────────────────────────

const SCREENSHOTS = [
  {
    name: 'phone-home',
    label: 'Home Dashboard',
    actions: [],
    waitFor: '.homev2',
  },
  {
    name: 'phone-prayer-times',
    label: 'Prayer Times',
    actions: [
      { type: 'click', selector: 'button[class*="homev2-fold-card"]', match: 'Prayer' },
    ],
    waitFor: '.prayer-times-page',
  },
  {
    name: 'phone-quran-list',
    label: 'Surah List',
    actions: [
      { type: 'clickNav', id: 'quran' },
    ],
    waitFor: '.quranv2-surah-card',
  },
  {
    name: 'phone-quran-reader',
    label: 'Quran Reader',
    actions: [
      { type: 'clickNav', id: 'quran' },
      { type: 'wait', ms: 1500 },
      { type: 'clickText', selector: '.quranv2-surah-card', text: 'Al-Fatihah' },
    ],
    waitFor: '.surah-banner',
  },
  {
    name: 'phone-worship',
    label: 'Worship Tracker',
    actions: [
      { type: 'clickNav', id: 'worship' },
    ],
    waitFor: '.worshipv2',
  },
  {
    name: 'phone-hadith',
    label: 'Hadith Collections',
    actions: [
      { type: 'clickNav', id: 'hadith' },
    ],
    waitFor: '.hadithv2-feature',
  },
  {
    name: 'phone-qibla',
    label: 'Qibla Compass',
    actions: [
      { type: 'clickMenu' },
      { type: 'wait', ms: 800 },
      { type: 'clickDrawerRow', text: 'Qibla' },
    ],
    waitFor: '.qibla-compass',
  },
  {
    name: 'phone-journal',
    label: 'Journal',
    actions: [
      { type: 'click', selector: 'button[class*="homev2-fold-card"]', match: 'Journal' },
    ],
    waitFor: '.ritual-page',
  },
];

// ── Helpers ─────────────────────────────────────────────────────────────

async function setupPage(context) {
  const page = await context.newPage();

  // Inject localStorage before page loads
  await page.addInitScript((data) => {
    for (const [k, v] of Object.entries(data)) {
      localStorage.setItem(k, v);
    }
  }, LOCAL_STORAGE);

  return page;
}

async function waitForReady(page, selector) {
  try {
    await page.waitForSelector(selector, { state: 'visible', timeout: 12000 });
  } catch {
    console.warn(`\n    ⚠ Selector "${selector}" not found within 12s`);
  }
  // Wait for fonts
  await page.evaluate(() => document.fonts.ready);
  // Wait for stagger animations
  await page.waitForTimeout(2000);
  try {
    await page.waitForLoadState('networkidle', { timeout: 5000 });
  } catch {
    // networkidle may not fire
  }
}

async function performActions(page, actions) {
  for (const action of actions) {
    switch (action.type) {
      case 'click': {
        const els = await page.$$(action.selector);
        let clicked = false;
        for (const el of els) {
          const text = await el.textContent();
          if (text.includes(action.match)) {
            await el.click();
            clicked = true;
            break;
          }
        }
        if (!clicked) console.warn(`\n    ⚠ No element matching "${action.match}" found in ${action.selector}`);
        await page.waitForTimeout(500);
        break;
      }
      case 'clickNav': {
        // Try by ID first, then by text content
        let navItem = await page.$(`.bottom-nav .nav-item#${action.id}`);
        if (!navItem) {
          // Try matching the nav item by text
          const items = await page.$$('.bottom-nav .nav-item');
          for (const item of items) {
            const text = (await item.textContent()).toLowerCase();
            if (text.includes(action.id)) {
              navItem = item;
              break;
            }
          }
        }
        if (navItem) {
          await navItem.click();
        } else {
          console.warn(`\n    ⚠ Nav item "${action.id}" not found`);
        }
        await page.waitForTimeout(500);
        break;
      }
      case 'clickText': {
        const cards = await page.$$(action.selector);
        let clicked = false;
        for (const card of cards) {
          const text = await card.textContent();
          if (text.includes(action.text)) {
            await card.click();
            clicked = true;
            break;
          }
        }
        if (!clicked) console.warn(`\n    ⚠ No card matching "${action.text}" found in ${action.selector}`);
        await page.waitForTimeout(500);
        break;
      }
      case 'clickMenu': {
        // On home page, look for hamburger in header area
        let btn = await page.$('.homev2-header button');
        if (!btn) btn = await page.$('button.app-shell-menu');
        if (!btn) {
          // Try any button with hamburger icon
          const buttons = await page.$$('button');
          for (const b of buttons) {
            const html = await b.innerHTML();
            if (html.includes('hamburger') || html.includes('menu') || html.includes('M3 6h18')) {
              btn = b;
              break;
            }
          }
        }
        if (btn) {
          await btn.click();
        } else {
          console.warn(`\n    ⚠ Menu button not found`);
        }
        break;
      }
      case 'clickDrawerRow': {
        await page.waitForSelector('.appdrawer.open, .appdrawer-overlay.open', { timeout: 3000 }).catch(() => {});
        const rows = await page.$$('.appdrawer-row, button.appdrawer-row');
        let clicked = false;
        for (const row of rows) {
          const text = await row.textContent();
          if (text.includes(action.text)) {
            await row.click();
            clicked = true;
            break;
          }
        }
        if (!clicked) console.warn(`\n    ⚠ Drawer row "${action.text}" not found`);
        await page.waitForTimeout(500);
        break;
      }
      case 'wait': {
        await page.waitForTimeout(action.ms);
        break;
      }
    }
  }
}

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n\u{1F4F8} MuslimOS Screenshot Generator\n');

  // 1. Build
  console.log('\u{1F528} Building app\u2026');
  await build({ root: ROOT, logLevel: 'warn' });

  // 2. Start preview server (Vite programmatic API)
  console.log('\u{1F310} Starting preview server on port', PORT, '\u2026');
  const server = await preview({
    root: ROOT,
    preview: { port: PORT, strictPort: true },
    logLevel: 'warn',
  });
  const BASE = server.resolvedUrls.local[0] || `http://localhost:${PORT}`;
  console.log('   Serving at', BASE);

  try {
    // 3. Launch browser
    const browser = await chromium.launch({ headless: true });

    // Phone context (3x DPR for 1080x2400)
    const phoneContext = await browser.newContext({
      viewport: { width: 360, height: 800 },
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      geolocation: { latitude: 31.5204, longitude: 74.3587 },
      permissions: ['geolocation'],
      timezoneId: 'Asia/Karachi',
      locale: 'en-US',
    });

    console.log('');

    // 4. Capture each screenshot
    for (const shot of SCREENSHOTS) {
      process.stdout.write(`  \u{1F4F7} ${shot.label}\u2026`);

      const page = await setupPage(phoneContext);

      // Navigate
      await page.goto(BASE, { waitUntil: 'load', timeout: 15000 });

      // Wait for initial render
      await page.waitForSelector('.app', { state: 'visible', timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(1500);

      // Perform navigation actions
      await performActions(page, shot.actions);

      // Wait for target content
      await waitForReady(page, shot.waitFor);

      // Capture
      const outPath = resolve(OUT, `${shot.name}.png`);
      await page.screenshot({ path: outPath, fullPage: false });
      console.log(' \u2713');

      await page.close();
    }

    // 5. Feature graphic (separate context, 1x DPR)
    process.stdout.write('  \u{1F3A8} Feature Graphic\u2026');
    const fgContext = await browser.newContext({
      viewport: { width: 1024, height: 500 },
      deviceScaleFactor: 1,
    });
    const fgPage = await fgContext.newPage();
    const fgHtml = resolve(__dirname, 'feature-graphic.html');
    await fgPage.goto(`file://${fgHtml}`, { waitUntil: 'networkidle' });
    await fgPage.evaluate(() => document.fonts.ready);
    await fgPage.waitForTimeout(1500);
    await fgPage.screenshot({
      path: resolve(OUT, 'feature-graphic.png'),
      fullPage: false,
    });
    console.log(' \u2713');
    await fgPage.close();
    await fgContext.close();

    await phoneContext.close();
    await browser.close();

    console.log('\n\u2705 Done! 9 images saved to playstore/assets/');
    console.log('   Phone screenshots: 1080\u00d72400');
    console.log('   Feature graphic:   1024\u00d7500\n');
  } finally {
    server.httpServer.close();
  }
}

main().catch((err) => {
  console.error('\u274c Error:', err.message);
  process.exit(1);
});
