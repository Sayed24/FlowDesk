// js/db/indexeddb.js
const DB_NAME = "flowdeskDB";
const DB_VERSION = 1;
let db = null;

export function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject("IndexedDB failed");

    request.onupgradeneeded = (e) => {
      db = e.target.result;

      if (!db.objectStoreNames.contains("tasks")) {
        const store = db.createObjectStore("tasks", { keyPath: "id" });
        store.createIndex("completed", "completed");
        store.createIndex("priority", "priority");
        store.createIndex("dueDate", "dueDate");
      }

      if (!db.objectStoreNames.contains("notes")) {
        db.createObjectStore("notes", { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains("goals")) {
        db.createObjectStore("goals", { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains("habits")) {
        db.createObjectStore("habits", { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains("users")) {
        db.createObjectStore("users", { keyPath: "email" });
      }
    };

    request.onsuccess = (e) => {
      db = e.target.result;
      resolve(db);
    };
  });
}

export function getStore(storeName, mode = "readonly") {
  const tx = db.transaction(storeName, mode);
  return tx.objectStore(storeName);
}
