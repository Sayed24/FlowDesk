import { initDB, getStore } from "./db/indexeddb.js";

const list = document.getElementById("taskList");
const addBtn = document.getElementById("addTaskBtn");

await initDB();
renderTasks();

addBtn.addEventListener("click", () => {
  const title = prompt("Task title?");
  if (!title) return;

  const task = {
    id: crypto.randomUUID(),
    title,
    completed: false,
    createdAt: Date.now()
  };

  const store = getStore("tasks", "readwrite");
  store.add(task).onsuccess = renderTasks;
});

function renderTasks() {
  list.innerHTML = "";

  const store = getStore("tasks");
  store.getAll().onsuccess = (e) => {
    e.target.result.forEach(task => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${task.title}</h3>
        <button data-id="${task.id}">🗑️</button>
      `;
      card.querySelector("button").onclick = () => deleteTask(task.id);
      list.appendChild(card);
    });
  };
}

function deleteTask(id) {
  const store = getStore("tasks", "readwrite");
  store.delete(id).onsuccess = renderTasks;
}
