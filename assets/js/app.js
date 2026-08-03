
const routes = {
  dashboard: {
    title: "Dashboard",
    eyebrow: "Overview",
    icon: "⌂",
    mobile: true
  },

  tasks: {
    title: "Tasks",
    eyebrow: "Plan and focus",
    icon: "✓",
    mobile: true
  },

  notes: {
    title: "Notes",
    eyebrow: "Capture ideas",
    icon: "✎",
    mobile: false
  },

  calendar: {
    title: "Calendar",
    eyebrow: "Schedule",
    icon: "▦",
    mobile: true
  },

  goals: {
    title: "Goals",
    eyebrow: "Track progress",
    icon: "◎",
    mobile: false
  },

  habits: {
    title: "Habits",
    eyebrow: "Build consistency",
    icon: "↗",
    mobile: true
  },

  analytics: {
    title: "Analytics",
    eyebrow: "Insights",
    icon: "◫",
    mobile: false
  },

  settings: {
    title: "Settings",
    eyebrow: "Preferences",
    icon: "⚙",
    mobile: true
  }
};

const storageKeys = {
  theme: "flowdesk.theme",
  user: "flowdesk.user",
  tasks: "flowdesk.tasks",
  notes: "flowdesk.notes",
  goals: "flowdesk.goals",
  habits: "flowdesk.habits"
};

const defaultUser = {
  id: "demo",
  name: "Demo User",
  email: "demo@flowdesk.local",
  role: "demo",
  demo: true
};

const state = {
  route: "dashboard",
  theme: "light",
  user: { ...defaultUser },
  sidebarOpen: false
};

const elements = {
  app: document.getElementById("app"),
  view: document.getElementById("view"),

  sidebar: document.getElementById("sidebar"),
  sidebarOverlay: document.getElementById("sidebarOverlay"),
  desktopNav: document.getElementById("desktopNav"),
  mobileNav: document.getElementById("mobileNav"),

  menuBtn: document.getElementById("menuBtn"),
  closeSidebarBtn: document.getElementById("closeSidebarBtn"),

  pageTitle: document.getElementById("pageTitle"),
  pageEyebrow: document.getElementById("pageEyebrow"),

  themeBtn: document.getElementById("themeBtn"),
  themeIcon: document.getElementById("themeIcon"),

  searchBtn: document.getElementById("searchBtn"),
  notificationBtn: document.getElementById("notificationBtn"),
  notificationDot: document.getElementById("notificationDot"),

  profileBtn: document.getElementById("profileBtn"),

  sidebarAvatar: document.getElementById("sidebarAvatar"),
  sidebarUserName: document.getElementById("sidebarUserName"),
  sidebarUserRole: document.getElementById("sidebarUserRole"),

  topbarAvatar: document.getElementById("topbarAvatar"),
  topbarUserName: document.getElementById("topbarUserName"),
  topbarUserRole: document.getElementById("topbarUserRole"),

  demoBanner: document.getElementById("demoBanner"),
  openAuthBtn: document.getElementById("openAuthBtn"),

  fab: document.getElementById("fab"),

  modalRoot: document.getElementById("modalRoot"),
  drawerRoot: document.getElementById("drawerRoot"),
  toastRoot: document.getElementById("toastRoot"),

  loadingTemplate: document.getElementById("loadingTemplate")
};

initialize();

function initialize() {
  loadState();
  seedData();

  renderNavigation();
  renderUser();
  applyTheme();
  bindEvents();

  navigate(getRouteFromHash(), true);

  registerServiceWorker();
}

function loadState() {
  const savedTheme = localStorage.getItem(storageKeys.theme);

  state.theme =
    savedTheme ||
    (
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
    );

  state.user = readJSON(storageKeys.user, defaultUser);
}

function bindEvents() {
  window.addEventListener("hashchange", () => {
    navigate(getRouteFromHash());
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 992) {
      closeSidebar();
    }
  });

  elements.menuBtn.addEventListener("click", openSidebar);
  elements.closeSidebarBtn.addEventListener("click", closeSidebar);
  elements.sidebarOverlay.addEventListener("click", closeSidebar);

  elements.themeBtn.addEventListener("click", toggleTheme);
  elements.searchBtn.addEventListener("click", openSearch);
  elements.notificationBtn.addEventListener("click", openNotifications);
  elements.profileBtn.addEventListener("click", openProfile);

  elements.openAuthBtn.addEventListener("click", openAccountDialog);

  elements.fab.addEventListener("click", handleFab);

  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("keydown", handleKeyboardShortcuts);
  document.addEventListener("submit", handleForms);
}

