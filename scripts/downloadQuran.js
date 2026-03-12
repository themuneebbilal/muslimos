#!/usr/bin/env node
// Run: node scripts/downloadQuran.js
// Downloads full Quran (Arabic + English + Urdu) from alquran.cloud API
// Saves to src/data/quranText.json

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'src', 'data', 'quranText.json');

const EDITIONS = {
  a: 'ar.alafasy',      // Arabic (with tashkeel)
  e: 'en.sahih',         // English - Sahih International
  u: 'ur.jalandhry',     // Urdu - Jalandhry
};

async function fetchEdition(edition) {
  console.log(`Fetching ${edition}...`);
  const res = await fetch(`https://api.alquran.cloud/v1/quran/${edition}`);
  const data = await res.json();
  if (data.code !== 200) throw new Error(`API error for ${edition}: ${data.status}`);
  return data.data.surahs;
}

async function main() {
  const result = {};

  // Fetch Arabic
  const arabicSurahs = await fetchEdition(EDITIONS.a);
  for (const surah of arabicSurahs) {
    result[surah.number] = {
      a: surah.ayahs.map(a => a.text),
      e: [],
      u: [],
    };
  }

  // Fetch English
  const englishSurahs = await fetchEdition(EDITIONS.e);
  for (const surah of englishSurahs) {
    if (result[surah.number]) {
      result[surah.number].e = surah.ayahs.map(a => a.text);
    }
  }

  // Fetch Urdu
  try {
    const urduSurahs = await fetchEdition(EDITIONS.u);
    for (const surah of urduSurahs) {
      if (result[surah.number]) {
        result[surah.number].u = surah.ayahs.map(a => a.text);
      }
    }
  } catch (e) {
    console.warn('Urdu fetch failed, skipping:', e.message);
  }

  // Save
  fs.writeFileSync(OUT, JSON.stringify(result), 'utf-8');
  const sizeMB = (fs.statSync(OUT).size / 1024 / 1024).toFixed(1);
  console.log(`\nSaved ${Object.keys(result).length} surahs to ${OUT} (${sizeMB} MB)`);
  console.log('Total verses:', Object.values(result).reduce((s, v) => s + v.a.length, 0));
}

main().catch(console.error);
