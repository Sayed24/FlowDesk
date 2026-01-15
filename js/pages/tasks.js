document.addEventListener("DOMContentLoaded", async () => {
  await initDB();
  const tasksGrid = document.querySelector(".tasks-grid");
  const taskSearch = document.getElementById("task-search");
  const taskFilter = document.getElementById("task-filter-priority");

  // Render all tasks
  async function renderTasks() {
    let tasks = await getAllTasks();

    // Filter by search
    const searchVal = taskSearch.value.toLowerCase();
    tasks = tasks.filter(t => t.title.toLowerCase().includes(searchVal));

    // Filter by priority
    const priorityVal = taskFilter.value;
    if (priorityVal) tasks = tasks.filter(t => t.priority === priorityVal);

    tasksGrid.innerHTML = "";
    tasks.forEach(task => {
      const card = document.createElement("div");
      card.className = "card task-card";
      card.innerHTML = `
        <h3>${task.title}</h3>
        <p>${task.description || ""}</p>
        <p><strong>Due:</strong> ${task.dueDate || "N/A"}</p>
        <p><strong>Priority:</strong> ${task.priority || "Low"}</p>
        <div class="task-actions">
          <button class="edit-btn">✏️ Edit</button>
          <button class="delete-btn">🗑️ Delete</button>
        </div>
      `;
      // Edit button
      card.querySelector(".edit-btn").addEventListener("click", () => openTaskModal(task));
      // Delete button
      card.querySelector(".delete-btn").addEventListener("click", async () => {
        await deleteTask(task.id);
        renderTasks();
      });

      tasksGrid.appendChild(card);
    });
  }

  // Initial render
  renderTasks();

  // Search & filter events
  taskSearch.addEventListener("input", renderTasks);
  taskFilter.addEventListener("change", renderTasks);

  // Floating Action Button opens modal
  const fab = document.querySelector(".fab");
  fab.addEventListener("click", () => openTaskModal());

  // Modal logic
  const modal = document.createElement("div");
  modal.className = "modal";
  document.body.appendChild(modal);

  function openTaskModal(task = {}) {
    modal.classList.add("open");
    modal.innerHTML = `
      <div class="modal-header">${task.id ? "Edit Task" : "Add Task"}</div>
      <div class="modal-body">
        <input id="task-title" placeholder="Title" value="${task.title || ""}" />
        <textarea id="task-desc" placeholder="Description">${task.description || ""}</textarea>
        <input id="task-due" type="date" value="${task.dueDate || ""}" />
        <select id="task-priority">
          <option value="high" ${task.priority === "high" ? "selected" : ""}>High</option>
          <option value="medium" ${task.priority === "medium" ? "selected" : ""}>Medium</option>
          <option value="low" ${task.priority === "low" ? "selected" : ""}>Low</option>
        </select>
      </div>
      <div class="modal-footer">
        <button id="save-task">💾 Save</button>
        <button id="cancel-task">❌ Cancel</button>
      </div>
    `;

    // Save button
    modal.querySelector("#save-task").addEventListener("click", async () => {
      const newTask = {
        id: task.id || undefined,
        title: modal.querySelector("#task-title").value,
        description: modal.querySelector("#task-desc").value,
        dueDate: modal.querySelector("#task-due").value,
        priority: modal.querySelector("#task-priority").value
      };

      if (task.id) await updateTask(newTask);
      else await addTask(newTask);

      modal.classList.remove("open");
      renderTasks();
    });

    // Cancel button
    modal.querySelector("#cancel-task").addEventListener("click", () => modal.classList.remove("open"));
  }
});
