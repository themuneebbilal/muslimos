// Khatm al-Quran progress tracker
// Tracks which surahs have been fully read (scrolled past 80%+ of ayahs)
const STORAGE_KEY = 'mos_khatm';
const TOTAL_SURAHS = 114;

function loadData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { surahs: {}, startedAt: null, completedAt: null };
  } catch {
    return { surahs: {}, startedAt: null, completedAt: null };
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function markSurahProgress(surahNum, maxAyahReached, totalAyahs) {
  const data = loadData();
  if (!data.startedAt) data.startedAt = new Date().toISOString();

  const prev = data.surahs[surahNum] || { maxAyah: 0, complete: false };
  const newMax = Math.max(prev.maxAyah, maxAyahReached);
  const complete = newMax >= Math.floor(totalAyahs * 0.8);

  data.surahs[surahNum] = { maxAyah: newMax, complete, readAt: complete ? new Date().toISOString() : prev.readAt };

  // Check if all surahs are complete
  const completedCount = Object.values(data.surahs).filter(s => s.complete).length;
  if (completedCount >= TOTAL_SURAHS && !data.completedAt) {
    data.completedAt = new Date().toISOString();
  }

  saveData(data);
  return data;
}

export function getKhatmData() {
  const data = loadData();
  const completedSurahs = Object.entries(data.surahs).filter(([, v]) => v.complete).length;
  const pct = Math.round((completedSurahs / TOTAL_SURAHS) * 100);
  return {
    completedSurahs,
    totalSurahs: TOTAL_SURAHS,
    pct,
    surahs: data.surahs,
    startedAt: data.startedAt,
    completedAt: data.completedAt,
  };
}

export function resetKhatm() {
  saveData({ surahs: {}, startedAt: null, completedAt: null });
}
