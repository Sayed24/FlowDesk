let habits = [];

const grid = document.getElementById("habitsGrid");
const addBtn = document.getElementById("addHabitBtn");

const modal = document.getElementById("habitModal");
const closeBtn = document.getElementById("closeHabitModal");
const saveBtn = document.getElementById("saveHabit");
const titleInput = document.getElementById("habitTitle");

load();
render();

addBtn.onclick = () => modal.classList.remove("hidden");
closeBtn.onclick = () => modal.classList.add("hidden");
saveBtn.onclick = saveHabit;

function saveHabit() {
  const title = titleInput.value.trim();
  if (!title) return alert("Habit name required");

  habits.push({
    id: crypto.randomUUID(),
    title,
    streak: 0,
    lastCheck: null,
    history: []
  });

  titleInput.value = "";
  modal.classList.add("hidden");

  persist();
  render();
}

function checkIn(id) {
  const today = new Date().toDateString();

  habits = habits.map(h => {
    if (h.id !== id) return h;

    if (h.lastCheck === today) return h;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (h.lastCheck === yesterday.toDateString()) {
      h.streak += 1;
    } else {
      h.streak = 1;
    }

    h.lastCheck = today;
    h.history.push(today);

    return h;
  });

  persist();
  render();
}

function deleteHabit(id) {
  if (!confirm("Delete this habit?")) return;
  habits = habits.filter(h => h.id !== id);
  persist();
  render();
}

function render() {
  grid.innerHTML = "";

  habits.forEach(habit => {
    const card = document.createElement("div");
    card.className = "habit-card";

    card.innerHTML = `
      <h3>${habit.title}</h3>
      <div class="streak">🔥 ${habit.streak} day streak</div>

      <button class="btn check-btn"
        onclick="(${checkIn})('${habit.id}')">
        Check in today
      </button>

      <div class="habit-actions">
        <button onclick="(${deleteHabit})('${habit.id}')">🗑️</button>
      </div>
    `;

    grid.appendChild(card);
  });
}

function persist() {
  localStorage.setItem("flowdesk_habits", JSON.stringify(habits));
}

function load() {
  const data = localStorage.getItem("flowdesk_habits");
  if (data) habits = JSON.parse(data);
}

