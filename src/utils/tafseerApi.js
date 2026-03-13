// Tafseer API — dual backend (alquran.cloud + quran.com v4)

export const TAFSEER_EDITIONS = [
  { id: 'en-tafisr-ibn-kathir',        label: 'Ibn Kathir (English)',        lang: 'en', api: 'quran.com' },
  { id: 'tafseer-ibn-e-kaseer-urdu',   label: 'Ibn Kathir (Urdu)',           lang: 'ur', api: 'quran.com' },
  { id: 'en-tafsir-maarif-ul-quran',   label: "Ma'arif ul Quran (English)",  lang: 'en', api: 'quran.com' },
  { id: 'ar.jalalayn',                 label: 'Tafseer al-Jalalayn (Arabic)', lang: 'ar', api: 'alquran.cloud' },
  { id: 'ar.muyassar',                 label: 'Tafseer al-Muyassar (Arabic)', lang: 'ar', api: 'alquran.cloud' },
];

export const DEFAULT_TAFSEER = 'en-tafisr-ibn-kathir';

export function getDefaultTafseerForLang(lang) {
  return lang === 'ur' ? 'tafseer-ibn-e-kaseer-urdu' : DEFAULT_TAFSEER;
}

function cacheKey(edition, surah, ayah) {
  return `mos_tafseer_${edition}_${surah}_${ayah}`;
}

function stripHtml(html) {
  // Remove HTML tags, decode common entities
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

/**
 * Fetch tafseer for a single ayah.
 * Returns plain text string. Caches in localStorage.
 */
export async function fetchTafseer(surah, ayah, edition, signal) {
  const key = cacheKey(edition, surah, ayah);

  // Check localStorage cache
  const cached = localStorage.getItem(key);
  if (cached) return cached;

  const edInfo = TAFSEER_EDITIONS.find(e => e.id === edition);
  if (!edInfo) throw new Error(`Unknown tafseer edition: ${edition}`);

  let text;

  if (edInfo.api === 'alquran.cloud') {
    const url = `https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/${edition}`;
    const res = await fetch(url, signal ? { signal } : undefined);
    if (!res.ok) throw new Error(`API error ${res.status}`);
    const json = await res.json();
    text = json?.data?.text || '';
  } else {
    // quran.com v4
    const url = `https://api.quran.com/api/v4/tafsirs/${edition}/by_ayah/${surah}:${ayah}`;
    const res = await fetch(url, signal ? { signal } : undefined);
    if (!res.ok) throw new Error(`API error ${res.status}`);
    const json = await res.json();
    text = stripHtml(json?.tafsir?.text || '');
  }

  if (text) {
    try { localStorage.setItem(key, text); } catch { /* quota exceeded */ }
  }

  return text;
}
