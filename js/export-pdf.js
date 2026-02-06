
// js/export-pdf.js
import { initDB, getStore } from "./db/indexeddb.js";

await initDB();

const { jsPDF } = window.jspdf;

document.getElementById("exportPdfBtn")?.addEventListener("click", exportPDF);

async function exportPDF() {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("FlowDesk Dashboard Summary", 14, 20);

  const stats = await loadStats();

  doc.setFontSize(12);
  doc.text(`Tasks Completed: ${stats.tasks.completed}`, 14, 40);
  doc.text(`Tasks Pending: ${stats.tasks.pending}`, 14, 50);

  doc.text(`Goals Completed: ${stats.goals.done}`, 14, 65);
  doc.text(`Goals Active: ${stats.goals.active}`, 14, 75);

  doc.text(`Strong Habits: ${stats.habits.streak}`, 14, 90);
  doc.text(`Weak Habits: ${stats.habits.missed}`, 14, 100);

  doc.save("flowdesk-dashboard.pdf");
}

async function loadStats() {
  return {
    tasks: {
      completed: await count("tasks", t => t.completed),
      pending: await count("tasks", t => !t.completed)
    },
    goals: {
      done: await count("goals", g => g.progress >= 100),
      active: await count("goals", g => g.progress < 100)
    },
    habits: {
      streak: await count("habits", h => h.streak >= 7),
      missed: await count("habits", h => h.streak < 7)
    }
  };
}

function count(storeName, predicate) {
  return new Promise(resolve => {
    const store = getStore(storeName);
    store.getAll().onsuccess = e =>
      resolve(e.target.result.filter(predicate).length);
  });
}
