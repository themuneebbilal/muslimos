import HADITH_DATA from '../data/hadith.json';

const API_BASE = 'https://api.sunnah.com/v1';
const API_KEY = import.meta.env.VITE_SUNNAH_API_KEY || '';
const DB_NAME = 'muslimos-hadith-offline';
const DB_VERSION = 1;
const COLLECTION_STORE = 'collections';
const PAGE_CACHE_PREFIX = 'mos_hadith_page_';
const CHAPTER_CACHE_PREFIX = 'mos_chapters_';
const META_KEY = 'mos_hadith_offline_meta';
const QUEUE_KEY = 'mos_hadith_download_queue';

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

const listeners = new Set();
let downloadWorker = null;
let dbPromise = null;

function emit() {
  listeners.forEach((listener) => {
    try { listener(); } catch {}
  });
}

export function subscribeHadithDownloads(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

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

function readMeta() {
  try {
    return JSON.parse(localStorage.getItem(META_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeMeta(meta) {
  localStorage.setItem(META_KEY, JSON.stringify(meta));
  emit();
}

function updateMeta(collectionId, patch) {
  const meta = readMeta();
  meta[collectionId] = {
    ...(meta[collectionId] || {}),
    ...patch,
    updatedAt: Date.now(),
  };
  writeMeta(meta);
  return meta[collectionId];
}

function deleteMeta(collectionId) {
  const meta = readMeta();
  delete meta[collectionId];
  writeMeta(meta);
}

export function getOfflineMeta(collectionId) {
  return readMeta()[collectionId] || null;
}

export function getAllOfflineMeta() {
  return readMeta();
}

function readQueue() {
  try {
    const parsed = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQueue(queue) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  emit();
}

export function getDownloadQueue() {
  return readQueue();
}

function enqueue(task) {
  const queue = readQueue();
  if (!queue.find((item) => item.collectionId === task.collectionId)) {
    queue.push(task);
    writeQueue(queue);
  }
}

function dequeue(collectionId) {
  writeQueue(readQueue().filter((item) => item.collectionId !== collectionId));
}

function setQueuedState(collectionId, totalExpected) {
  const existing = getOfflineMeta(collectionId);
  updateMeta(collectionId, {
    status: existing?.status === 'error' && existing.downloadedCount > 0 ? 'queued_resume' : 'queued',
    totalExpected,
    downloadedCount: existing?.downloadedCount || 0,
    bytes: existing?.bytes || 0,
  });
}

function pageCacheKey(collection, page) {
  return `${PAGE_CACHE_PREFIX}${collection}_p${page}`;
}

function getDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(COLLECTION_STORE)) {
        db.createObjectStore(COLLECTION_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
  return dbPromise;
}

async function idbGetCollection(collectionId) {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(COLLECTION_STORE, 'readonly');
    const req = tx.objectStore(COLLECTION_STORE).get(collectionId);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result || null);
  });
}

async function idbPutCollection(collectionId, payload) {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(COLLECTION_STORE, 'readwrite');
    tx.onerror = () => reject(tx.error);
    tx.objectStore(COLLECTION_STORE).put({ id: collectionId, ...payload });
    tx.oncomplete = () => resolve();
  });
}

async function idbDeleteCollection(collectionId) {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(COLLECTION_STORE, 'readwrite');
    tx.onerror = () => reject(tx.error);
    tx.objectStore(COLLECTION_STORE).delete(collectionId);
    tx.oncomplete = () => resolve();
  });
}

async function idbGetAllCollections() {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(COLLECTION_STORE, 'readonly');
    const req = tx.objectStore(COLLECTION_STORE).getAll();
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result || []);
  });
}

function measureBytes(data) {
  return new Blob([JSON.stringify(data)]).size;
}

async function fetchRemotePage(collection, page = 1, limit = 20) {
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
    localStorage.setItem(pageCacheKey(collection, page), JSON.stringify(items));
    return { data: items, hasMore: items.length >= limit };
  } catch (err) {
    return { data: [], hasMore: false, error: err.message };
  }
}

export async function fetchHadith(collection, page = 1, limit = 20) {
  if (hasIncludedHadith(collection)) {
    return localHadithPage(collection, page, limit);
  }

  const meta = getOfflineMeta(collection);
  if (meta?.status === 'downloaded') {
    const record = await idbGetCollection(collection);
    const items = record?.items || [];
    const start = (page - 1) * limit;
    return {
      data: items.slice(start, start + limit),
      hasMore: start + limit < items.length,
    };
  }

  const cached = localStorage.getItem(pageCacheKey(collection, page));
  if (cached) {
    const parsed = JSON.parse(cached);
    return { data: parsed, hasMore: parsed.length >= limit };
  }

  return fetchRemotePage(collection, page, limit);
}

