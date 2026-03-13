// Daily reading streak tracker
const STORAGE_KEY = 'mos_streak';

function getToday() {
  return new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
}

function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24));
}

function loadData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { dates: [], current: 0, longest: 0 };
  } catch {
    return { dates: [], current: 0, longest: 0 };
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function recalcStreak(dates) {
  if (dates.length === 0) return { current: 0, longest: 0 };
  const sorted = [...new Set(dates)].sort().reverse(); // newest first
  const today = getToday();

  // Current streak: count consecutive days ending at today or yesterday
  let current = 0;
  const startCheck = sorted[0] === today || daysBetween(sorted[0], today) === 0 ? 0
    : daysBetween(sorted[0], today) === 1 ? 0 : -1;

  if (startCheck === -1) {
    // Last reading was more than 1 day ago, streak broken
    current = 0;
  } else {
    for (let i = 0; i < sorted.length; i++) {
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);
      const exp = expected.toISOString().slice(0, 10);
      if (sorted[i] === exp) {
        current++;
      } else if (i === 0 && daysBetween(sorted[0], today) === 1) {
        // yesterday was last read, count from yesterday
        const expected2 = new Date(today);
        expected2.setDate(expected2.getDate() - 1 - i);
        // recalculate from yesterday perspective
        break;
      } else {
        break;
      }
    }
    // If today not in list, check from yesterday
    if (sorted[0] !== today) {
      current = 0;
      for (let i = 0; i < sorted.length; i++) {
        const expected = new Date(today);
        expected.setDate(expected.getDate() - 1 - i);
        const exp = expected.toISOString().slice(0, 10);
        if (sorted[i] === exp) {
          current++;
        } else {
          break;
        }
      }
    }
  }

  // Longest streak ever
  const asc = [...new Set(dates)].sort();
  let longest = 1, run = 1;
  for (let i = 1; i < asc.length; i++) {
    if (daysBetween(asc[i - 1], asc[i]) === 1) {
      run++;
      if (run > longest) longest = run;
    } else {
      run = 1;
    }
  }

  return { current, longest: Math.max(longest, current) };
}

export function markTodayRead() {
  const data = loadData();
  const today = getToday();
  if (data.dates.includes(today)) return data;
  data.dates.push(today);
  // Keep only last 365 days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 365);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  data.dates = data.dates.filter(d => d >= cutoffStr);
  const { current, longest } = recalcStreak(data.dates);
  data.current = current;
  data.longest = longest;
  saveData(data);
  return data;
}

export function getStreakData() {
  const data = loadData();
  const { current, longest } = recalcStreak(data.dates);
  data.current = current;
  data.longest = longest;
  return data;
}

export function getRecentDays(count = 7) {
  const data = loadData();
  const today = new Date();
  const days = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const str = d.toISOString().slice(0, 10);
    days.push({ date: str, read: data.dates.includes(str), label: d.toLocaleDateString('en', { weekday: 'narrow' }) });
  }
  return days;
}
