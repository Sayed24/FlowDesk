
// js/charts.js
import { initDB, getStore } from "./db/indexeddb.js";

const DEMO_MODE = !localStorage.getItem("session");

await initDB();

/* ============================
   HELPERS
============================ */
function demoData() {
  return {
    tasks: { completed: 7, pending: 5 },
    goals: { done: 3, active: 2 },
    habits: { streak: 12, missed: 4 }
  };
}

function count(storeName, predicate) {
  return new Promise(resolve => {
    const store = getStore(storeName);
    store.getAll().onsuccess = e => {
      resolve(e.target.result.filter(predicate).length);
    };
  });
}

/* ============================
   LOAD DATA
============================ */
async function loadStats() {
  if (DEMO_MODE) return demoData();

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

/* ============================
   CHARTS
============================ */
const stats = await loadStats();

/* Tasks Chart */
new Chart(document.getElementById("tasksChart"), {
  type: "doughnut",
  data: {
    labels: ["Completed", "Pending"],
    datasets: [{
      data: [stats.tasks.completed, stats.tasks.pending],
      backgroundColor: ["#22c55e", "#ef4444"]
    }]
  }
});

/* Goals Chart */
new Chart(document.getElementById("goalsChart"), {
  type: "bar",
  data: {
    labels: ["Completed", "Active"],
    datasets: [{
      data: [stats.goals.done, stats.goals.active],
      backgroundColor: ["#38bdf8", "#6366f1"]
    }]
  },
  options: {
    responsive: true,
    scales: { y: { beginAtZero: true } }
  }
});

/* Habits Chart */
new Chart(document.getElementById("habitsChart"), {
  type: "line",
  data: {
    labels: ["Strong", "Weak"],
    datasets: [{
      data: [stats.habits.streak, stats.habits.missed],
      borderColor: "#f59e0b",
      fill: false,
      tension: 0.4
    }]
  }
});
