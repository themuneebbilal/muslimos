// Canvas-based share image generator (1080x1080)
// 8 rotating calligraphy patterns, vertically centered, corner ornaments
const W = 1080;
const H = 1080;
const PAD = 80;
const CONTENT_W = W - PAD * 2 - 40;

function loadFont(family, url) {
  if (document.fonts.check(`16px "${family}"`)) return Promise.resolve();
  const face = new FontFace(family, `url(${url})`);
  return face.load().then(f => document.fonts.add(f));
}

function wrapText(ctx, text, maxWidth, font) {
  ctx.font = font;
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function wrapRTL(ctx, text, maxWidth, font) {
  ctx.font = font;
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${word} ${line}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// ═══════════════════════════════════════════════
// 8 GEOMETRIC PATTERN FUNCTIONS
// ═══════════════════════════════════════════════

function drawArabesque(ctx) {
  ctx.strokeStyle = 'rgba(201,168,76,0.05)';
  ctx.lineWidth = 0.8;
  for (let x = -30; x < W + 30; x += 80) {
    for (let y = -30; y < H + 30; y += 80) {
      ctx.beginPath();
      ctx.arc(x, y, 28, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + 40, y + 40, 28, 0, Math.PI * 2);
      ctx.stroke();
      // Petal connectors
      for (let a = 0; a < 4; a++) {
        const angle = (a * Math.PI) / 2;
        ctx.beginPath();
        ctx.ellipse(x + Math.cos(angle) * 20, y + Math.sin(angle) * 20, 12, 5, angle, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }
}

function drawEightPointStars(ctx) {
  ctx.strokeStyle = 'rgba(201,168,76,0.05)';
  ctx.lineWidth = 0.6;
  const size = 50;
  for (let x = 0; x < W; x += size * 2) {
    for (let y = 0; y < H; y += size * 2) {
      const cx = x + size;
      const cy = y + size;
      // 8-point star
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        const r = i % 2 === 0 ? size * 0.8 : size * 0.35;
        const px = cx + Math.cos(a) * r;
        const py = cy + Math.sin(a) * r;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }
}

function drawInterlockingCircles(ctx) {
  ctx.strokeStyle = 'rgba(201,168,76,0.04)';
  ctx.lineWidth = 0.7;
  const r = 40;
  for (let x = -r; x < W + r; x += r * 1.5) {
    for (let y = -r; y < H + r; y += r * 1.5) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + r * 0.75, y + r * 0.75, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

function drawZellige(ctx) {
  ctx.strokeStyle = 'rgba(201,168,76,0.05)';
  ctx.lineWidth = 0.5;
  const s = 44;
  for (let x = 0; x < W; x += s) {
    for (let y = 0; y < H; y += s) {
      // Diamond
      ctx.beginPath();
      ctx.moveTo(x + s / 2, y);
      ctx.lineTo(x + s, y + s / 2);
      ctx.lineTo(x + s / 2, y + s);
      ctx.lineTo(x, y + s / 2);
      ctx.closePath();
      ctx.stroke();
      // Inner diamond
      ctx.beginPath();
      ctx.moveTo(x + s / 2, y + s * 0.2);
      ctx.lineTo(x + s * 0.8, y + s / 2);
      ctx.lineTo(x + s / 2, y + s * 0.8);
      ctx.lineTo(x + s * 0.2, y + s / 2);
      ctx.closePath();
      ctx.stroke();
    }
  }
}

function drawRosette(ctx) {
  ctx.strokeStyle = 'rgba(201,168,76,0.045)';
  ctx.lineWidth = 0.6;
  const spacing = 100;
  for (let x = 0; x < W; x += spacing) {
    for (let y = 0; y < H; y += spacing) {
      const cx = x + spacing / 2;
      const cy = y + spacing / 2;
      // 6-petal rosette
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        ctx.beginPath();
        ctx.ellipse(cx + Math.cos(a) * 18, cy + Math.sin(a) * 18, 18, 9, a, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

function drawDiamondLattice(ctx) {
  ctx.strokeStyle = 'rgba(201,168,76,0.05)';
  ctx.lineWidth = 0.5;
  const s = 60;
  for (let x = -s; x < W + s; x += s) {
    for (let y = -s; y < H + s; y += s) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + s / 2, y + s / 2);
      ctx.lineTo(x, y + s);
      ctx.moveTo(x, y);
      ctx.lineTo(x - s / 2, y + s / 2);
      ctx.lineTo(x, y + s);
      ctx.stroke();
    }
  }
}

function drawMuqarnas(ctx) {
  ctx.strokeStyle = 'rgba(201,168,76,0.04)';
  ctx.lineWidth = 0.6;
  const s = 70;
  for (let x = 0; x < W; x += s) {
    for (let y = 0; y < H; y += s) {
      // Scalloped arch shapes
      ctx.beginPath();
      ctx.arc(x + s / 2, y + s, s * 0.4, Math.PI, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y + s / 2, s * 0.3, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + s, y + s / 2, s * 0.3, Math.PI / 2, -Math.PI / 2);
      ctx.stroke();
    }
  }
}

function drawRefinedHexagons(ctx) {
  ctx.strokeStyle = 'rgba(201,168,76,0.05)';
  ctx.lineWidth = 0.5;
  for (let x = 0; x < W; x += 52) {
    for (let y = 0; y < H; y += 52) {
      ctx.beginPath();
      ctx.moveTo(x + 26, y);
      ctx.lineTo(x + 52, y + 13);
      ctx.lineTo(x + 52, y + 39);
      ctx.lineTo(x + 26, y + 52);
      ctx.lineTo(x, y + 39);
      ctx.lineTo(x, y + 13);
      ctx.closePath();
      ctx.stroke();
      // Inner hex
      ctx.beginPath();
      ctx.moveTo(x + 26, y + 10);
      ctx.lineTo(x + 42, y + 18);
      ctx.lineTo(x + 42, y + 34);
      ctx.lineTo(x + 26, y + 42);
      ctx.lineTo(x + 10, y + 34);
      ctx.lineTo(x + 10, y + 18);
      ctx.closePath();
      ctx.stroke();
    }
  }
}

const PATTERNS = [
  drawArabesque,
  drawEightPointStars,
  drawInterlockingCircles,
  drawZellige,
  drawRosette,
  drawDiamondLattice,
  drawMuqarnas,
  drawRefinedHexagons,
];

// ═══════════════════════════════════════════════
// SHARED DRAWING HELPERS
// ═══════════════════════════════════════════════

function drawImageBase(ctx) {
  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#064A37');
  grad.addColorStop(1, '#0A2E22');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Random pattern
  const patternFn = PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
  patternFn(ctx);

  // Corner ornament border — L-shaped corners + thin connecting lines
  const c = 40; // corner inset
  const arm = 60; // arm length
  const gold = 'rgba(201,168,76,0.35)';
  const goldThin = 'rgba(201,168,76,0.15)';
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = gold;

  // Top-left corner
  ctx.beginPath();
  ctx.moveTo(c, c + arm);
  ctx.lineTo(c, c);
  ctx.lineTo(c + arm, c);
  ctx.stroke();
  // Top-right corner
  ctx.beginPath();
  ctx.moveTo(W - c - arm, c);
  ctx.lineTo(W - c, c);
  ctx.lineTo(W - c, c + arm);
  ctx.stroke();
  // Bottom-right corner
  ctx.beginPath();
  ctx.moveTo(W - c, H - c - arm);
  ctx.lineTo(W - c, H - c);
  ctx.lineTo(W - c - arm, H - c);
  ctx.stroke();
  // Bottom-left corner
  ctx.beginPath();
  ctx.moveTo(c + arm, H - c);
  ctx.lineTo(c, H - c);
  ctx.lineTo(c, H - c - arm);
  ctx.stroke();

  // Thin connecting lines between corners
  ctx.lineWidth = 0.8;
  ctx.strokeStyle = goldThin;
  // Top
  ctx.beginPath();
  ctx.moveTo(c + arm + 10, c);
  ctx.lineTo(W - c - arm - 10, c);
  ctx.stroke();
  // Bottom
  ctx.beginPath();
  ctx.moveTo(c + arm + 10, H - c);
  ctx.lineTo(W - c - arm - 10, H - c);
  ctx.stroke();
  // Left
  ctx.beginPath();
  ctx.moveTo(c, c + arm + 10);
  ctx.lineTo(c, H - c - arm - 10);
  ctx.stroke();
  // Right
  ctx.beginPath();
  ctx.moveTo(W - c, c + arm + 10);
  ctx.lineTo(W - c, H - c - arm - 10);
  ctx.stroke();
}

function drawDecorativeBrackets(ctx, topY, bottomY) {
  const gold = 'rgba(201,168,76,0.4)';
  ctx.strokeStyle = gold;
  ctx.lineWidth = 1.5;
  const bracketW = 24;
  const bracketH = (bottomY - topY) / 2;
  const cx = W / 2;
  const leftX = cx - CONTENT_W / 2 - 20;
  const rightX = cx + CONTENT_W / 2 + 20;

  // Left bracket ❲
  ctx.beginPath();
  ctx.moveTo(leftX + bracketW, topY);
  ctx.quadraticCurveTo(leftX, topY, leftX, topY + bracketH);
  ctx.quadraticCurveTo(leftX, bottomY, leftX + bracketW, bottomY);
  ctx.stroke();

  // Right bracket ❳
  ctx.beginPath();
  ctx.moveTo(rightX - bracketW, topY);
  ctx.quadraticCurveTo(rightX, topY, rightX, topY + bracketH);
  ctx.quadraticCurveTo(rightX, bottomY, rightX - bracketW, bottomY);
  ctx.stroke();
}

function measureContentHeight(ctx, arabic, translation, reference, lang) {
  const arFont = `44px "Amiri", serif`;
  const trFont = lang === 'ur' ? `28px "Amiri", serif` : `24px "DM Sans", sans-serif`;
  const arLineH = 82;
  const trLineH = lang === 'ur' ? 56 : 42;

  const arLines = wrapRTL(ctx, arabic, CONTENT_W, arFont);
  const trText = lang === 'ur' ? translation : `"${translation}"`;
  const trLines = lang === 'ur' ? wrapRTL(ctx, trText, CONTENT_W, trFont) : wrapText(ctx, trText, CONTENT_W, trFont);

  let h = 0;
  h += arLines.length * arLineH;      // Arabic
  h += 30;                              // Divider gap
  h += trLines.length * trLineH;      // Translation
  h += 30;                              // Ref gap
  h += 24;                              // Reference line

  return { totalHeight: h, arLines, trLines, arLineH, trLineH };
}

function drawContent(ctx, arabic, translation, reference, lang, startY, arLines, trLines, arLineH, trLineH) {
  let y = startY;

  // Arabic text
  const arFont = `44px "Amiri", serif`;
  ctx.fillStyle = '#E8E2D6';
  ctx.textAlign = 'center';
  ctx.direction = 'rtl';
  ctx.font = arFont;

  const arBlockTop = y;
  for (const line of arLines) {
    ctx.fillText(line, W / 2, y + 44);
    y += arLineH;
  }
  const arBlockBottom = y;

  // Decorative brackets around Arabic
  drawDecorativeBrackets(ctx, arBlockTop - 10, arBlockBottom + 4);

  // Divider
  y += 10;
  ctx.strokeStyle = 'rgba(201,168,76,0.25)';
  ctx.lineWidth = 1;
  // Diamond center
  const dcy = y + 5;
  ctx.fillStyle = 'rgba(201,168,76,0.5)';
  ctx.beginPath();
  ctx.moveTo(W / 2, dcy - 5);
  ctx.lineTo(W / 2 + 5, dcy);
  ctx.lineTo(W / 2, dcy + 5);
  ctx.lineTo(W / 2 - 5, dcy);
  ctx.closePath();
  ctx.fill();
  // Lines from diamond
  ctx.beginPath();
  ctx.moveTo(W / 2 - 80, dcy);
  ctx.lineTo(W / 2 - 12, dcy);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(W / 2 + 12, dcy);
  ctx.lineTo(W / 2 + 80, dcy);
  ctx.stroke();
  y += 20;

  // Translation text
  ctx.direction = lang === 'ur' ? 'rtl' : 'ltr';
  const trFont = lang === 'ur' ? `28px "Amiri", serif` : `24px "DM Sans", sans-serif`;
  ctx.fillStyle = 'rgba(232,226,214,0.72)';
  ctx.textAlign = 'center';
  ctx.font = trFont;

  for (const line of trLines) {
    ctx.fillText(line, W / 2, y + 24);
    y += trLineH;
  }

  // Reference
  y += 14;
  ctx.font = '18px "DM Sans", sans-serif';
  ctx.fillStyle = 'rgba(201,168,76,0.7)';
  ctx.textAlign = 'center';
  ctx.direction = 'ltr';
  ctx.fillText(`— ${reference}`, W / 2, y + 18);
  y += 30;

  return y;
}

function drawBranding(ctx) {
  ctx.font = '14px "DM Sans", sans-serif';
  ctx.fillStyle = 'rgba(201,168,76,0.35)';
  ctx.textAlign = 'center';
  ctx.direction = 'ltr';
  ctx.fillText('MuslimOS', W / 2, H - 55);
}

// ═══════════════════════════════════════════════
// QURAN IMAGE
// ═══════════════════════════════════════════════

export async function generateAyahImage(arabic, translation, reference, lang = 'en') {
  await Promise.all([
    loadFont('Amiri', 'https://fonts.gstatic.com/s/amiri/v27/J7aRnpd8CGxBHqUp.woff2'),
    loadFont('DM Sans', 'https://fonts.gstatic.com/s/dmsans/v15/rP2Hp2ywxg089UriCZOIHTWEBlw.woff2'),
  ]).catch(() => {});

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  drawImageBase(ctx);

  // Measure and vertically center
  const m = measureContentHeight(ctx, arabic, translation, reference, lang);
  const availableH = H - 140; // top 70 + bottom 70 reserved
  const startY = Math.max(90, 70 + (availableH - m.totalHeight) / 2);

  drawContent(ctx, arabic, translation, reference, lang, startY, m.arLines, m.trLines, m.arLineH, m.trLineH);
  drawBranding(ctx);

  return canvas;
}

export async function shareAyahAsImage(arabic, translation, reference, lang = 'en') {
  const canvas = await generateAyahImage(arabic, translation, reference, lang);
  return shareCanvas(canvas, `quran-${reference.replace(/[^a-zA-Z0-9]/g, '-')}.png`, reference);
}

// ═══════════════════════════════════════════════
// HADITH IMAGE
// ═══════════════════════════════════════════════

export async function generateHadithImage(arabic, translation, reference, lang = 'en') {
  await Promise.all([
    loadFont('Amiri', 'https://fonts.gstatic.com/s/amiri/v27/J7aRnpd8CGxBHqUp.woff2'),
    loadFont('DM Sans', 'https://fonts.gstatic.com/s/dmsans/v15/rP2Hp2ywxg089UriCZOIHTWEBlw.woff2'),
  ]).catch(() => {});

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  drawImageBase(ctx);

  // Measure and vertically center
  const m = measureContentHeight(ctx, arabic, translation, reference, lang);
  const availableH = H - 140;
  const startY = Math.max(90, 70 + (availableH - m.totalHeight) / 2);

  drawContent(ctx, arabic, translation, reference, lang, startY, m.arLines, m.trLines, m.arLineH, m.trLineH);
  drawBranding(ctx);

  return canvas;
}

export async function shareHadithAsImage(arabic, translation, reference, lang = 'en') {
  const canvas = await generateHadithImage(arabic, translation, reference, lang);
  return shareCanvas(canvas, `hadith-${reference.replace(/[^a-zA-Z0-9]/g, '-')}.png`, reference);
}

// ═══════════════════════════════════════════════
// SHARED SHARE/DOWNLOAD HELPER
// ═══════════════════════════════════════════════

function shareCanvas(canvas, filename, title) {
  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) { resolve(false); return; }

      const file = new File([blob], filename, { type: 'image/png' });

      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title });
          resolve(true);
          return;
        } catch { /* fall through to download */ }
      }

      // Fallback: download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      resolve(true);
    }, 'image/png');
  });
}
