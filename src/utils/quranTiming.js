import { getQuranComReciterId } from './quranAudio';

function cacheKey(surah, reciter) {
  return `mos_verse_timings_${surah}_${reciter}`;
}

function authHeaders() {
  const headers = {};
  const clientId = import.meta.env.VITE_QURAN_CLIENT_ID;
  const authToken = import.meta.env.VITE_QURAN_AUTH_TOKEN;

  if (clientId) headers['x-client-id'] = clientId;
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  return headers;
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

export async function getSurahTimingData(surah, reciter) {
  const key = cacheKey(surah, reciter);

  try {
    const cached = JSON.parse(localStorage.getItem(key) || 'null');
    if (cached?.timings?.length) return cached.timings;
  } catch {}

  const reciterId = getQuranComReciterId(reciter);
  const res = await fetch(
    `https://api.quran.com/api/v4/recitations/${reciterId}/by_chapter/${surah}?per_page=300`,
    { headers: authHeaders() }
  );

  if (!res.ok) {
    throw new Error(`Timing request failed: ${res.status}`);
  }

  const json = await res.json();
  const timings = Array.isArray(json?.audio_files)
    ? json.audio_files
        .flatMap((file) => Array.isArray(file?.verse_timings) ? file.verse_timings : [])
        .map(normalizeTimingItem)
        .sort((a, b) => a.timestampFrom - b.timestampFrom)
    : [];

  if (!timings.length) {
    throw new Error('No timing data returned');
  }

  localStorage.setItem(key, JSON.stringify({
    reciter,
    reciterId,
    surah,
    fetchedAt: Date.now(),
    timings,
  }));

  return timings;
}

export function findTimingIndex(timings, positionMs) {
  let low = 0;
  let high = timings.length - 1;
  let match = -1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const item = timings[mid];

    if (positionMs < item.timestampFrom) {
      high = mid - 1;
    } else if (positionMs >= item.timestampTo) {
      low = mid + 1;
    } else {
      match = mid;
      break;
    }
  }

  if (match >= 0) return match;
  return Math.max(0, Math.min(low, timings.length - 1));
}

export function findSegmentIndex(segments, positionMs) {
  let low = 0;
  let high = segments.length - 1;
  let match = -1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const item = segments[mid];

    if (positionMs < item.timestampFrom) {
      high = mid - 1;
    } else if (positionMs >= item.timestampTo) {
      low = mid + 1;
    } else {
      match = mid;
      break;
    }
  }

  if (match >= 0) return match;
  return Math.max(0, Math.min(low, segments.length - 1));
}
