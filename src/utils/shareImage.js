// Canvas-based ayah image generator (1080x1080)
const W = 1080;
const H = 1080;
const PAD = 80;

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

export async function generateAyahImage(arabic, translation, reference, lang = 'en') {
  // Ensure fonts are available (they should already be loaded by the page)
  await Promise.all([
    loadFont('Amiri', 'https://fonts.gstatic.com/s/amiri/v27/J7aRnpd8CGxBHqUp.woff2'),
    loadFont('DM Sans', 'https://fonts.gstatic.com/s/dmsans/v15/rP2Hp2ywxg089UriCZOIHTWEBlw.woff2'),
  ]).catch(() => {}); // Best-effort font loading

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Background - deep emerald gradient
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#064A37');
  grad.addColorStop(1, '#0A2E22');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Subtle geometric pattern overlay
  ctx.strokeStyle = 'rgba(201,168,76,0.06)';
  ctx.lineWidth = 0.5;
  for (let x = 0; x < W; x += 60) {
    for (let y = 0; y < H; y += 60) {
      ctx.beginPath();
      ctx.moveTo(x + 30, y);
      ctx.lineTo(x + 60, y + 15);
      ctx.lineTo(x + 60, y + 45);
      ctx.lineTo(x + 30, y + 60);
      ctx.lineTo(x, y + 45);
      ctx.lineTo(x, y + 15);
      ctx.closePath();
      ctx.stroke();
    }
  }

  // Gold decorative border
  ctx.strokeStyle = 'rgba(201,168,76,0.3)';
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 40, W - 80, H - 80);
  ctx.strokeStyle = 'rgba(201,168,76,0.15)';
  ctx.lineWidth = 1;
  ctx.strokeRect(50, 50, W - 100, H - 100);

  // Gold diamond ornament at top
  const cx = W / 2, oy = 90;
  ctx.fillStyle = 'rgba(201,168,76,0.6)';
  ctx.beginPath();
  ctx.moveTo(cx, oy - 8);
  ctx.lineTo(cx + 8, oy);
  ctx.lineTo(cx, oy + 8);
  ctx.lineTo(cx - 8, oy);
  ctx.closePath();
  ctx.fill();

  // Gold lines from diamond
  ctx.strokeStyle = 'rgba(201,168,76,0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD + 20, oy);
  ctx.lineTo(cx - 20, oy);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 20, oy);
  ctx.lineTo(W - PAD - 20, oy);
  ctx.stroke();

  const maxW = W - PAD * 2 - 40;
  let currentY = 140;

  // Arabic text
  const arFont = `36px "Amiri", serif`;
  ctx.fillStyle = '#E8E2D6';
  ctx.textAlign = 'center';
  ctx.direction = 'rtl';

  const arLines = wrapRTL(ctx, arabic, maxW, arFont);
  ctx.font = arFont;
  const arLineH = 72;
  for (const line of arLines) {
    ctx.fillText(line, W / 2, currentY + 36);
    currentY += arLineH;
  }

  // Divider
  currentY += 20;
  ctx.strokeStyle = 'rgba(201,168,76,0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 100, currentY);
  ctx.lineTo(W / 2 + 100, currentY);
  ctx.stroke();
  currentY += 30;

  // Translation text
  ctx.direction = lang === 'ur' ? 'rtl' : 'ltr';
  const trFont = lang === 'ur' ? `26px "Amiri", serif` : `22px "DM Sans", sans-serif`;
  ctx.fillStyle = 'rgba(232,226,214,0.7)';
  ctx.textAlign = 'center';

  const trLines = lang === 'ur' ? wrapRTL(ctx, translation, maxW, trFont) : wrapText(ctx, `"${translation}"`, maxW, trFont);
  ctx.font = trFont;
  const trLineH = lang === 'ur' ? 52 : 36;
  for (const line of trLines) {
    ctx.fillText(line, W / 2, currentY + 22);
    currentY += trLineH;
  }

  // Reference
  currentY += 20;
  ctx.font = '18px "DM Sans", sans-serif';
  ctx.fillStyle = 'rgba(201,168,76,0.7)';
  ctx.textAlign = 'center';
  ctx.direction = 'ltr';
  ctx.fillText(`— ${reference}`, W / 2, currentY + 18);

  // Bottom ornament
  const by = H - 90;
  ctx.fillStyle = 'rgba(201,168,76,0.6)';
  ctx.beginPath();
  ctx.moveTo(cx, by - 8);
  ctx.lineTo(cx + 8, by);
  ctx.lineTo(cx, by + 8);
  ctx.lineTo(cx - 8, by);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(201,168,76,0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD + 20, by);
  ctx.lineTo(cx - 20, by);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 20, by);
  ctx.lineTo(W - PAD - 20, by);
  ctx.stroke();

  // Branding
  ctx.font = '14px "DM Sans", sans-serif';
  ctx.fillStyle = 'rgba(201,168,76,0.35)';
  ctx.textAlign = 'center';
  ctx.fillText('MuslimOS', W / 2, H - 55);

  return canvas;
}

export async function shareAyahAsImage(arabic, translation, reference, lang = 'en') {
  const canvas = await generateAyahImage(arabic, translation, reference, lang);

  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) { resolve(false); return; }

      const file = new File([blob], 'ayah.png', { type: 'image/png' });

      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: reference });
          resolve(true);
          return;
        } catch { /* fall through to download */ }
      }

      // Fallback: download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quran-${reference.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      resolve(true);
    }, 'image/png');
  });
}