function getRouteFromHash() {
  const route = window.location.hash
    .replace(/^#\/?/, "")
    .split("?")[0];

  return routes[route]
    ? route
    : "dashboard";
}

function navigate(route, replace = false) {
  const safeRoute = routes[route]
    ? route
    : "dashboard";

  state.route = safeRoute;

  if (replace) {
    history.replaceState(null, "", `#/${safeRoute}`);
  } else if (window.location.hash !== `#/${safeRoute}`) {
    window.location.hash = `#/${safeRoute}`;
    return;
  }

  closeSidebar();

  updatePageChrome();
  renderCurrentView();

  elements.view.focus({
    preventScroll: true
  });
}

function updatePageChrome() {
  const route = routes[state.route];

  elements.pageTitle.textContent = route.title;
  elements.pageEyebrow.textContent = route.eyebrow;

  document.title = `${route.title} — FlowDesk`;

  document.querySelectorAll("[data-route]").forEach(link => {
    const active =
      link.dataset.route === state.route;

    link.classList.toggle("is-active", active);

    if (active) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  elements.fab.hidden =
    state.route === "analytics" ||
    state.route === "settings";
}

function renderNavigation() {
  elements.desktopNav.innerHTML = `
    <ul class="nav-list">
      ${Object.entries(routes).map(([key, route]) => `
        <li>
          <a
            href="#/${key}"
            class="nav-item"
            data-route="${key}"
          >
            <span class="nav-item-icon">${route.icon}</span>
            <span>${escapeHTML(route.title)}</span>
          </a>
        </li>
      `).join("")}
    </ul>
  `;

  elements.mobileNav.innerHTML =
    Object.entries(routes)
      .filter(([, route]) => route.mobile)
      .map(([key, route]) => `
        <a
          href="#/${key}"
          class="mobile-nav-item"
          data-route="${key}"
        >
          <span class="mobile-nav-icon">${route.icon}</span>
          <span>${escapeHTML(route.title)}</span>
        </a>
      `)
      .join("");
}

function renderUser() {
  const initials =
    getInitials(state.user.name);

  elements.sidebarAvatar.textContent = initials;
  elements.topbarAvatar.textContent = initials;

  elements.sidebarUserName.textContent =
    state.user.name;

  elements.topbarUserName.textContent =
    state.user.name;

  elements.sidebarUserRole.textContent =
    state.user.demo
      ? "Demo mode"
      : capitalize(state.user.role);

  elements.topbarUserRole.textContent =
    state.user.demo
      ? "Demo"
      : capitalize(state.user.role);

  elements.demoBanner.hidden =
    !state.user.demo;
}

function renderCurrentView() {
  const renderers = {
    dashboard: renderDashboard,
    tasks: renderTasks,
    notes: renderNotes,
    calendar: renderCalendar,
    goals: renderGoals,
    habits: renderHabits,
    analytics: renderAnalytics,
    settings: renderSettings
  };

  const renderer =
    renderers[state.route] ||
    renderDashboard;

  elements.view.innerHTML =
    renderer();
}

function renderDashboard() {
  const tasks =
    readJSON(storageKeys.tasks, []);

  const notes =
    readJSON(storageKeys.notes, []);

  const goals =
    readJSON(storageKeys.goals, []);

  const habits =
    readJSON(storageKeys.habits, []);

  const completedTasks =
    tasks.filter(task => task.completed).length;

  const completedHabits =
    habits.filter(habit => habit.completedToday).length;

  const score =
    calculateProductivityScore(
      tasks,
      goals,
      habits
    );

  return `
    <section class="page page-enter">
      <div class="dashboard-hero">
        <article class="dashboard-welcome">
          <p class="page-eyebrow">Today's overview</p>

          <h2>
            Good morning,
            ${escapeHTML(firstName(state.user.name))}.
          </h2>

          <p>
            Keep your tasks, notes, goals, habits,
            and calendar organized in one private,
            offline-first workspace.
          </p>

          <div class="dashboard-actions">
            <button
              class="button"
              type="button"
              data-action="new-task"
            >
              Add task
            </button>

            <a
              class="button button-secondary"
              href="#/calendar"
            >
              View calendar
            </a>
          </div>
        </article>

        <article class="dashboard-score">
          <div>
            <p class="score-value">${score}</p>
            <p class="score-label">Productivity score</p>
          </div>
        </article>
      </div>

      <section class="dashboard-stats">
        ${renderStatCard(
          "✓",
          tasks.length,
          "Total tasks",
          `${completedTasks} completed`
        )}

        ${renderStatCard(
          "✎",
          notes.length,
          "Notes",
          "Stored privately"
        )}

        ${renderStatCard(
          "◎",
          goals.length,
          "Goals",
          "Active outcomes"
        )}

        ${renderStatCard(
          "↗",
          completedHabits,
          "Habits today",
          `${habits.length} tracked`
        )}
      </section>

      <div class="dashboard-main">
        <article class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">Today's tasks</h3>
              <p class="card-subtitle">
                Focus on your highest-impact work
              </p>
            </div>

            <a
              href="#/tasks"
              class="button button-small button-secondary"
            >
              View all
            </a>
          </div>

          <div class="card-body">
            <div class="quick-list">
              ${tasks.slice(0, 5).map(task => `
                <div class="quick-item">
                  <input
                    type="checkbox"
                    data-task-toggle="${task.id}"
                    ${task.completed ? "checked" : ""}
                  >

                  <div class="quick-copy">
                    <p class="quick-title">
                      ${escapeHTML(task.title)}
                    </p>

                    <p class="quick-meta">
                      ${capitalize(task.priority)}
                      priority
                    </p>
                  </div>

                  <span class="badge ${priorityBadge(task.priority)}">
                    ${escapeHTML(task.priority)}
                  </span>
                </div>
              `).join("")}
            </div>
          </div>
        </article>

        <aside class="dashboard-column">
          <article class="card">
            <div class="card-header">
              <div>
                <h3 class="card-title">Goal progress</h3>
                <p class="card-subtitle">Current priorities</p>
              </div>
            </div>

            <div class="card-body quick-list">
              ${goals.map(goal => `
                <div>
                  <div class="section-header">
                    <strong class="quick-title">
                      ${escapeHTML(goal.title)}
                    </strong>

                    <span>${goal.progress}%</span>
                  </div>

                  <div class="progress">
                    <div
                      class="progress-bar"
                      style="width:${goal.progress}%"
                    ></div>
                  </div>
                </div>
              `).join("")}
            </div>
          </article>
        </aside>
      </div>
    </section>
  `;
}

function renderTasks() {
  const tasks =
    readJSON(storageKeys.tasks, []);

  return renderPage({
    title: "Tasks",
    description:
      "Create, organize, complete, edit, and remove tasks stored locally in your browser.",

    actionText: "Create task",
    actionName: "new-task",

    body: `
      <section class="task-summary">
        ${renderStatCard(
          "○",
          tasks.filter(task => !task.completed).length,
          "Open",
          "Needs attention"
        )}

        ${renderStatCard(
          "◐",
          tasks.filter(task => task.status === "doing").length,
          "In progress",
          "Currently active"
        )}

        ${renderStatCard(
          "✓",
          tasks.filter(task => task.completed).length,
          "Completed",
          "Finished work"
        )}

        ${renderStatCard(
          "!",
          tasks.filter(task => task.priority === "high").length,
          "High priority",
          "Focus first"
        )}
      </section>

      <div class="task-toolbar">
        <div class="search" style="width:min(100%,420px)">
          <span class="search-icon">⌕</span>

          <input
            id="taskSearch"
            class="search-input"
            type="search"
            placeholder="Search tasks"
          >
        </div>

        <div class="toolbar-group">
          <button class="chip is-active">All</button>
          <button class="chip">Today</button>
          <button class="chip">High priority</button>
        </div>
      </div>

      <section id="taskList" class="task-list">
        ${tasks.map(task =>
          renderTaskItem(task)
        ).join("")}
      </section>
    `
  });
}

function renderTaskItem(task) {
  return `
    <article
      class="task-item
      ${task.completed ? "is-completed" : ""}"
      data-task-card="${task.id}"
    >
      <input
        type="checkbox"
        data-task-toggle="${task.id}"
        ${task.completed ? "checked" : ""}
      >

      <div class="task-content">
        <h3 class="task-title">
          ${escapeHTML(task.title)}
        </h3>

        <div class="task-meta">
          <span class="
            priority-dot
            priority-${escapeHTML(task.priority)}
          "></span>

          <span>
            ${capitalize(task.priority)}
            priority
          </span>

          <span>•</span>

          <span>
            ${escapeHTML(task.status)}
          </span>
        </div>
      </div>

      <div class="task-actions">
        <button
          class="icon-button"
          type="button"
          aria-label="Edit task"
          data-task-edit="${task.id}"
        >
          ✎
        </button>

        <button
          class="icon-button"
          type="button"
          aria-label="Delete task"
          data-task-delete="${task.id}"
        >
          ×
        </button>
      </div>
    </article>
  `;
}

function renderNotes() {
  const notes =
    readJSON(storageKeys.notes, []);

  return renderPage({
    title: "Notes",

    description:
      "Capture ideas, references, meeting notes, and checklists.",

    actionText: "Create note",
    actionName: "new-note",

    body: `
      <section class="notes-grid">
        ${notes.map(note => `
          <article class="note-card">
            <div class="section-header">
              <span class="badge badge-primary">
                ${note.pinned ? "Pinned" : "Note"}
              </span>

              <button
                class="icon-button"
                type="button"
                data-note-delete="${note.id}"
                aria-label="Delete note"
              >
                ×
              </button>
            </div>

            <h3>${escapeHTML(note.title)}</h3>

            <p class="note-preview">
              ${escapeHTML(note.content)}
            </p>
          </article>
        `).join("")}
      </section>
    `
  });
}

function renderGoals() {
  const goals =
    readJSON(storageKeys.goals, []);

  return renderPage({
    title: "Goals",

    description:
      "Track long-term outcomes with measurable progress.",

    actionText: "Create goal",
    actionName: "new-goal",

    body: `
      <section class="goals-grid">
        ${goals.map(goal => `
          <article class="goal-card">
            <div class="section-header">
              <h3>${escapeHTML(goal.title)}</h3>

              <button
                class="icon-button"
                data-goal-delete="${goal.id}"
                aria-label="Delete goal"
              >
                ×
              </button>
            </div>

            <p class="goal-description">
              ${escapeHTML(goal.description)}
            </p>

            <div class="progress">
              <div
                class="progress-bar"
                style="width:${goal.progress}%"
              ></div>
            </div>

            <p class="quick-meta">
              ${goal.progress}% complete
            </p>
          </article>
        `).join("")}
      </section>
    `
  });
}

function renderHabits() {
  const habits =
    readJSON(storageKeys.habits, []);

  return renderPage({
    title: "Habits",

    description:
      "Build consistency with daily check-ins and streak tracking.",

    actionText: "Create habit",
    actionName: "new-habit",

    body: `
      <section class="habit-summary">
        ${renderStatCard(
          "↗",
          habits.length,
          "Tracked habits",
          "Daily and weekly"
        )}

        ${renderStatCard(
          "🔥",
          Math.max(
            ...habits.map(habit => habit.streak),
            0
          ),
          "Best streak",
          "Keep it going"
        )}

        ${renderStatCard(
          "✓",
          habits.filter(
            habit => habit.completedToday
          ).length,
          "Done today",
          "Today's progress"
        )}

        ${renderStatCard(
          "◫",
          "82%",
          "Consistency",
          "Last 30 days"
        )}
      </section>

      <section class="section habit-list">
        ${habits.map(habit => `
          <article class="habit-row">
            <div>
              <h3 class="habit-title">
                ${escapeHTML(habit.title)}
              </h3>

              <span class="quick-meta">
                ${escapeHTML(habit.frequency)}
              </span>
            </div>

            ${habit.week.map((complete, index) => `
              <button
                class="
                  habit-check
                  ${complete ? "is-complete" : ""}
                "
                type="button"
                data-habit-day="${habit.id}:${index}"
              >
                ${complete ? "✓" : ""}
              </button>
            `).join("")}

            <span class="habit-streak">
              🔥 ${habit.streak}
            </span>
          </article>
        `).join("")}
      </section>
    `
  });
}

function renderCalendar() {
  const today = new Date();

  const year = today.getFullYear();
  const month = today.getMonth();

  const monthName =
    today.toLocaleDateString(undefined, {
      month: "long",
      year: "numeric"
    });

  const firstDay =
    new Date(year, month, 1).getDay();

  const totalDays =
    new Date(year, month + 1, 0).getDate();

  const cells = [];

  for (let index = 0; index < firstDay; index++) {
    cells.push(`
      <div class="calendar-day is-outside"></div>
    `);
  }

  for (let day = 1; day <= totalDays; day++) {
    const isToday =
      day === today.getDate();

    cells.push(`
      <button
        class="
          calendar-day
          ${isToday ? "is-today" : ""}
        "
        type="button"
        data-calendar-day="${day}"
      >
        <span class="calendar-day-number">
          ${day}
        </span>

        ${
          isToday
            ? `
              <span class="calendar-event">
                Review FlowDesk
              </span>
            `
            : ""
        }
      </button>
    `);
  }

  return renderPage({
    title: "Calendar",

    description:
      "See your schedule in a responsive monthly calendar.",

    actionText: "Create event",
    actionName: "new-event",

    body: `
      <article class="card calendar-shell">
        <div class="card-body">
          <div class="calendar-toolbar">
            <div class="toolbar-group">
              <button class="icon-button">‹</button>

              <button class="button button-small button-secondary">
                Today
              </button>

              <button class="icon-button">›</button>
            </div>

            <h3 class="section-title">
              ${escapeHTML(monthName)}
            </h3>

            <div class="toolbar-group">
              <button class="chip is-active">Month</button>
              <button class="chip">Agenda</button>
            </div>
          </div>

          <div style="overflow-x:auto">
            <div class="calendar-grid">
              ${[
                "Sun",
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat"
              ].map(day => `
                <div class="calendar-weekday">
                  ${day}
                </div>
              `).join("")}

              ${cells.join("")}
            </div>
          </div>
        </div>
      </article>
    `
  });
}

function renderAnalytics() {
  return renderPage({
    title: "Analytics",

    description:
      "Review productivity metrics generated from local data.",

    body: `
      <section class="analytics-summary">
        ${renderStatCard(
          "✓",
          72,
          "Tasks completed",
          "+12% this month"
        )}

        ${renderStatCard(
          "◷",
          "18h",
          "Focused time",
          "+2.5 hours"
        )}

        ${renderStatCard(
          "◎",
          "64%",
          "Goal progress",
          "Across active goals"
        )}

        ${renderStatCard(
          "↗",
          "82%",
          "Habit consistency",
          "Last 30 days"
        )}
      </section>

      <section class="analytics-grid">
        <article class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">
                Weekly productivity
              </h3>

              <p class="card-subtitle">
                Local demo visualization
              </p>
            </div>
          </div>

          <div class="card-body">
            <div class="chart-container">
              <div class="empty-state">
                <div>
                  <h3>Chart module coming next</h3>

                  <p>
                    This section is ready for Chart.js.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </article>

        <article class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">
                Local insights
              </h3>

              <p class="card-subtitle">
                Rule-based recommendations
              </p>
            </div>
          </div>

          <div class="card-body quick-list">
            <div class="quick-item">
              <div class="stat-icon">↗</div>

              <div class="quick-copy">
                <p class="quick-title">
                  Strong weekly momentum
                </p>

                <p class="quick-meta">
                  You finish more tasks earlier in the week.
                </p>
              </div>
            </div>

            <div class="quick-item">
              <div class="stat-icon">◎</div>

              <div class="quick-copy">
                <p class="quick-title">
                  Goal opportunity
                </p>

                <p class="quick-meta">
                  Your FlowDesk goal has the most recent activity.
                </p>
              </div>
            </div>
          </div>
        </article>
      </section>
    `
  });
}

function renderSettings() {
  return renderPage({
    title: "Settings",

    description:
      "Manage appearance, local data, backups, and preferences.",

    body: `
      <div class="settings-layout">
        <aside class="card settings-nav">
          <ul class="settings-nav-list">
            <li>
              <a class="settings-nav-item is-active" href="#appearance">
                Appearance
              </a>
            </li>

            <li>
              <a class="settings-nav-item" href="#data">
                Data and backup
              </a>
            </li>

            <li>
              <a class="settings-nav-item" href="#shortcuts">
                Keyboard shortcuts
              </a>
            </li>
          </ul>
        </aside>

        <div class="settings-content">
          <section class="settings-section" id="appearance">
            <div class="settings-section-header">
              <h3 class="card-title">Appearance</h3>

              <p class="card-subtitle">
                Customize FlowDesk on this device.
              </p>
            </div>

            <div class="settings-section-body">
              <div class="settings-row">
                <div>
                  <strong>Color theme</strong>

                  <p class="quick-meta">
                    Switch between light and dark mode.
                  </p>
                </div>

                <button
                  class="button button-secondary"
                  data-action="toggle-theme"
                >
                  Toggle theme
                </button>
              </div>
            </div>
          </section>

          <section class="settings-section" id="data">
            <div class="settings-section-header">
              <h3 class="card-title">
                Data and backup
              </h3>

              <p class="card-subtitle">
                Manage local FlowDesk information.
              </p>
            </div>

            <div class="settings-section-body">
              <div class="settings-row">
                <div>
                  <strong>Export backup</strong>

                  <p class="quick-meta">
                    Download all local data as JSON.
                  </p>
                </div>

                <button
                  class="button button-secondary"
                  data-action="export-backup"
                >
                  Export
                </button>
              </div>

              <div class="settings-row">
                <div>
                  <strong>Reset demo data</strong>

                  <p class="quick-meta">
                    Restore starter tasks, notes,
                    goals, and habits.
                  </p>
                </div>

                <button
                  class="button button-danger"
                  data-action="reset-demo"
                >
                  Reset
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    `
  });
}

function renderPage({
  title,
  description,
  actionText = "",
  actionName = "",
  body = ""
}) {
  return `
    <section class="page page-enter">
      <header class="page-header">
        <div>
          <p class="page-eyebrow">
            ${escapeHTML(routes[state.route].eyebrow)}
          </p>

          <h2 class="page-title">
            ${escapeHTML(title)}
          </h2>

          <p class="page-description">
            ${escapeHTML(description)}
          </p>
        </div>

        ${
          actionText
            ? `
              <div class="page-actions">
                <button
                  class="button"
                  type="button"
                  data-action="${escapeHTML(actionName)}"
                >
                  ${escapeHTML(actionText)}
                </button>
              </div>
            `
            : ""
        }
      </header>

      ${body}
    </section>
  `;
}

function renderStatCard(icon, value, label, detail) {
  return `
    <article class="stat-card">
      <div class="stat-icon">${icon}</div>

      <p class="stat-value">
        ${escapeHTML(String(value))}
      </p>

      <p class="stat-label">
        ${escapeHTML(label)}
      </p>

      <span class="stat-detail">
        ${escapeHTML(detail)}
      </span>
    </article>
  `;
}

function openSidebar() {
  state.sidebarOpen = true;

  elements.sidebar.classList.add("is-open");

  elements.sidebarOverlay.hidden = false;

  elements.menuBtn.setAttribute(
    "aria-expanded",
    "true"
  );

  document.body.classList.add("has-overlay");
}

function closeSidebar() {
  state.sidebarOpen = false;

  elements.sidebar.classList.remove("is-open");

  elements.sidebarOverlay.hidden = true;

  elements.menuBtn.setAttribute(
    "aria-expanded",
    "false"
  );

  document.body.classList.remove("has-overlay");
}

function toggleTheme() {
  state.theme =
    state.theme === "dark"
      ? "light"
      : "dark";

  localStorage.setItem(
    storageKeys.theme,
    state.theme
  );

  applyTheme();

  showToast(
    "Theme updated",
    `${capitalize(state.theme)} mode is active.`,
    "success"
  );
}

function applyTheme() {
  document.documentElement.dataset.theme =
    state.theme;

  document.documentElement.style.colorScheme =
    state.theme;

  elements.themeIcon.textContent =
    state.theme === "dark"
      ? "☀️"
      : "🌙";
}

function handleFab() {
  const types = {
    dashboard: "task",
    tasks: "task",
    notes: "note",
    calendar: "event",
    goals: "goal",
    habits: "habit"
  };

  openCreateDialog(
    types[state.route] || "task"
  );
}

function openCreateDialog(type) {
  const labels = {
    task: ["Create task", "Task title"],
    note: ["Create note", "Note title"],
    goal: ["Create goal", "Goal title"],
    habit: ["Create habit", "Habit name"],
    event: ["Create event", "Event title"]
  };

  const [title, label] =
    labels[type] || labels.task;

  openModal(`
    <div class="modal">
      <header class="modal-header">
        <h2 class="modal-title">
          ${escapeHTML(title)}
        </h2>

        <button
          class="icon-button"
          type="button"
          data-close-modal
        >
          ×
        </button>
      </header>

      <form
        id="createItemForm"
        class="modal-body form"
        data-item-type="${escapeHTML(type)}"
      >
        <div class="form-group">
          <label
            class="form-label"
            for="itemTitle"
          >
            ${escapeHTML(label)}
          </label>

          <input
            id="itemTitle"
            class="input"
            name="title"
            required
            maxlength="120"
          >
        </div>

        ${
          type === "task"
            ? `
              <div class="form-row">
                <div class="form-group">
                  <label
                    class="form-label"
                    for="itemPriority"
                  >
                    Priority
                  </label>

                  <select
                    id="itemPriority"
                    class="select"
                    name="priority"
                  >
                    <option value="low">Low</option>
                    <option value="medium" selected>
                      Medium
                    </option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div class="form-group">
                  <label
                    class="form-label"
                    for="itemDueDate"
                  >
                    Due date
                  </label>

                  <input
                    id="itemDueDate"
                    class="input"
                    name="dueDate"
                    type="date"
                  >
                </div>
              </div>
            `
            : ""
        }
      </form>

      <footer class="modal-footer">
        <button
          class="button button-secondary"
          type="button"
          data-close-modal
        >
          Cancel
        </button>

        <button
          class="button"
          type="submit"
          form="createItemForm"
        >
          Save
        </button>
      </footer>
    </div>
  `);

  requestAnimationFrame(() => {
    document.getElementById("itemTitle")?.focus();
  });
}

function openSearch() {
  openModal(`
    <div class="modal">
      <header class="modal-header">
        <h2 class="modal-title">
          Search FlowDesk
        </h2>

        <button
          class="icon-button"
          data-close-modal
        >
          ×
        </button>
      </header>

      <div class="modal-body">
        <div class="search">
          <span class="search-icon">⌕</span>

          <input
            id="globalSearchInput"
            class="search-input"
            type="search"
            placeholder="Search pages"
          >
        </div>

        <div class="quick-list section">
          ${Object.entries(routes).map(([key, route]) => `
            <button
              class="quick-item"
              type="button"
              data-command-route="${key}"
            >
              <span class="stat-icon">
                ${route.icon}
              </span>

              <span class="quick-title">
                ${escapeHTML(route.title)}
              </span>
            </button>
          `).join("")}
        </div>
      </div>
    </div>
  `);

  requestAnimationFrame(() => {
    document.getElementById("globalSearchInput")?.focus();
  });
}

function openNotifications() {
  elements.drawerRoot.innerHTML = `
    <div class="drawer-backdrop" data-close-drawer></div>

    <aside class="drawer">
      <header class="drawer-header">
        <div>
          <h2 class="modal-title">Notifications</h2>

          <p class="card-subtitle">
            Recent local activity
          </p>
        </div>

        <button
          class="icon-button"
          data-close-drawer
        >
          ×
        </button>
      </header>

      <div class="drawer-body quick-list">
        <div class="quick-item">
          <div class="stat-icon">✓</div>

          <div class="quick-copy">
            <p class="quick-title">
              Welcome to FlowDesk
            </p>

            <p class="quick-meta">
              Your local workspace is ready.
            </p>
          </div>
        </div>

        <div class="quick-item">
          <div class="stat-icon">◫</div>

          <div class="quick-copy">
            <p class="quick-title">
              Demo data loaded
            </p>

            <p class="quick-meta">
              Starter items are available.
            </p>
          </div>
        </div>
      </div>
    </aside>
  `;

  elements.notificationDot.hidden = true;
}

function openProfile() {
  openModal(`
    <div class="modal">
      <header class="modal-header">
        <h2 class="modal-title">
          Local profile
        </h2>

        <button
          class="icon-button"
          data-close-modal
        >
          ×
        </button>
      </header>

      <div class="modal-body">
        <div class="user-card">
          <div class="avatar">
            ${getInitials(state.user.name)}
          </div>

          <div class="user-card-copy">
            <strong>
              ${escapeHTML(state.user.name)}
            </strong>

            <span>
              ${escapeHTML(state.user.email)}
            </span>
          </div>
        </div>
      </div>
    </div>
  `);
}

function openAccountDialog() {
  openModal(`
    <div class="modal">
      <header class="modal-header">
        <h2 class="modal-title">
          Create local account
        </h2>

        <button
          class="icon-button"
          data-close-modal
        >
          ×
        </button>
      </header>

      <form
        id="accountForm"
        class="modal-body form"
      >
        <div class="form-group">
          <label class="form-label" for="accountName">
            Name
          </label>

          <input
            id="accountName"
            class="input"
            name="name"
            required
          >
        </div>

        <div class="form-group">
          <label class="form-label" for="accountEmail">
            Email
          </label>

          <input
            id="accountEmail"
            class="input"
            name="email"
            type="email"
            required
          >
        </div>
      </form>

      <footer class="modal-footer">
        <button
          class="button button-secondary"
          type="button"
          data-close-modal
        >
          Cancel
        </button>

        <button
          class="button"
          type="submit"
          form="accountForm"
        >
          Create account
        </button>
      </footer>
    </div>
  `);
}

function openModal(content) {
  elements.modalRoot.innerHTML = `
    <div class="modal-backdrop">
      ${content}
    </div>
  `;
}

function closeModal() {
  elements.modalRoot.innerHTML = "";
}

function closeDrawer() {
  elements.drawerRoot.innerHTML = "";
}

function handleDocumentClick(event) {
  if (
    event.target.closest("[data-close-modal]") ||
    event.target.classList.contains("modal-backdrop")
  ) {
    closeModal();
    return;
  }

  if (event.target.closest("[data-close-drawer]")) {
    closeDrawer();
    return;
  }

  const routeCommand =
    event.target.closest("[data-command-route]");

  if (routeCommand) {
    closeModal();
    navigate(routeCommand.dataset.commandRoute);
    return;
  }

  const action =
    event.target.closest("[data-action]");

  if (action) {
    handleAction(action.dataset.action);
    return;
  }

  const taskToggle =
    event.target.closest("[data-task-toggle]");

  if (taskToggle) {
    toggleTask(
      taskToggle.dataset.taskToggle,
      taskToggle.checked
    );
    return;
  }

  const taskDelete =
    event.target.closest("[data-task-delete]");

  if (taskDelete) {
    deleteTask(taskDelete.dataset.taskDelete);
    return;
  }

  const noteDelete =
    event.target.closest("[data-note-delete]");

  if (noteDelete) {
    deleteRecord(
      storageKeys.notes,
      noteDelete.dataset.noteDelete,
      "Note"
    );

    return;
  }

  const goalDelete =
    event.target.closest("[data-goal-delete]");

  if (goalDelete) {
    deleteRecord(
      storageKeys.goals,
      goalDelete.dataset.goalDelete,
      "Goal"
    );

    return;
  }

  const habitDay =
    event.target.closest("[data-habit-day]");

  if (habitDay) {
    toggleHabitDay(
      habitDay.dataset.habitDay
    );
  }
}

function handleAction(action) {
  const actions = {
    "new-task": () => openCreateDialog("task"),
    "new-note": () => openCreateDialog("note"),
    "new-goal": () => openCreateDialog("goal"),
    "new-habit": () => openCreateDialog("habit"),
    "new-event": () => openCreateDialog("event"),
    "toggle-theme": toggleTheme,
    "export-backup": exportBackup,
    "reset-demo": resetDemoData
  };

  actions[action]?.();
}

function handleForms(event) {
  if (event.target.id === "accountForm") {
    event.preventDefault();

    const formData =
      new FormData(event.target);

    state.user = {
      id: makeId("user"),
      name: String(formData.get("name")).trim(),
      email: String(formData.get("email")).trim(),
      role: "admin",
      demo: false
    };

    writeJSON(
      storageKeys.user,
      state.user
    );

    renderUser();
    closeModal();

    showToast(
      "Account created",
      `Welcome, ${firstName(state.user.name)}.`,
      "success"
    );
  }

  if (event.target.id === "createItemForm") {
    event.preventDefault();

    const formData =
      new FormData(event.target);

    const type =
      event.target.dataset.itemType;

    const title =
      String(formData.get("title")).trim();

    createItem(type, title, formData);

    closeModal();
    renderCurrentView();
  }
}

function createItem(type, title, formData) {
  if (!title) {
    return;
  }

  if (type === "task") {
    const tasks =
      readJSON(storageKeys.tasks, []);

    tasks.unshift({
      id: makeId("task"),
      title,
      priority:
        String(formData.get("priority") || "medium"),
      dueDate:
        String(formData.get("dueDate") || ""),
      status: "todo",
      completed: false
    });

    writeJSON(storageKeys.tasks, tasks);
  }

  if (type === "note") {
    const notes =
      readJSON(storageKeys.notes, []);

    notes.unshift({
      id: makeId("note"),
      title,
      content: "",
      pinned: false
    });

    writeJSON(storageKeys.notes, notes);
  }

  if (type === "goal") {
    const goals =
      readJSON(storageKeys.goals, []);

    goals.unshift({
      id: makeId("goal"),
      title,
      description: "",
      progress: 0
    });

    writeJSON(storageKeys.goals, goals);
  }

  if (type === "habit") {
    const habits =
      readJSON(storageKeys.habits, []);

    habits.unshift({
      id: makeId("habit"),
      title,
      frequency: "Daily",
      streak: 0,
      completedToday: false,
      week: [
        false,
        false,
        false,
        false,
        false,
        false,
        false
      ]
    });

    writeJSON(storageKeys.habits, habits);
  }

  showToast(
    `${capitalize(type)} created`,
    title,
    "success"
  );
}

function toggleTask(id, completed) {
  const tasks =
    readJSON(storageKeys.tasks, []);

  const task =
    tasks.find(item => item.id === id);

  if (!task) {
    return;
  }

  task.completed = completed;

  task.status =
    completed
      ? "done"
      : "todo";

  writeJSON(storageKeys.tasks, tasks);

  renderCurrentView();
}

function deleteTask(id) {
  deleteRecord(
    storageKeys.tasks,
    id,
    "Task"
  );
}

function deleteRecord(key, id, label) {
  const items =
    readJSON(key, []);

  const item =
    items.find(record => record.id === id);

  if (
    !item ||
    !window.confirm(
      `Delete "${item.title}"?`
    )
  ) {
    return;
  }

  writeJSON(
    key,
    items.filter(record => record.id !== id)
  );

  renderCurrentView();

  showToast(
    `${label} deleted`,
    item.title,
    "warning"
  );
}

function toggleHabitDay(value) {
  const [habitId, dayIndexText] =
    value.split(":");

  const dayIndex =
    Number(dayIndexText);

  const habits =
    readJSON(storageKeys.habits, []);

  const habit =
    habits.find(item => item.id === habitId);

  if (!habit) {
    return;
  }

  habit.week[dayIndex] =
    !habit.week[dayIndex];

  habit.completedToday =
    habit.week[new Date().getDay()] || false;

  habit.streak =
    habit.week.filter(Boolean).length;

  writeJSON(storageKeys.habits, habits);

  renderCurrentView();
}

function exportBackup() {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    user: state.user,
    tasks: readJSON(storageKeys.tasks, []),
    notes: readJSON(storageKeys.notes, []),
    goals: readJSON(storageKeys.goals, []),
    habits: readJSON(storageKeys.habits, [])
  };

  const blob =
    new Blob(
      [JSON.stringify(data, null, 2)],
      {
        type: "application/json"
      }
    );

  downloadBlob(
    blob,
    `flowdesk-backup-${
      new Date().toISOString().slice(0, 10)
    }.json`
  );
}

function resetDemoData() {
  if (
    !window.confirm(
      "Reset all FlowDesk data?"
    )
  ) {
    return;
  }

  localStorage.removeItem(storageKeys.tasks);
  localStorage.removeItem(storageKeys.notes);
  localStorage.removeItem(storageKeys.goals);
  localStorage.removeItem(storageKeys.habits);
  localStorage.removeItem(storageKeys.user);

  state.user = {
    ...defaultUser
  };

  seedData();
  renderUser();
  renderCurrentView();
}

function showToast(title, message, type = "info") {
  const toast =
    document.createElement("article");

  toast.className = "toast";

  toast.innerHTML = `
    <div class="toast-icon">
      ${type === "success" ? "✓" : "!"}
    </div>

    <div>
      <h3 class="toast-title">
        ${escapeHTML(title)}
      </h3>

      <p class="toast-message">
        ${escapeHTML(message)}
      </p>
    </div>

    <button
      class="icon-button"
      type="button"
      aria-label="Dismiss"
    >
      ×
    </button>
  `;

  toast
    .querySelector("button")
    .addEventListener(
      "click",
      () => toast.remove()
    );

  elements.toastRoot.appendChild(toast);

  setTimeout(
    () => toast.remove(),
    4500
  );
}

function handleKeyboardShortcuts(event) {
  const typing =
    event.target.matches(
      "input, textarea, select"
    ) ||
    event.target.isContentEditable;

  if (event.key === "Escape") {
    closeModal();
    closeDrawer();
    closeSidebar();
  }

  if (
    (event.ctrlKey || event.metaKey) &&
    event.key.toLowerCase() === "k"
  ) {
    event.preventDefault();
    openSearch();
  }

  if (!typing && event.key === "/") {
    event.preventDefault();
    openSearch();
  }

  if (!typing && event.key.toLowerCase() === "n") {
    event.preventDefault();
    handleFab();
  }
}

function seedData() {
  if (!localStorage.getItem(storageKeys.tasks)) {
    writeJSON(storageKeys.tasks, [
      {
        id: "task-1",
        title: "Review this week's priorities",
        priority: "high",
        status: "doing",
        completed: false
      },

      {
        id: "task-2",
        title: "Complete FlowDesk responsive design",
        priority: "high",
        status: "todo",
        completed: false
      },

      {
        id: "task-3",
        title: "Organize project notes",
        priority: "medium",
        status: "todo",
        completed: false
      },

      {
        id: "task-4",
        title: "Check daily habits",
        priority: "low",
        status: "done",
        completed: true
      }
    ]);
  }

  if (!localStorage.getItem(storageKeys.notes)) {
    writeJSON(storageKeys.notes, [
      {
        id: "note-1",
        title: "FlowDesk vision",
        content:
          "A private offline-first productivity dashboard.",
        pinned: true
      },

      {
        id: "note-2",
        title: "Portfolio checklist",
        content:
          "Responsive design, accessibility, PWA, README, and deployment.",
        pinned: false
      }
    ]);
  }

  if (!localStorage.getItem(storageKeys.goals)) {
    writeJSON(storageKeys.goals, [
      {
        id: "goal-1",
        title: "Launch FlowDesk",
        description:
          "Build, test, document, and deploy the application.",
        progress: 62
      },

      {
        id: "goal-2",
        title: "Improve JavaScript skills",
        description:
          "Practice modular JavaScript and browser storage.",
        progress: 48
      }
    ]);
  }

  if (!localStorage.getItem(storageKeys.habits)) {
    writeJSON(storageKeys.habits, [
      {
        id: "habit-1",
        title: "Plan the day",
        frequency: "Daily",
        streak: 6,
        completedToday: true,
        week: [
          true,
          true,
          true,
          true,
          false,
          true,
          true
        ]
      },

      {
        id: "habit-2",
        title: "Practice coding",
        frequency: "Daily",
        streak: 7,
        completedToday: true,
        week: [
          true,
          true,
          true,
          true,
          true,
          true,
          true
        ]
      }
    ]);
  }
}

function calculateProductivityScore(
  tasks,
  goals,
  habits
) {
  const taskRate =
    tasks.length
      ? tasks.filter(task => task.completed).length /
        tasks.length
      : 0;

  const goalRate =
    goals.length
      ? goals.reduce(
          (total, goal) =>
            total + goal.progress,
          0
        ) /
        (goals.length * 100)
      : 0;

  const habitRate =
    habits.length
      ? habits.filter(
          habit => habit.completedToday
        ).length /
        habits.length
      : 0;

  return Math.round(
    (
      taskRate * 0.4 +
      goalRate * 0.3 +
      habitRate * 0.3
    ) *
    100
  );
}

function priorityBadge(priority) {
  if (priority === "high") {
    return "badge-danger";
  }

  if (priority === "medium") {
    return "badge-warning";
  }

  return "badge-success";
}

function readJSON(key, fallback) {
  try {
    const value =
      localStorage.getItem(key);

    return value
      ? JSON.parse(value)
      : clone(fallback);
  } catch {
    return clone(fallback);
  }
}

function writeJSON(key, value) {
  localStorage.setItem(
    key,
    JSON.stringify(value)
  );
}

function clone(value) {
  return JSON.parse(
    JSON.stringify(value)
  );
}

function makeId(prefix) {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${prefix}-${Date.now()}`;
}

function downloadBlob(blob, filename) {
  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);

  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join("");
}

function firstName(name) {
  return name
    .trim()
    .split(/\s+/)[0] || "there";
}

function capitalize(value) {
  return value
    ? value.charAt(0).toUpperCase() +
      value.slice(1)
    : "";
}

function escapeHTML(value) {
  const element =
    document.createElement("div");

  element.textContent =
    String(value ?? "");

  return element.innerHTML;
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service-worker.js")
      .catch(error => {
        console.info(
          "Service worker not active:",
          error.message
        );
      });
  });
}
