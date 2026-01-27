/* ======================================================
   FlowDesk — Dashboard Controller
====================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const tabs = document.querySelectorAll(".dashboard-sidebar a");
  const tabContents = document.querySelectorAll(".tab-content");
  const logoutBtn = document.getElementById("logoutBtn");

  // --- TAB SWITCHING ---
  tabs.forEach(tab => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();
      const target = tab.dataset.tab;

      // Remove active from all tabs & contents
      tabs.forEach(t => t.classList.remove("active"));
      tabContents.forEach(c => c.classList.remove("active"));

      // Activate selected
      tab.classList.add("active");
      document.getElementById(target).classList.add("active");
    });
  });

  // --- LOGOUT ---
  logoutBtn.addEventListener("click", () => {
    AuthService.logout();
    window.location.href = "login.html";
  });

  // --- LOAD TASKS & PROJECTS ---
  const taskList = document.getElementById("taskList");
  const projectList = document.getElementById("projectList");

  const tasks = [
    { id: 1, title: "Design homepage", status: "In Progress" },
    { id: 2, title: "Fix login bug", status: "Pending" },
    { id: 3, title: "Deploy PWA", status: "Completed" },
  ];

  const projects = [
    { id: 1, name: "Website Redesign", progress: "40%" },
    { id: 2, name: "Mobile App", progress: "70%" },
  ];

  // Render tasks
  taskList.innerHTML = tasks.map(task => `
    <div class="task-item">
      <strong>${task.title}</strong> - <em>${task.status}</em>
    </div>
  `).join("");

  // Render projects
  projectList.innerHTML = projects.map(proj => `
    <div class="project-item">
      <strong>${proj.name}</strong> - <em>${proj.progress} complete</em>
    </div>
  `).join("");

  // --- SETTINGS PANEL ---
  const settingsPanel = document.getElementById("settingsPanel");
  settingsPanel.innerHTML = `
    <p>Here you can customize your FlowDesk settings.</p>
    <button id="clearDataBtn">Clear All Data</button>
  `;

  document.getElementById("clearDataBtn").addEventListener("click", () => {
    if (confirm("Are you sure you want to clear all tasks and projects?")) {
      taskList.innerHTML = "";
      projectList.innerHTML = "";
      alert("All data cleared!");
    }
  });

});
