const DB_NAME = 'flowdeskDB';
const DB_VERSION = 3;
const STORES = ['users','tasks','notes','goals','habits','events','team','activity'];
let dbPromise;

export function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      for (const name of STORES) {
        if (!db.objectStoreNames.contains(name)) {
          const store = db.createObjectStore(name, { keyPath: name === 'users' ? 'email' : 'id' });
          if (name !== 'users') store.createIndex('ownerId', 'ownerId', { unique: false });
        }
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

async function tx(storeName, mode='readonly') {
  const db = await openDB();
  return db.transaction(storeName, mode).objectStore(storeName);
}

export async function get(storeName, key) {
  const store = await tx(storeName);
  return requestToPromise(store.get(key));
}

export async function getAll(storeName) {
  const store = await tx(storeName);
  return requestToPromise(store.getAll());
}

export async function getAllByOwner(storeName, ownerId) {
  const store = await tx(storeName);
  if (!store.indexNames.contains('ownerId')) return [];
  return requestToPromise(store.index('ownerId').getAll(ownerId));
}

export async function put(storeName, value) {
  const store = await tx(storeName, 'readwrite');
  return requestToPromise(store.put(value));
}

export async function remove(storeName, key) {
  const store = await tx(storeName, 'readwrite');
  return requestToPromise(store.delete(key));
}

export async function clearOwner(storeName, ownerId) {
  const rows = await getAllByOwner(storeName, ownerId);
  await Promise.all(rows.map(row => remove(storeName, row.id)));
}

export async function replaceOwnerData(storeName, ownerId, rows) {
  await clearOwner(storeName, ownerId);
  for (const row of rows) await put(storeName, { ...row, ownerId });
}

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
