/**
 * Generate MuslimOS app icon + splash screen
 * Emerald/gold theme with crescent + geometric pattern
 */
import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const EMERALD_DARK = '#064A37';
const EMERALD = '#0B6B4F';
const EMERALD_LIGHT = '#0F8C6A';
const GOLD = '#C9A84C';
const GOLD_LIGHT = '#E8D5A8';
const CREAM = '#FBF8F1';

// ═══════════════════════════════════════════════
// ICON DRAWING
// ═══════════════════════════════════════════════

// ═══════════════════════════════════════════════
// MOSQUE SILHOUETTE HELPER
// ═══════════════════════════════════════════════

function drawMosque(ctx, cx, cy, scale) {
  const s = scale;
  const gold = ctx.createLinearGradient(cx - s * 0.4, cy - s * 0.5, cx + s * 0.4, cy + s * 0.3);
  gold.addColorStop(0, GOLD_LIGHT);
  gold.addColorStop(0.5, GOLD);
  gold.addColorStop(1, '#B5933D');

  ctx.fillStyle = gold;
  ctx.strokeStyle = 'rgba(201,168,76,0.6)';
  ctx.lineWidth = s * 0.008;

  // Main dome (large center)
  ctx.beginPath();
  ctx.arc(cx, cy - s * 0.06, s * 0.28, Math.PI, 0);
  ctx.fill();

  // Dome base / body rectangle
  ctx.fillRect(cx - s * 0.28, cy - s * 0.06, s * 0.56, s * 0.32);

  // Central minaret (tall, thin tower on top of dome)
  const mW = s * 0.038;
  const mH = s * 0.28;
  ctx.fillRect(cx - mW / 2, cy - s * 0.06 - mH, mW, mH);
  // Minaret cap — small dome
  ctx.beginPath();
  ctx.arc(cx, cy - s * 0.06 - mH, mW * 0.7, Math.PI, 0);
  ctx.fill();

  // Crescent on top of central minaret
  const cR = s * 0.035;
  const cY = cy - s * 0.06 - mH - mW * 0.7 - cR * 0.9;
  ctx.beginPath();
  ctx.arc(cx, cY, cR, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(cx + cR * 0.35, cY - cR * 0.15, cR * 0.72, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Left minaret
  const lmX = cx - s * 0.32;
  const lmW = s * 0.032;
  const lmH = s * 0.22;
  ctx.fillStyle = gold;
  ctx.fillRect(lmX - lmW / 2, cy + s * 0.26 - lmH, lmW, lmH);
  ctx.beginPath();
  ctx.arc(lmX, cy + s * 0.26 - lmH, lmW * 0.65, Math.PI, 0);
  ctx.fill();
  // Left minaret crescent
  const lcR = s * 0.022;
  const lcY = cy + s * 0.26 - lmH - lmW * 0.65 - lcR * 0.8;
  ctx.beginPath();
  ctx.arc(lmX, lcY, lcR, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(lmX + lcR * 0.35, lcY - lcR * 0.15, lcR * 0.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Right minaret (mirror)
  const rmX = cx + s * 0.32;
  ctx.fillStyle = gold;
  ctx.fillRect(rmX - lmW / 2, cy + s * 0.26 - lmH, lmW, lmH);
  ctx.beginPath();
  ctx.arc(rmX, cy + s * 0.26 - lmH, lmW * 0.65, Math.PI, 0);
  ctx.fill();
  const rcY = cy + s * 0.26 - lmH - lmW * 0.65 - lcR * 0.8;
  ctx.beginPath();
  ctx.arc(rmX, rcY, lcR, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(rmX + lcR * 0.35, rcY - lcR * 0.15, lcR * 0.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Door arch (cutout at bottom center)
  ctx.fillStyle = gold;
  const doorW = s * 0.09;
  const doorH = s * 0.14;
  const doorY = cy + s * 0.26;
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(cx, doorY - doorH + doorW, doorW, Math.PI, 0);
  ctx.lineTo(cx + doorW, doorY);
  ctx.lineTo(cx - doorW, doorY);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Window arches on sides
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  const winR = s * 0.04;
  // Left windows
  ctx.beginPath();
  ctx.arc(cx - s * 0.15, cy + s * 0.08, winR, Math.PI, 0);
  ctx.lineTo(cx - s * 0.15 + winR, cy + s * 0.16);
  ctx.lineTo(cx - s * 0.15 - winR, cy + s * 0.16);
  ctx.closePath();
  ctx.fill();
  // Right windows
  ctx.beginPath();
  ctx.arc(cx + s * 0.15, cy + s * 0.08, winR, Math.PI, 0);
  ctx.lineTo(cx + s * 0.15 + winR, cy + s * 0.16);
  ctx.lineTo(cx + s * 0.15 - winR, cy + s * 0.16);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawIcon(size, padding = 0) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const s = size;
  const cx = s / 2;
  const cy = s / 2;

  // Background — rich emerald gradient
  const bg = ctx.createRadialGradient(cx, cy * 0.7, 0, cx, cy, s * 0.7);
  bg.addColorStop(0, '#0A7B5C');
  bg.addColorStop(0.6, EMERALD);
  bg.addColorStop(1, EMERALD_DARK);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, s, s);

  // Subtle geometric pattern — 8-point stars
  ctx.strokeStyle = 'rgba(201,168,76,0.07)';
  ctx.lineWidth = s * 0.003;
  const starSize = s * 0.09;
  for (let x = -starSize; x < s + starSize; x += starSize * 2) {
    for (let y = -starSize; y < s + starSize; y += starSize * 2) {
      const scx = x + starSize;
      const scy = y + starSize;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        const r = i % 2 === 0 ? starSize * 0.8 : starSize * 0.35;
        const px = scx + Math.cos(a) * r;
        const py = scy + Math.sin(a) * r;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }

  // Inner glow
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, s * 0.5);
  glow.addColorStop(0, 'rgba(201,168,76,0.06)');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, s, s);

  // Mosque — centered, well-sized
  drawMosque(ctx, cx, cy * 1.05, s * 0.82);

  return canvas;
}

function drawIconForeground(size) {
  // Adaptive icon foreground — 108dp with 72dp visible, 66dp safe zone
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;

  // Transparent background
  ctx.clearRect(0, 0, size, size);

  // Mosque — centered in safe zone
  drawMosque(ctx, cx, cy * 1.05, size * 0.5);

  return canvas;
}

function drawIconBackground(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;

  // Rich emerald gradient
  const bg = ctx.createRadialGradient(cx, cy * 0.7, 0, cx, cy, size * 0.7);
  bg.addColorStop(0, '#0A7B5C');
  bg.addColorStop(0.6, EMERALD);
  bg.addColorStop(1, EMERALD_DARK);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  // Geometric pattern
  ctx.strokeStyle = 'rgba(201,168,76,0.06)';
  ctx.lineWidth = size * 0.003;
  const starSize = size * 0.08;
  for (let x = -starSize; x < size + starSize; x += starSize * 2) {
    for (let y = -starSize; y < size + starSize; y += starSize * 2) {
      const scx = x + starSize;
      const scy = y + starSize;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        const r = i % 2 === 0 ? starSize * 0.8 : starSize * 0.35;
        ctx.lineTo(scx + Math.cos(a) * r, scy + Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }

  // Inner glow
  const glow = ctx.createRadialGradient(cx, cy * 0.85, 0, cx, cy, size * 0.5);
  glow.addColorStop(0, 'rgba(201,168,76,0.06)');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  return canvas;
}

// ═══════════════════════════════════════════════
// SPLASH SCREEN
// ═══════════════════════════════════════════════

function drawSplash(w, h) {
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');
  const cx = w / 2;
  const cy = h / 2;
  const s = Math.min(w, h);

  // Full emerald gradient
  const bg = ctx.createRadialGradient(cx, cy * 0.6, 0, cx, cy, Math.max(w, h) * 0.7);
  bg.addColorStop(0, '#0D8A64');
  bg.addColorStop(0.5, EMERALD);
  bg.addColorStop(1, EMERALD_DARK);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Geometric pattern overlay
  ctx.strokeStyle = 'rgba(201,168,76,0.04)';
  ctx.lineWidth = 1;
  const ps = 60;
  for (let x = 0; x < w; x += ps) {
    for (let y = 0; y < h; y += ps) {
      ctx.beginPath();
      ctx.moveTo(x + ps / 2, y);
      ctx.lineTo(x + ps, y + ps / 4);
      ctx.lineTo(x + ps, y + ps * 3 / 4);
      ctx.lineTo(x + ps / 2, y + ps);
      ctx.lineTo(x, y + ps * 3 / 4);
      ctx.lineTo(x, y + ps / 4);
      ctx.closePath();
      ctx.stroke();
    }
  }

  // Center glow
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, s * 0.4);
  glow.addColorStop(0, 'rgba(201,168,76,0.08)');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // Mosque
  drawMosque(ctx, cx, cy - s * 0.04, s * 0.32);

  // App name
  const fontSize = s * 0.065;
  ctx.font = `700 ${fontSize}px "Helvetica Neue", "Arial", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = CREAM;
  ctx.fillText('MuslimOS', cx, cy + s * 0.16);

  // Tagline
  ctx.font = `400 ${s * 0.022}px "Helvetica Neue", "Arial", sans-serif`;
  ctx.fillStyle = 'rgba(251,248,241,0.5)';
  ctx.fillText('Your Daily Islamic Companion', cx, cy + s * 0.21);

  return canvas;
}

// ═══════════════════════════════════════════════
// GENERATE ALL FILES
// ═══════════════════════════════════════════════

const ROOT = join(process.cwd(), 'android/app/src/main/res');

function save(canvas, path) {
  const buf = canvas.toBuffer('image/png');
  writeFileSync(path, buf);
  console.log(`  ${path} (${(buf.length / 1024).toFixed(1)}KB)`);
}

console.log('Generating MuslimOS icons...\n');

// Legacy icons (all densities)
const ICON_SIZES = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

for (const [dir, size] of Object.entries(ICON_SIZES)) {
  const p = join(ROOT, dir);
  mkdirSync(p, { recursive: true });
  save(drawIcon(size), join(p, 'ic_launcher.png'));
  // Round icon — same but clipped to circle
  const round = drawIcon(size);
  const rctx = round.getContext('2d');
  rctx.globalCompositeOperation = 'destination-in';
  rctx.beginPath();
  rctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  rctx.fill();
  save(round, join(p, 'ic_launcher_round.png'));
}

// Adaptive icon layers (foreground + background)
const ADAPTIVE_SIZES = {
  'mipmap-mdpi': 108,
  'mipmap-hdpi': 162,
  'mipmap-xhdpi': 216,
  'mipmap-xxhdpi': 324,
  'mipmap-xxxhdpi': 432,
};

for (const [dir, size] of Object.entries(ADAPTIVE_SIZES)) {
  const p = join(ROOT, dir);
  save(drawIconForeground(size), join(p, 'ic_launcher_foreground.png'));
  save(drawIconBackground(size), join(p, 'ic_launcher_background.png'));
}

// Play Store high-res icon (512x512)
save(drawIcon(512), join(process.cwd(), 'playstore/assets/icon-512.png'));

console.log('\nGenerating splash screens...\n');

// Portrait splash screens
const SPLASH_PORT = {
  'drawable-port-mdpi': [320, 480],
  'drawable-port-hdpi': [480, 800],
  'drawable-port-xhdpi': [720, 1280],
  'drawable-port-xxhdpi': [960, 1600],
  'drawable-port-xxxhdpi': [1280, 1920],
};

for (const [dir, [w, h]] of Object.entries(SPLASH_PORT)) {
  const p = join(ROOT, dir);
  mkdirSync(p, { recursive: true });
  save(drawSplash(w, h), join(p, 'splash.png'));
}

// Landscape splash screens
const SPLASH_LAND = {
  'drawable-land-mdpi': [480, 320],
  'drawable-land-hdpi': [800, 480],
  'drawable-land-xhdpi': [1280, 720],
  'drawable-land-xxhdpi': [1600, 960],
  'drawable-land-xxxhdpi': [1920, 1280],
};

for (const [dir, [w, h]] of Object.entries(SPLASH_LAND)) {
  const p = join(ROOT, dir);
  mkdirSync(p, { recursive: true });
  save(drawSplash(w, h), join(p, 'splash.png'));
}

console.log('\nDone! All icons and splash screens generated.');
