export const FALLBACK_QURAN_COM_RECITER_ID = 7;

const QURAN_COM_RECITER_IDS = {
  'ar.alafasy': 7,
  'ar.abdurrahmaansudais': 3,
  'ar.abdulbasitmurattal': 2,
  'ar.husary': 6,
};

export function getQuranComReciterId(reciterId) {
  return QURAN_COM_RECITER_IDS[reciterId] || FALLBACK_QURAN_COM_RECITER_ID;
}

function authHeaders() {
  const headers = {};
  const clientId = import.meta.env.VITE_QURAN_CLIENT_ID;
  const authToken = import.meta.env.VITE_QURAN_AUTH_TOKEN;

  if (clientId) headers['x-client-id'] = clientId;
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  return headers;
}

function cacheKey(surah, reciter) {
  return `mos_chapter_recitation_${surah}_${reciter}`;
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

export async function getChapterRecitationData(surah, reciter) {
  const key = cacheKey(surah, reciter);

  try {
    const cached = JSON.parse(localStorage.getItem(key) || 'null');
    if (cached?.audioUrl || cached?.timings?.length) return cached;
  } catch {}

  const reciterId = getQuranComReciterId(reciter);
  const res = await fetch(
    `https://api.quran.com/api/v4/chapter_recitations/${reciterId}/${surah}?segments=true`,
    { headers: authHeaders() }
  );

  if (!res.ok) {
    throw new Error(`Chapter recitation request failed: ${res.status}`);
  }

  const json = await res.json();
  const audioFile = json?.audio_file || null;
  const data = {
    reciter,
    reciterId,
    surah,
    fetchedAt: Date.now(),
    audioUrl: audioFile?.audio_url || '',
    timings: Array.isArray(audioFile?.timestamps)
      ? audioFile.timestamps.map(normalizeTimingItem).sort((a, b) => a.timestampFrom - b.timestampFrom)
      : [],
  };

  localStorage.setItem(key, JSON.stringify(data));
  return data;
}
