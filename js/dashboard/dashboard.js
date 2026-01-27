/* ======================================================
   FlowDesk — Dashboard Controller (Tasks Enabled)
====================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ================= AUTH GUARD ================= */
  const user = AuthService.getCurrentUser();
  if (!user) {
    window.location.href = "login.html";
    return;
  }
   
   ThemeService.init();

const themeToggle = document.getElementById("themeToggle");
themeToggle.addEventListener("click", () => {
  ThemeService.toggleTheme();
});


  /* ================= ELEMENTS ================= */
  const tabs = document.querySelectorAll(".dashboard-sidebar a");
  const contents = document.querySelectorAll(".tab-content");
  const logoutBtn = document.getElementById("logoutBtn");

  const taskList = document.getElementById("taskList");

  /* ================= TAB SWITCHING ================= */
  tabs.forEach(tab => {
    tab.addEventListener("click", e => {
      e.preventDefault();

      tabs.forEach(t => t.classList.remove("active"));
      contents.forEach(c => c.classList.remove("active"));

      tab.classList.add("active");
      document.getElementById(tab.dataset.tab).classList.add("active");
    });
  });

  /* ================= LOGOUT ================= */
  logoutBtn.addEventListener("click", () => {
    AuthService.logout();
    window.location.href = "login.html";
  });

  /* ================= TASK UI ================= */

  // Inject task input UI
  taskList.insertAdjacentHTML("beforebegin", `
    <div class="task-input">
      <input type="text" id="newTaskInput" placeholder="Add a new task..." />
      <button id="addTaskBtn">Add</button>
    </div>
  `);

  const newTaskInput = document.getElementById("newTaskInput");
  const addTaskBtn = document.getElementById("addTaskBtn");

  /* ================= RENDER TASKS ================= */
  const renderTasks = () => {
    const tasks = TaskService.getTasks();

    if (tasks.length === 0) {
      taskList.innerHTML = `<p class="muted">No tasks yet</p>`;
      return;
    }

    taskList.innerHTML = tasks.map(task => `
      <div class="task-item ${task.completed ? "done" : ""}">
        <span data-id="${task.id}" class="task-title">
          ${task.title}
        </span>
        <button data-delete="${task.id}" class="delete-btn">✕</button>
      </div>
    `).join("");
  };

  /* ================= ADD TASK ================= */
  addTaskBtn.addEventListener("click", () => {
    const title = newTaskInput.value.trim();
    if (!title) return;

    TaskService.addTask(title);
    newTaskInput.value = "";
    renderTasks();
  });

  newTaskInput.addEventListener("keydown", e => {
    if (e.key === "Enter") addTaskBtn.click();
  });

  /* ================= TASK ACTIONS ================= */
  taskList.addEventListener("click", e => {

    // Toggle complete
    if (e.target.classList.contains("task-title")) {
      TaskService.toggleTask(e.target.dataset.id);
      renderTasks();
    }

    // Delete
    if (e.target.dataset.delete) {
      TaskService.deleteTask(e.target.dataset.delete);
      renderTasks();
    }

  });

  /* ================= INITIAL LOAD ================= */
  renderTasks();

});

