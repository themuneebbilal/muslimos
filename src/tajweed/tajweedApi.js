import { getRuleTone } from './tajweedColors';

const TAJWEED_CACHE_PREFIX = 'mos_tajweed_html_';
const WORDS_CACHE_PREFIX = 'mos_tajweed_words_';
const RECITATION_CACHE_PREFIX = 'mos_tajweed_recitation_';
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

function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function splitTajweedWords(html) {
  const container = document.createElement('div');
  container.innerHTML = transformTajweedHtml(html);

  const words = [];
  let currentHtml = '';
  let currentRuleKey = 'default';

  function flushCurrent() {
    if (!currentHtml.trim()) return;
    words.push({
      id: `${words.length + 1}`,
      position: words.length + 1,
      html: currentHtml,
      ruleKey: currentRuleKey,
    });
    currentHtml = '';
    currentRuleKey = 'default';
  }

  function appendHtml(fragment, ruleKey = 'default') {
    currentHtml += fragment;
    if (currentRuleKey === 'default' && ruleKey !== 'default') {
      currentRuleKey = ruleKey;
    }
  }

  container.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          flushCurrent();
        } else {
          appendHtml(escapeHtml(part));
        }
      });
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const element = node;
    if (element.classList.contains('end')) {
      appendHtml(element.outerHTML);
      flushCurrent();
      return;
    }

    appendHtml(element.outerHTML, element.dataset.rule || 'default');
  });

  flushCurrent();
  return words;
}

export function getWordAudioUrl(surah, ayah, wordPosition, reciter = DEFAULT_RECITER) {
  return `https://audio.qurancdn.com/wbw/${reciter}/${surah}_${ayah}_${wordPosition}.mp3`;
}

function normalizeTimingItem(item) {
  return {
    verseKey: item.verse_key,
    timestampFrom: Number(item.timestamp_from || 0),
    timestampTo: Number(item.timestamp_to || 0),
    segments: Array.isArray(item.segments)
      ? item.segments
          .map((segment) => {
            if (!Array.isArray(segment) || segment.length < 3) return null;
            return {
              wordIndex: Number(segment[0]),
              timestampFrom: Number(segment[1]),
              timestampTo: Number(segment[2]),
            };
          })
          .filter(Boolean)
      : [],
  };
}

export async function fetchVerseRecitation(verseKey, reciter = DEFAULT_RECITER) {
  const [surah] = verseKey.split(':').map(Number);
  const cacheKey = `${RECITATION_CACHE_PREFIX}${surah}_${reciter}`;
  const cached = readCache(cacheKey);
  if (cached?.audioUrl && cached?.timings?.length) {
    return cached.timings.find((item) => item.verseKey === verseKey)
      ? cached
      : cached;
  }

  const response = await fetch(`${API_BASE}/chapter_recitations/${reciter}/${surah}?segments=true`);
  if (!response.ok) throw new Error(`Failed to load recitation timing (${response.status})`);
  const json = await response.json();
  const audioFile = json?.audio_file || null;
  const payload = {
    audioUrl: audioFile?.audio_url || '',
    timings: Array.isArray(audioFile?.timestamps)
      ? audioFile.timestamps.map(normalizeTimingItem).sort((a, b) => a.timestampFrom - b.timestampFrom)
      : [],
  };
  writeCache(cacheKey, payload);
  return payload;
}

export function getSegmentForWord(verseTiming, wordPosition) {
  if (!verseTiming?.segments?.length) return null;
  return verseTiming.segments.find((segment) => {
    const idx = Number(segment.wordIndex);
    return idx === wordPosition || idx === wordPosition - 1;
  }) || null;
}
