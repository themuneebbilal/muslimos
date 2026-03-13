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

