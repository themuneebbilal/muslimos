import { getChapterRecitationData } from './quranRecitationApi';

export const FALLBACK_RECITER = 'ar.alafasy';

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

export async function getSurahAudioUrl(reciterId, surah, reciters = []) {
  try {
    const data = await getChapterRecitationData(surah, reciterId);
    if (data.audioUrl) {
      return data.audioUrl;
    }
  } catch (error) {
    console.warn('[quranAudio] Falling back to legacy surah audio URL', error);
  }

  return surahAudioUrl(reciterId, surah, reciters);
}
