// js/backup.js
import { initDB, getStore } from "./db/indexeddb.js";

await initDB();

const STORES = ["tasks", "notes", "goals", "habits", "team"];

/* ============================
   EXPORT BACKUP (JSON)
============================ */
export async function exportBackup() {
  const data = {};

  for (const storeName of STORES) {
    data[storeName] = await getAll(storeName);
  }

  const blob = new Blob(
    [JSON.stringify(data, null, 2)],
    { type: "application/json" }
  );

  download(blob, `flowdesk-backup-${Date.now()}.json`);
}

/* ============================
   IMPORT BACKUP (JSON)
============================ */
export async function importBackup(file) {
  const text = await file.text();
  const data = JSON.parse(text);

  for (const storeName of STORES) {
    if (!data[storeName]) continue;

    const store = getStore(storeName, "readwrite");
    data[storeName].forEach(item => store.put(item));
  }

  alert("Backup restored successfully");
}

/* ============================
   HELPERS
============================ */
function getAll(storeName) {
  return new Promise(resolve => {
    const store = getStore(storeName);
    store.getAll().onsuccess = e => resolve(e.target.result);
  });
}

function download(blob, filename) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

