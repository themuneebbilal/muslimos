import SURAHS_META from '../data/surahMeta';

// Build cumulative ayah offsets per surah
// offsets[1] = 0 → surah 1 starts at absolute ayah 1
// offsets[2] = 7 → surah 2 starts at absolute ayah 8
const offsets = [0]; // index 0 unused
let cum = 0;
for (let i = 1; i <= 114; i++) {
  offsets[i] = cum;
  cum += SURAHS_META[i - 1].v;
}

export function getAbsoluteAyahNumber(surahNum, verseNum) {
  return offsets[surahNum] + verseNum;
}

export function getSurahOffset(surahNum) {
  return offsets[surahNum];
}

export function toArabicNum(n) {
  return String(n).replace(/[0-9]/g, d => '\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669'[d]);
}

export const TOTAL_AYAHS = cum; // 6236
