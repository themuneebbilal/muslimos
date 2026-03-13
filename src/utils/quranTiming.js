import { getChapterRecitationData } from './quranRecitationApi';

export async function getSurahTimingData(surah, reciter) {
  const data = await getChapterRecitationData(surah, reciter);
  if (!data.timings.length) {
    throw new Error('No timing data returned');
  }
  return data.timings;
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
