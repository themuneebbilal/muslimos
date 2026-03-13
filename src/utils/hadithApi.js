import HADITH_DATA from '../data/hadith.json';

const API_BASE = 'https://api.sunnah.com/v1';
const API_KEY = import.meta.env.VITE_SUNNAH_API_KEY || '';

const LOCAL_COLLECTION_ALIASES = {
  bukhari: 'bukhari',
  muslim: 'muslim',
  tirmidhi: 'tirmidhi',
  abudawud: 'abu_dawud',
  abu_dawud: 'abu_dawud',
  riyad: 'riyad',
  nawawi: 'nawawi',
  nawawi40: 'nawawi',
};

function getLocalCollections() {
  return Array.isArray(HADITH_DATA?.collections) ? HADITH_DATA.collections : [];
}

function normalizeLocalCollectionId(collectionId) {
  return LOCAL_COLLECTION_ALIASES[collectionId] || collectionId;
}

function getLocalCollection(collectionId) {
  const normalizedId = normalizeLocalCollectionId(collectionId);
  return getLocalCollections().find((collection) => collection.id === normalizedId) || null;
}

export function hasIncludedHadith(collectionId) {
  return !!getLocalCollection(collectionId);
}

function localHadithPage(collectionId, page = 1, limit = 20) {
  const collection = getLocalCollection(collectionId);
  if (!collection) return { data: [], hasMore: false };
  const start = (page - 1) * limit;
  const items = collection.hadith.slice(start, start + limit);
  return { data: items, hasMore: start + limit < collection.hadith.length };
}

function headers() {
  return { 'x-api-key': API_KEY, 'Content-Type': 'application/json' };
}

/**
 * Fetch hadith from a collection with caching.
 * Returns { data: [...], hasMore: boolean }
 */
export async function fetchHadith(collection, page = 1, limit = 20) {
  if (hasIncludedHadith(collection)) {
    return localHadithPage(collection, page, limit);
  }

  const cacheKey = `mos_hadith_${collection}_p${page}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    const parsed = JSON.parse(cached);
    return { data: parsed, hasMore: parsed.length >= limit };
  }

  if (!API_KEY) {
    return { data: [], hasMore: false, error: 'API key not configured' };
  }

  try {
    const res = await fetch(
      `${API_BASE}/collections/${collection}/hadiths?page=${page}&limit=${limit}`,
      { headers: headers() }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const items = json.data || [];
    localStorage.setItem(cacheKey, JSON.stringify(items));
    return { data: items, hasMore: items.length >= limit };
  } catch (err) {
    return { data: [], hasMore: false, error: err.message };
  }
}

/**
 * Fetch chapter list for a collection with caching.
 */
export async function fetchChapters(collection) {
  const localCollection = getLocalCollection(collection);
  if (localCollection) return localCollection.chapters || [];

  const cacheKey = `mos_chapters_${collection}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return JSON.parse(cached);

  if (!API_KEY) return [];

  try {
    const res = await fetch(
      `${API_BASE}/collections/${collection}/chapters`,
      { headers: headers() }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const chapters = json.data || [];
    localStorage.setItem(cacheKey, JSON.stringify(chapters));
    return chapters;
  } catch {
    return [];
  }
}

/**
 * Map sunnah.com API hadith object to our card format.
 */
export function mapApiHadith(h, collectionId, collectionName) {
  if (h.english && h.arabic && h.reference) {
    return {
      id: h.id || `${collectionId}_${h.number}`,
      number: String(h.number || h.hadithNumber || ''),
      arabic: h.arabic || '',
      english: h.english || '',
      urdu: h.urdu || '',
      reference: h.reference || `${collectionName} ${h.number || h.hadithNumber || ''}`,
      grade: h.grade || '',
      chapter: h.chapter || '',
    };
  }

  return {
    id: `${collectionId}_${h.hadithNumber}`,
    number: String(h.hadithNumber),
    arabic: h.arab || h.hadithArabic || '',
    english: h.text || h.hadithEnglish || '',
    urdu: '',
    reference: `${collectionName} ${h.hadithNumber}`,
    grade: h.grades?.[0]?.grade || h.grade || '',
    chapter: h.chapterTitle || h.bookName || '',
  };
}

/**
 * Get cached page count for a collection.
 */
export function getCachedCount(collectionId) {
  const localCollection = getLocalCollection(collectionId);
  if (localCollection) return localCollection.hadith.length;

  let total = 0;
  for (let p = 1; p <= 500; p++) {
    const key = `mos_hadith_${collectionId}_p${p}`;
    const cached = localStorage.getItem(key);
    if (!cached) break;
    try {
      total += JSON.parse(cached).length;
    } catch { break; }
  }
  return total;
}

/**
 * Download all hadith for a collection. Calls onProgress(downloaded, total).
 * Returns total count downloaded.
 */
export async function downloadCollection(collectionApiName, collectionId, totalExpected, onProgress) {
  if (hasIncludedHadith(collectionApiName) || hasIncludedHadith(collectionId)) {
    const localCollection = getLocalCollection(collectionApiName) || getLocalCollection(collectionId);
    const total = localCollection?.hadith?.length || 0;
    if (onProgress) onProgress(total, total);
    return total;
  }

  let page = 1;
  let downloaded = 0;
  const limit = 50;

  while (true) {
    const { data, hasMore, error } = await fetchHadith(collectionApiName, page, limit);
    if (error) throw new Error(error);
    downloaded += data.length;
    if (onProgress) onProgress(downloaded, totalExpected);
    if (!hasMore || data.length === 0) break;
    page++;
  }

  // Mark as fully downloaded
  localStorage.setItem(`mos_hadith_${collectionId}_complete`, 'true');
  return downloaded;
}

/**
 * Check if a collection is fully downloaded.
 */
export function isFullyDownloaded(collectionId) {
  return localStorage.getItem(`mos_hadith_${collectionId}_complete`) === 'true';
}

/**
 * Load all cached pages for a collection.
 */
export function loadAllCached(collectionId) {
  const localCollection = getLocalCollection(collectionId);
  if (localCollection) return localCollection.hadith;

  const all = [];
  for (let p = 1; p <= 500; p++) {
    const key = `mos_hadith_${collectionId}_p${p}`;
    const cached = localStorage.getItem(key);
    if (!cached) break;
    try {
      all.push(...JSON.parse(cached));
    } catch { break; }
  }
  return all;
}
