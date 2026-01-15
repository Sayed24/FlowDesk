document.addEventListener("DOMContentLoaded", async () => {
  await initDB();
  const tasksGrid = document.querySelector(".tasks-grid");
  const searchInput = document.getElementById("task-search");
  const filterSelect = document.getElementById("task-filter-priority");

  // Render tasks
  async function renderTasks() {
    let tasks = await getAllTasks();

    // Apply search filter
    const search = searchInput.value.toLowerCase();
    if (search) {
      tasks = tasks.filter(task => task.title.toLowerCase().includes(search));
    }

    // Apply priority filter
    const priority = filterSelect.value;
    if (priority) {
      tasks = tasks.filter(task => task.priority === priority);
    }

    // Clear existing
    tasksGrid.innerHTML = "";

    if (tasks.length === 0) {
      tasksGrid.innerHTML = "<p>No tasks found. Click ➕ to add one!</p>";
      return;
    }

    tasks.forEach(task => {
      const card = document.createElement("div");
      card.classList.add("card", "task-card");
      card.innerHTML = `
        <h3>${task.title}</h3>
        <p>${task.description}</p>
        <p><strong>Due:</strong> ${task.dueDate || "N/A"}</p>
        <p><strong>Priority:</strong> ${task.priority || "Medium"}</p>
        <div class="task-actions">
          <button class="edit-btn" data-id="${task.id}">✏️ Edit</button>
          <button class="delete-btn" data-id="${task.id}">🗑️ Delete</button>
        </div>
      `;
      tasksGrid.appendChild(card);
    });
  }

  // Initial render
  renderTasks();

  // Search & filter events
  searchInput.addEventListener("input", renderTasks);
  filterSelect.addEventListener("change", renderTasks);
});
