// ================================
// FlowDesk Tasks Module
// ================================

// ---- State ----
let tasks = [];
let editingTaskId = null;

// ---- Elements ----
const todoCol = document.getElementById("todoTasks");
const progressCol = document.getElementById("progressTasks");
const doneCol = document.getElementById("doneTasks");

const addBtn = document.getElementById("addTaskBtn");
const modal = document.getElementById("taskModal");
const closeModalBtn = document.getElementById("closeModal");
const saveTaskBtn = document.getElementById("saveTask");

const titleInput = document.getElementById("taskTitle");
const descInput = document.getElementById("taskDescription");
const priorityInput = document.getElementById("taskPriority");

// ---- Init ----
loadTasks();
renderTasks();
setupDnD();

// ---- Events ----
addBtn.addEventListener("click", openCreateModal);
closeModalBtn.addEventListener("click", closeModal);
saveTaskBtn.addEventListener("click", saveTask);

// ---- Modal Logic ----
function openCreateModal() {
  editingTaskId = null;
  titleInput.value = "";
  descInput.value = "";
  priorityInput.value = "medium";
  modal.classList.remove("hidden");
}

function openEditModal(task) {
  editingTaskId = task.id;
  titleInput.value = task.title;
  descInput.value = task.description || "";
  priorityInput.value = task.priority;
  modal.classList.remove("hidden");
}

function closeModal() {
  modal.classList.add("hidden");
}

// ---- CRUD ----
function saveTask() {
  const title = titleInput.value.trim();
  if (!title) return alert("Task title is required");

  if (editingTaskId) {
    const task = tasks.find(t => t.id === editingTaskId);
    task.title = title;
    task.description = descInput.value.trim();
    task.priority = priorityInput.value;
  } else {
    tasks.push({
      id: crypto.randomUUID(),
      title,
      description: descInput.value.trim(),
      priority: priorityInput.value,
      status: "todo",
      createdAt: Date.now()
    });
  }

  persist();
  renderTasks();
  closeModal();
}

function deleteTask(id) {
  if (!confirm("Delete this task?")) return;
  tasks = tasks.filter(t => t.id !== id);
  persist();
  renderTasks();
}

// ---- Rendering ----
function renderTasks() {
  todoCol.innerHTML = "";
  progressCol.innerHTML = "";
  doneCol.innerHTML = "";

  tasks.forEach(task => {
    const card = document.createElement("div");
    card.className = `task-card priority-${task.priority}`;
    card.draggable = true;
    card.dataset.id = task.id;

    card.innerHTML = `
      <h4>${task.title}</h4>
      ${task.description ? `<p>${task.description}</p>` : ""}
      <div class="task-actions">
        <button class="edit">✏️</button>
        <button class="delete">🗑️</button>
      </div>
    `;

    card.querySelector(".edit").onclick = () => openEditModal(task);
    card.querySelector(".delete").onclick = () => deleteTask(task.id);

    card.addEventListener("dragstart", handleDragStart);

    if (task.status === "todo") todoCol.appendChild(card);
    if (task.status === "progress") progressCol.appendChild(card);
    if (task.status === "done") doneCol.appendChild(card);
  });
}

// ---- Drag & Drop ----
let draggedId = null;

function handleDragStart(e) {
  draggedId = e.target.dataset.id;
}

function setupDnD() {
  document.querySelectorAll(".kanban-column").forEach(col => {
    col.addEventListener("dragover", e => {
      e.preventDefault();
      col.classList.add("drag-over");
    });

    col.addEventListener("dragleave", () => {
      col.classList.remove("drag-over");
    });

    col.addEventListener("drop", () => {
      col.classList.remove("drag-over");
      if (!draggedId) return;

      const task = tasks.find(t => t.id === draggedId);
      task.status = col.dataset.status;

      draggedId = null;
      persist();
      renderTasks();
    });
  });
}

// ---- Persistence ----
function persist() {
  localStorage.setItem("flowdesk_tasks", JSON.stringify(tasks));
}

function loadTasks() {
  const data = localStorage.getItem("flowdesk_tasks");
  if (data) tasks = JSON.parse(data);
}
