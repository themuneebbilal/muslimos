import { logError, logWarn } from './logger';

function getStorage() {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  return window.localStorage;
}

export function safeGetItem(key, fallback = null) {
  try {
    const storage = getStorage();
    if (!storage) return fallback;
    const value = storage.getItem(key);
    return value ?? fallback;
  } catch (error) {
    logWarn('storage:getItem', `Falling back for key "${key}"`, error);
    return fallback;
  }
}

export function safeGetJSON(key, fallback = null) {
  const raw = safeGetItem(key, null);
  if (raw === null || raw === undefined || raw === '') return fallback;

  try {
    return JSON.parse(raw);
  } catch (error) {
    logWarn('storage:getJSON', `Invalid JSON for key "${key}"`, error);
    return fallback;
  }
}

export function safeSetItem(key, value) {
  try {
    const storage = getStorage();
    if (!storage) return false;
    storage.setItem(key, String(value));
    return true;
  } catch (error) {
    logError('storage:setItem', error, { key });
    return false;
  }
}

export function safeSetJSON(key, value) {
  try {
    return safeSetItem(key, JSON.stringify(value));
  } catch (error) {
    logError('storage:setJSON', error, { key });
    return false;
  }
}

export function safeRemoveItem(key) {
  try {
    const storage = getStorage();
    if (!storage) return false;
    storage.removeItem(key);
    return true;
  } catch (error) {
    logError('storage:removeItem', error, { key });
    return false;
  }
}

export function safeKeys(prefix = '') {
  try {
    const storage = getStorage();
    if (!storage) return [];
    const keys = [];
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (key && key.startsWith(prefix)) keys.push(key);
    }
    return keys.sort();
  } catch (error) {
    logError('storage:keys', error, { prefix });
    return [];
  }
}

export function clearKeys(keys) {
  return keys.reduce((count, key) => (safeRemoveItem(key) ? count + 1 : count), 0);
}

export function getStorageUsageBytes(prefix = '') {
  try {
    const storage = getStorage();
    if (!storage) return 0;
    return safeKeys(prefix).reduce((sum, key) => {
      const value = storage.getItem(key) || '';
      return sum + new Blob([key, value]).size;
    }, 0);
  } catch (error) {
    logError('storage:usage', error, { prefix });
    return 0;
  }
}

export function exportPrefixedStorage(prefix = 'mos_') {
  const payload = {};
  safeKeys(prefix).forEach((key) => {
    payload[key] = safeGetJSON(key, undefined);
    if (payload[key] === undefined) {
      payload[key] = safeGetItem(key, null);
    }
  });
  return payload;
}

export function importPrefixedStorage(data, prefix = 'mos_') {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Invalid import payload');
  }

  Object.entries(data).forEach(([key, value]) => {
    if (!key.startsWith(prefix)) return;
    if (typeof value === 'string') {
      safeSetItem(key, value);
      return;
    }
    safeSetJSON(key, value);
  });
}
