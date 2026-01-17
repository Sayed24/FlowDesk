/* ===============================
   FlowDesk — Tasks Module
   File: js/tasks.js
   =============================== */

let draggedTask = null;

/* ---------- INIT ---------- */
document.addEventListener("DOMContentLoaded", () => {
  loadTasks();
  bindFAB();
  enableDragAndDrop();
});

/* ---------- LOAD TASKS ---------- */
async function loadTasks() {
  const tasks = await db.getAll("tasks");

  clearLists();

  tasks.forEach(task => {
    renderTask(task);
  });
}

/* ---------- CLEAR UI ---------- */
function clearLists() {
  ["todo", "doing", "done"].forEach(status => {
    const list = document.getElementById(`${status}-list`);
    if (list) list.innerHTML = "";
  });
}

/* ---------- RENDER ---------- */
function renderTask(task) {
  const card = document.createElement("div");
  card.className = "task-card fade-in";
  card.draggable = true;
  card.dataset.id = task.id;

  card.innerHTML = `
    <h4>${task.title}</h4>
    <p>${task.description || ""}</p>
    <div class="task-actions">
      <button data-edit>✏️</button>
      <button data-delete>🗑</button>
    </div>
  `;

  card.addEventListener("dragstart", () => draggedTask = card);
  card.addEventListener("dragend", () => draggedTask = null);

  card.querySelector("[data-delete]").onclick = () => deleteTask(task.id);
  card.querySelector("[data-edit]").onclick = () => editTask(task);

  document.getElementById(`${task.status}-list`).appendChild(card);
}

/* ---------- ADD TASK ---------- */
function bindFAB() {
  document.addEventListener("fab:click", async () => {
    const title = prompt("Task title");
    if (!title) return;

    const task = {
      id: Date.now(),
      title,
      description: "",
      status: "todo",
      createdAt: Date.now()
    };

    await db.add("tasks", task);
    renderTask(task);
  });
}

/* ---------- DELETE ---------- */
async function deleteTask(id) {
  await db.delete("tasks", id);
  loadTasks();
}

/* ---------- EDIT ---------- */
async function editTask(task) {
  const title = prompt("Edit task title", task.title);
  if (!title) return;

  task.title = title;
  await db.update("tasks", task);
  loadTasks();
}

/* ---------- DRAG & DROP ---------- */
function enableDragAndDrop() {
  document.querySelectorAll(".task-list").forEach(list => {
    list.addEventListener("dragover", e => e.preventDefault());

    list.addEventListener("drop", async () => {
      if (!draggedTask) return;

      const id = Number(draggedTask.dataset.id);
      const status = list.parentElement.dataset.status;

      const task = await db.get("tasks", id);
      task.status = status;

      await db.update("tasks", task);
      loadTasks();
    });
  });
}
