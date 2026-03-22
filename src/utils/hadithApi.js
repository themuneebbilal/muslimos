import HADITH_DATA from '../data/hadith.json';
import { logError, logWarn } from './logger';
import { safeGetJSON, safeSetJSON } from './safeStorage';

const API_VERSION = 1;
const CDN_BASE = `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@${API_VERSION}`;
const RAW_BASE = `https://raw.githubusercontent.com/fawazahmed0/hadith-api/${API_VERSION}`;
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

const REMOTE_EDITIONS = {
  riyad: ['eng-riyadussalihin', 'eng-riyadusshaliheen', 'eng-riyadussaliheen'],
  bukhari: ['eng-bukhari'],
  muslim: ['eng-muslim'],
  tirmidhi: ['eng-tirmidhi'],
  abu_dawud: ['eng-abudawud'],
  abudawud: ['eng-abudawud'],
  nasai: ['eng-nasai'],
  ibnmajah: ['eng-ibnmajah'],
  malik: ['eng-malik'],
  ahmad: ['eng-ahmad'],
};

const listeners = new Set();
const remoteCollectionCache = new Map();
let downloadWorker = null;
let dbPromise = null;

function emit() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (error) {
      logError('hadith:emit', error);
    }
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

function readMeta() {
  return safeGetJSON(META_KEY, {}) || {};
}

function writeMeta(meta) {
  safeSetJSON(META_KEY, meta);
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
  const parsed = safeGetJSON(QUEUE_KEY, []);
  return Array.isArray(parsed) ? parsed : [];
}

