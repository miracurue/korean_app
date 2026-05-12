/**
 * Generic IndexedDB session helpers used by LocalMediaPlayer
 * to persist uploaded file handles across page reloads.
 *
 * Each call accepts a `dbName` so video and audio sessions
 * are stored separately and don't overwrite each other.
 */

const STORE_NAME = 'files_store';
const SESSION_KEY = 'current_session';

function openDB(dbName: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

export async function saveSession(dbName: string, data: Record<string, unknown>): Promise<void> {
  try {
    const db = await openDB(dbName);
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(data, SESSION_KEY);
  } catch (e) {
    console.error(`[indexedDB] Failed to save session (${dbName}):`, e);
  }
}

export async function loadSession<T>(dbName: string): Promise<T | null> {
  try {
    const db = await openDB(dbName);
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get(SESSION_KEY);
    return new Promise((resolve) => {
      request.onsuccess = () => resolve((request.result as T) || null);
      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function clearSession(dbName: string): Promise<void> {
  try {
    const db = await openDB(dbName);
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(SESSION_KEY);
  } catch {
    // Silently ignore — not critical
  }
}
