// js/export-csv.js
import { initDB, getStore } from "./db/indexeddb.js";

await initDB();

export async function exportCSV(storeName) {
  const store = getStore(storeName);

  store.getAll().onsuccess = e => {
    const items = e.target.result;
    if (!items.length) return alert("Nothing to export");

    const headers = Object.keys(items[0]);
    const rows = items.map(obj =>
      headers.map(h => JSON.stringify(obj[h] ?? "")).join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    download(blob, `flowdesk-${storeName}.csv`);
  };
}

function download(blob, filename) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
