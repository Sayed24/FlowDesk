// Initialize IndexedDB
const DB_NAME = "focusflowDB";
const DB_VERSION = 1;
let db;

function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => reject("DB failed to open");
    request.onsuccess = (event) => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      db = event.target.result;

      if (!db.objectStoreNames.contains("tasks")) {
        const store = db.createObjectStore("tasks", { keyPath: "id" });
        store.createIndex("title", "title", { unique: false });
        store.createIndex("priority", "priority", { unique: false });
        store.createIndex("dueDate", "dueDate", { unique: false });
      }
    };
  });
}