function writeQueue(queue) {
  safeSetJSON(QUEUE_KEY, queue);
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

async function getDb() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => reject(request.error);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(COLLECTION_STORE)) {
          db.createObjectStore(COLLECTION_STORE, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
    } catch (error) {
      reject(error);
    }
  }).catch((error) => {
    logError('hadith:indexedDB', error);
    throw error;
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

function getEditionCandidates(collectionId) {
  const normalized = normalizeLocalCollectionId(collectionId);
  return REMOTE_EDITIONS[normalized] || [`eng-${normalized}`];
}

async function fetchJsonWithFallback(endpoint) {
  const urls = [
    `${CDN_BASE}/${endpoint}.min.json`,
    `${CDN_BASE}/${endpoint}.json`,
    `${RAW_BASE}/${endpoint}.min.json`,
    `${RAW_BASE}/${endpoint}.json`,
  ];

  let lastError = null;
  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error(`Unable to fetch ${endpoint}`);
}

function inferChapterLabel(item, sectionsMap) {
  const sectionKey = item.reference?.book ?? item.book ?? item.chapterNumber;
  if (sectionKey !== undefined && sectionsMap[String(sectionKey)]) {
    return sectionsMap[String(sectionKey)];
  }
  return item.chapterTitle || item.bookName || item.chapter || '';
}

function normalizeRemoteBundle(bundle, collectionId) {
  const metadata = bundle?.metadata || {};
  const sectionsMap = metadata.section || {};
  const sectionDetailMap = metadata.section_detail || {};
  const rawItems = Array.isArray(bundle?.hadiths)
    ? bundle.hadiths
    : Array.isArray(bundle?.data)
      ? bundle.data
      : Array.isArray(bundle)
        ? bundle
        : [];

  const items = rawItems.map((item, index) => {
    const hadithNumber = Number(item.hadithnumber || item.hadithNumber || item.number || index + 1);
    return {
      id: `${collectionId}_${hadithNumber}`,
      hadithNumber,
      text: item.text || item.english || item.hadithEnglish || '',
      arab: item.arab || item.arabic || item.hadithArabic || '',
      grades: Array.isArray(item.grades) ? item.grades : item.grade ? [{ name: 'Grade', grade: item.grade }] : [],
      reference: item.reference || { book: item.book || '', hadith: item.hadith || hadithNumber },
      chapterTitle: inferChapterLabel(item, sectionsMap),
    };
  });

  const chapters = Object.entries(sectionsMap).map(([id, title]) => ({
    id,
    title,
    hadithnumber_first: sectionDetailMap[id]?.hadithnumber_first ?? null,
    hadithnumber_last: sectionDetailMap[id]?.hadithnumber_last ?? null,
  }));

  return {
    items,
    chapters,
    metadata,
  };
}

async function fetchRemoteCollectionBundle(collectionId) {
  const cacheKey = normalizeLocalCollectionId(collectionId);
  if (remoteCollectionCache.has(cacheKey)) {
    return remoteCollectionCache.get(cacheKey);
  }

  const promise = (async () => {
    let lastError = null;
    for (const edition of getEditionCandidates(cacheKey)) {
      try {
        const bundle = await fetchJsonWithFallback(`editions/${edition}`);
        return normalizeRemoteBundle(bundle, cacheKey);
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error(`Unsupported hadith collection: ${collectionId}`);
  })();

  remoteCollectionCache.set(cacheKey, promise);
  try {
    return await promise;
  } catch (error) {
    remoteCollectionCache.delete(cacheKey);
    throw error;
  }
}

async function fetchRemotePage(collection, page = 1, limit = 20) {
  try {
    const bundle = await fetchRemoteCollectionBundle(collection);
    const start = (page - 1) * limit;
    const items = bundle.items.slice(start, start + limit);
    safeSetJSON(pageCacheKey(collection, page), items);
    return { data: items, hasMore: start + limit < bundle.items.length };
  } catch (error) {
    logError('hadith:fetchRemotePage', error, { collection, page, limit });
    return { data: [], hasMore: false, error: error.message };
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

  const cached = safeGetJSON(pageCacheKey(collection, page), null);
  if (Array.isArray(cached)) {
    return { data: cached, hasMore: cached.length >= limit };
  }

  return fetchRemotePage(collection, page, limit);
}

export async function fetchChapters(collection) {
  const localCollection = getLocalCollection(collection);
  if (localCollection) return localCollection.chapters || [];

  const cacheKey = `${CHAPTER_CACHE_PREFIX}${collection}`;
  const cached = safeGetJSON(cacheKey, null);
  if (Array.isArray(cached)) return cached;

  try {
    const bundle = await fetchRemoteCollectionBundle(collection);
    safeSetJSON(cacheKey, bundle.chapters);
    return bundle.chapters;
  } catch (error) {
    logWarn('hadith:fetchChapters', `Falling back to empty chapter list for ${collection}`, error);
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

  const bookRef = h.reference?.book ? `Book ${h.reference.book}` : collectionName;
  const hadithRef = h.reference?.hadith ? `Hadith ${h.reference.hadith}` : h.hadithNumber;
  return {
    id: `${collectionId}_${h.hadithNumber}`,
    number: String(h.hadithNumber),
    arabic: h.arab || h.hadithArabic || '',
    english: h.text || h.hadithEnglish || '',
    urdu: '',
    reference: `${bookRef}${hadithRef ? ` · ${hadithRef}` : ''}`,
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

      updateMeta(collectionId, {
        status: 'downloading',
        totalExpected,
        downloadedCount: 0,
        active: true,
      });

      try {
        const bundle = await fetchRemoteCollectionBundle(collectionApiName);
        await persistCollectionSnapshot(collectionId, collectionApiName, bundle.items, totalExpected || bundle.items.length, {
          status: 'downloaded',
          resumePage: null,
          lastError: null,
          active: false,
        });
        dequeue(collectionId);
      } catch (error) {
        logError('hadith:downloadCollection', error, { collectionId, collectionApiName });
        updateMeta(collectionId, {
          status: 'error',
          lastError: error.message,
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

export async function clearHadithOfflineData() {
  const all = await idbGetAllCollections();
  await Promise.all(all.map((item) => idbDeleteCollection(item.id)));
  writeMeta({});
}

export async function getOfflineStorageUsageBytes() {
  try {
    const all = await idbGetAllCollections();
    return all.reduce((sum, item) => sum + (item.bytes || 0), 0);
  } catch (error) {
    logError('hadith:storageUsage', error);
    return 0;
  }
}