export async function fetchChapters(collection) {
  const localCollection = getLocalCollection(collection);
  if (localCollection) return localCollection.chapters || [];

  const cacheKey = `${CHAPTER_CACHE_PREFIX}${collection}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return JSON.parse(cached);

  if (!API_KEY) return [];

  try {
    const res = await fetch(`${API_BASE}/collections/${collection}/chapters`, { headers: headers() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const chapters = json.data || [];
    localStorage.setItem(cacheKey, JSON.stringify(chapters));
    return chapters;
  } catch {
    return [];
  }
}

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

export function getCachedCount(collectionId) {
  const localCollection = getLocalCollection(collectionId);
  if (localCollection) return localCollection.hadith.length;
  return getOfflineMeta(collectionId)?.downloadedCount || 0;
}

export function isFullyDownloaded(collectionId) {
  return getOfflineMeta(collectionId)?.status === 'downloaded';
}

export function getCollectionDownloadState(collectionId) {
  return getOfflineMeta(collectionId) || { status: 'remote', downloadedCount: 0, totalExpected: 0, bytes: 0 };
}

export async function loadAllCached(collectionId) {
  const localCollection = getLocalCollection(collectionId);
  if (localCollection) return localCollection.hadith;

  const record = await idbGetCollection(collectionId);
  return record?.items || [];
}

async function persistCollectionSnapshot(collectionId, collectionApiName, items, totalExpected, extra = {}) {
  const bytes = measureBytes(items);
  await idbPutCollection(collectionId, {
    apiName: collectionApiName,
    items,
    bytes,
    savedAt: Date.now(),
  });
  updateMeta(collectionId, {
    downloadedCount: items.length,
    totalExpected,
    bytes,
    ...extra,
  });
}

async function processQueue() {
  if (downloadWorker) return downloadWorker;

  downloadWorker = (async () => {
    while (readQueue().length > 0) {
      const task = readQueue()[0];
      const { collectionApiName, collectionId, totalExpected } = task;
      const existing = await idbGetCollection(collectionId);
      let items = existing?.items || [];
      let page = (getOfflineMeta(collectionId)?.resumePage || 1);

      updateMeta(collectionId, {
        status: 'downloading',
        totalExpected,
        downloadedCount: items.length,
        active: true,
      });

      try {
        while (true) {
          const { data, hasMore, error } = await fetchRemotePage(collectionApiName, page, 50);
          if (error) throw new Error(error);
          if (!data.length) break;

          const seen = new Set(items.map((item) => item.id || `${item.hadithNumber}-${item.chapterTitle || item.bookName || ''}`));
          const nextItems = data.filter((item) => {
            const key = item.id || `${item.hadithNumber}-${item.chapterTitle || item.bookName || ''}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          items = [...items, ...nextItems];
          await persistCollectionSnapshot(collectionId, collectionApiName, items, totalExpected, {
            status: 'downloading',
            resumePage: page + 1,
          });

          if (!hasMore || data.length < 50 || items.length >= totalExpected) break;
          page += 1;
        }

        await persistCollectionSnapshot(collectionId, collectionApiName, items, totalExpected, {
          status: 'downloaded',
          resumePage: null,
          lastError: null,
          active: false,
        });
        dequeue(collectionId);
      } catch (error) {
        updateMeta(collectionId, {
          status: 'error',
          lastError: error.message,
          resumePage: page,
          active: false,
          totalExpected,
        });
        dequeue(collectionId);
      }
    }
  })();

  try {
    await downloadWorker;
  } finally {
    downloadWorker = null;
    emit();
  }
}

export async function queueCollectionDownload(collectionApiName, collectionId, totalExpected) {
  if (hasIncludedHadith(collectionApiName) || hasIncludedHadith(collectionId)) return;
  setQueuedState(collectionId, totalExpected);
  enqueue({ collectionApiName, collectionId, totalExpected });
  processQueue();
}

export async function downloadCollection(collectionApiName, collectionId, totalExpected, onProgress) {
  const unsubscribe = subscribeHadithDownloads(() => {
    const meta = getOfflineMeta(collectionId);
    if (meta && onProgress) {
      onProgress(meta.downloadedCount || 0, meta.totalExpected || totalExpected);
    }
  });

  await queueCollectionDownload(collectionApiName, collectionId, totalExpected);
  const waitForCompletion = async () => {
    while (true) {
      const meta = getOfflineMeta(collectionId);
      if (!meta) break;
      if (meta.status === 'downloaded') break;
      if (meta.status === 'error') throw new Error(meta.lastError || 'Download failed');
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  };

  try {
    await waitForCompletion();
  } finally {
    unsubscribe();
  }
}

export async function removeOfflineCollection(collectionId) {
  await idbDeleteCollection(collectionId);
  deleteMeta(collectionId);
  emit();
}

export async function getOfflineStorageUsageBytes() {
  const all = await idbGetAllCollections();
  return all.reduce((sum, item) => sum + (item.bytes || 0), 0);
}
