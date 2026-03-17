import { getRuleTone } from './tajweedColors';

const TAJWEED_CACHE_PREFIX = 'mos_tajweed_html_';
const WORDS_CACHE_PREFIX = 'mos_tajweed_words_';
const API_BASE = 'https://api.quran.com/api/v4';
const DEFAULT_RECITER = 7;

function readCache(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null');
  } catch {
    return null;
  }
}

function writeCache(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export async function fetchTajweedVerse(verseKey) {
  const cacheKey = `${TAJWEED_CACHE_PREFIX}${verseKey}`;
  const cached = readCache(cacheKey);
  if (cached) return cached;

  const response = await fetch(`${API_BASE}/quran/verses/uthmani_tajweed?verse_key=${verseKey}`);
  if (!response.ok) throw new Error(`Failed to load tajweed text (${response.status})`);
  const json = await response.json();
  const verse = Array.isArray(json.verses) ? json.verses[0] : json.verse || null;
  const html = verse?.text_uthmani_tajweed || verse?.text || '';
  writeCache(cacheKey, html);
  return html;
}

export async function fetchVerseWords(verseKey) {
  const cacheKey = `${WORDS_CACHE_PREFIX}${verseKey}`;
  const cached = readCache(cacheKey);
  if (cached) return cached;

  const response = await fetch(`${API_BASE}/verses/by_key/${verseKey}?words=true&word_fields=text_uthmani,transliteration&fields=text_uthmani`);
  if (!response.ok) throw new Error(`Failed to load verse words (${response.status})`);
  const json = await response.json();
  const words = json.verse?.words || [];
  writeCache(cacheKey, words);
  return words;
}

export function transformTajweedHtml(html) {
  return html.replace(/<tajweed class=([a-zA-Z_]+)>(.*?)<\/tajweed>/g, (_, className, content) => {
    const tone = getRuleTone(className);
    return `<span class="tj-mark tj-${tone}" data-rule="${tone}" data-class="${className}">${content}</span>`;
  });
}

export function splitTajweedWords(html) {
  return transformTajweedHtml(html)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((wordHtml, index) => {
      const match = wordHtml.match(/data-rule="([^"]+)"/);
      return {
        id: `${index + 1}`,
        position: index + 1,
        html: wordHtml,
        ruleKey: match?.[1] || 'default',
      };
    });
}

export function getWordAudioUrl(surah, ayah, wordPosition, reciter = DEFAULT_RECITER) {
  return `https://audio.qurancdn.com/wbw/${reciter}/${surah}_${ayah}_${wordPosition}.mp3`;
}
