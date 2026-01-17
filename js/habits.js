/* ===============================
   FlowDesk — Habits Module
   File: js/habits.js
   =============================== */

document.addEventListener("DOMContentLoaded", () => {
  loadHabits();
  bindFAB();
});

/* ---------- LOAD ---------- */
async function loadHabits() {
  const habits = await db.getAll("habits");
  const list = document.getElementById("habit-list");

  list.innerHTML = "";

  habits.forEach(habit => {
    renderHabit(habit);
  });
}

/* ---------- RENDER ---------- */
function renderHabit(habit) {
  const item = document.createElement("div");
  item.className = "habit-item fade-in";

  const today = new Date().toDateString();
  const completed = habit.completedDates?.includes(today);

  item.innerHTML = `
    <h4>${habit.name}</h4>
    <button class="${completed ? "done" : ""}">
      ${completed ? "✔ Done" : "Mark Done"}
    </button>
  `;

  item.querySelector("button").onclick = () =>
    toggleHabit(habit, today);

  document.getElementById("habit-list").appendChild(item);
}

/* ---------- ADD ---------- */
function bindFAB() {
  document.addEventListener("fab:click", async () => {
    const name = prompt("Habit name");
    if (!name) return;

    const habit = {
      id: Date.now(),
      name,
      completedDates: [],
      createdAt: Date.now()
    };

    await db.add("habits", habit);
    loadHabits();
  });
}

/* ---------- TOGGLE ---------- */
async function toggleHabit(habit, today) {
  habit.completedDates = habit.completedDates || [];

  if (habit.completedDates.includes(today)) {
    habit.completedDates =
      habit.completedDates.filter(d => d !== today);
  } else {
    habit.completedDates.push(today);
  }

  await db.update("habits", habit);
  loadHabits();
}
