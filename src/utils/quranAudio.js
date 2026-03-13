export const FALLBACK_RECITER = 'ar.alafasy';

const QURAN_COM_RECITER_IDS = {
  'ar.alafasy': 7,
  'ar.abdurrahmaansudais': 3,
  'ar.abdulbasitmurattal': 2,
  'ar.husary': 6,
};

export function getReciterInfo(reciterId, reciters = []) {
  return reciters.find((item) => item.id === reciterId) || null;
}

export function getAyahBitrate(reciterId, reciters = []) {
  return getReciterInfo(reciterId, reciters)?.ayahBitrate || 128;
}

export function getSurahBitrate(reciterId, reciters = []) {
  return getReciterInfo(reciterId, reciters)?.surahBitrate || null;
}

export function ayahAudioUrl(reciterId, absAyah, reciters = []) {
  return `https://cdn.islamic.network/quran/audio/${getAyahBitrate(reciterId, reciters)}/${reciterId}/${absAyah}.mp3`;
}

export function surahAudioUrl(reciterId, surah, reciters = []) {
  const surahBitrate = getSurahBitrate(reciterId, reciters);
  if (!surahBitrate) {
    return `https://cdn.islamic.network/quran/audio-surah/128/${FALLBACK_RECITER}/${surah}.mp3`;
  }
  return `https://cdn.islamic.network/quran/audio-surah/${surahBitrate}/${reciterId}/${surah}.mp3`;
}

export function getQuranComReciterId(reciterId) {
  return QURAN_COM_RECITER_IDS[reciterId] || QURAN_COM_RECITER_IDS[FALLBACK_RECITER];
}

function authHeaders() {
  const headers = {};
  const clientId = import.meta.env.VITE_QURAN_CLIENT_ID;
  const authToken = import.meta.env.VITE_QURAN_AUTH_TOKEN;

  if (clientId) headers['x-client-id'] = clientId;
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  return headers;
}

function chapterCacheKey(reciterId) {
  return `mos_surah_audio_urls_${reciterId}`;
}

export async function getSurahAudioUrl(reciterId, surah, reciters = []) {
  const quranComReciterId = getQuranComReciterId(reciterId);
  const key = chapterCacheKey(quranComReciterId);

  try {
    const cached = JSON.parse(localStorage.getItem(key) || 'null');
    const audioUrl = cached?.audioUrls?.[String(surah)];
    if (audioUrl) return audioUrl;
  } catch {}

  try {
    const res = await fetch(
      `https://api.quran.com/api/v4/chapter_recitations/${quranComReciterId}`,
      { headers: authHeaders() }
    );

    if (!res.ok) {
      throw new Error(`Chapter audio request failed: ${res.status}`);
    }

    const json = await res.json();
    const audioFiles = Array.isArray(json?.audio_files) ? json.audio_files : [];
    const audioUrls = audioFiles.reduce((acc, item) => {
      if (item?.chapter_id && item?.audio_url) {
        acc[String(item.chapter_id)] = item.audio_url;
      }
      return acc;
    }, {});

    if (Object.keys(audioUrls).length) {
      localStorage.setItem(key, JSON.stringify({
        reciterId,
        quranComReciterId,
        fetchedAt: Date.now(),
        audioUrls,
      }));
    }

    if (audioUrls[String(surah)]) {
      return audioUrls[String(surah)];
    }
  } catch (error) {
    console.warn('[quranAudio] Falling back to legacy surah audio URL', error);
  }

  return surahAudioUrl(reciterId, surah, reciters);
}
