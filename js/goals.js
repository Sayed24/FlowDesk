let goals = [];
let editingId = null;

const grid = document.getElementById("goalsGrid");
const addBtn = document.getElementById("addGoalBtn");

const modal = document.getElementById("goalModal");
const closeBtn = document.getElementById("closeGoalModal");
const saveBtn = document.getElementById("saveGoal");

const titleInput = document.getElementById("goalTitle");
const descInput = document.getElementById("goalDescription");
const progressInput = document.getElementById("goalProgress");

load();
render();

addBtn.onclick = () => openModal();
closeBtn.onclick = closeModal;
saveBtn.onclick = saveGoal;

function openModal(goal = null) {
  editingId = goal ? goal.id : null;

  titleInput.value = goal?.title || "";
  descInput.value = goal?.description || "";
  progressInput.value = goal?.progress ?? 0;

  modal.classList.remove("hidden");
}

function closeModal() {
  modal.classList.add("hidden");
}

function saveGoal() {
  const title = titleInput.value.trim();
  if (!title) return alert("Goal title required");

  const progress = Math.min(100, Math.max(0, Number(progressInput.value)));

  const goal = {
    id: editingId || crypto.randomUUID(),
    title,
    description: descInput.value,
    progress,
    completed: progress === 100,
    createdAt: Date.now()
  };

  if (editingId) {
    goals = goals.map(g => g.id === editingId ? { ...g, ...goal } : g);
  } else {
    goals.push(goal);
  }

  persist();
  render();
  closeModal();
}

function deleteGoal(id) {
  if (!confirm("Delete this goal?")) return;
  goals = goals.filter(g => g.id !== id);
  persist();
  render();
}

function render() {
  grid.innerHTML = "";

  goals.forEach(goal => {
    const card = document.createElement("div");
    card.className = `goal-card ${goal.completed ? "completed" : ""}`;

    card.innerHTML = `
      <h3>${goal.title}</h3>
      <p>${goal.description || ""}</p>

      <div class="progress-bar">
        <div class="progress-fill" style="width:${goal.progress}%"></div>
      </div>

      <div class="goal-actions">
        <button onclick="(${() => openModal(goal)})()">✏️</button>
        <button onclick="(${deleteGoal})('${goal.id}')">🗑️</button>
      </div>
    `;

    grid.appendChild(card);
  });
}

function persist() {
  localStorage.setItem("flowdesk_goals", JSON.stringify(goals));
}

function load() {
  const data = localStorage.getItem("flowdesk_goals");
  if (data) goals = JSON.parse(data);
}

