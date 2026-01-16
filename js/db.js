/* ===============================
   FlowDesk — IndexedDB Layer
   File: js/db.js
   =============================== */

let db;

/* ---------- INIT DB ---------- */
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("flowdesk-db", 1);

    request.onupgradeneeded = e => {
      db = e.target.result;

      if (!db.objectStoreNames.contains("tasks")) {
        db.createObjectStore("tasks", { keyPath: "id", autoIncrement: true });
      }

      if (!db.objectStoreNames.contains("notes")) {
        db.createObjectStore("notes", { keyPath: "id", autoIncrement: true });
      }

      if (!db.objectStoreNames.contains("goals")) {
        db.createObjectStore("goals", { keyPath: "id", autoIncrement: true });
      }

      if (!db.objectStoreNames.contains("habits")) {
        db.createObjectStore("habits", { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = e => {
      db = e.target.result;
      resolve();
    };

    request.onerror = () => reject("Failed to open IndexedDB");
  });
}

/* ---------- GENERIC HELPERS ---------- */
function tx(store, mode = "readonly") {
  return db.transaction(store, mode).objectStore(store);
}

function getAll(store) {
  return new Promise(resolve => {
    const req = tx(store).getAll();
    req.onsuccess = () => resolve(req.result || []);
  });
}

function add(store, data) {
  return new Promise(resolve => {
    tx(store, "readwrite").add(data).onsuccess = resolve;
  });
}

function update(store, data) {
  return new Promise(resolve => {
    tx(store, "readwrite").put(data).onsuccess = resolve;
  });
}

function remove(store, id) {
  return new Promise(resolve => {
    tx(store, "readwrite").delete(id).onsuccess = resolve;
  });
}

/* ---------- TASKS ---------- */
function getAllTasks() {
  return getAll("tasks");
}

function addTask(task) {
  return add("tasks", {
    title: task.title || "",
    completed: task.completed || false,
    createdAt: task.createdAt || Date.now()
  });
}

/* ---------- NOTES ---------- */
function getAllNotes() {
  return getAll("notes");
}

function addNote(note) {
  return add("notes", {
    title: note.title || "",
    content: note.content || "",
    createdAt: note.createdAt || Date.now()
  });
}

/* ---------- GOALS ---------- */
function getAllGoals() {
  return getAll("goals");
}

function addGoal(goal) {
  return add("goals", {
    title: goal.title || "",
    progress: goal.progress || 0
  });
}

/* ---------- HABITS ---------- */
function getAllHabits() {
  return getAll("habits");
}

function addHabit(habit) {
  return add("habits", {
    title: habit.title || "",
    streak: habit.streak || 0
  });
}
