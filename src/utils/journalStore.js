const STORAGE_KEY = 'mos_journal_entries';

const PROMPTS = [
  'What softened your heart today?',
  'Which moment today felt closest to sakinah?',
  'What dua stayed with you after prayer?',
  'What distracted you today, and what brought you back?',
];

export const JOURNAL_MOODS = ['Calm', 'Focused', 'Grateful', 'Hopeful', 'Tired'];
export const JOURNAL_ANCHORS = ['General', 'Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export function getDailyJournalPrompt() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return PROMPTS[dayOfYear % PROMPTS.length];
}

export function getJournalEntries() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(raw)) return [];
    return raw.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch {
    return [];
  }
}

export function saveJournalEntry(entry) {
  const entries = getJournalEntries();
  const nextEntry = {
    id: entry.id || `journal_${Date.now()}`,
    text: entry.text.trim(),
    mood: entry.mood || 'Calm',
    anchor: entry.anchor || 'General',
    createdAt: entry.createdAt || new Date().toISOString(),
  };
  const next = [nextEntry, ...entries].slice(0, 50);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function deleteJournalEntry(id) {
  const next = getJournalEntries().filter((entry) => entry.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}
