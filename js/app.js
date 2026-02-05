
/* FlowDesk App Bootstrap (ES Modules)
   --------------------------------------------------
   - Global state management
   - Role-based permissions (Admin / Member / Demo)
   - Page routing (Dashboard, Tasks, Calendar, Team)
   - Theme handling
   - Notifications
   - Keyboard shortcuts
*/

// =========================
// Global App State
// =========================
export const AppState = {
  user: {
    role: 'demo', // 'admin' | 'member' | 'demo'
    name: 'Demo User'
  },
  theme: 'light', // 'light' | 'dark'
  currentPage: 'dashboard',
  notifications: [],
  tasks: [],
  team: [],
};

// =========================
// DOM Helpers
// =========================
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// =========================
// Init
// =========================
document.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  bindNavigation();
  bindKeyboardShortcuts();
  renderPage('dashboard');
  notify('Welcome to FlowDesk', 'info');
});

// =========================
// Navigation / Routing
// =========================
export function renderPage(page) {
  AppState.currentPage = page;

  $$('.page').forEach(p => p.classList.add('hidden'));
  const active = $(`#page-${page}`);
  if (active) active.classList.remove('hidden');

  updateActiveNav(page);
}

function bindNavigation() {
  $$('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.nav;
      renderPage(page);
    });
  });
}

function updateActiveNav(page) {
  $$('[data-nav]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.nav === page);
  });
}

// =========================
// Theme Handling
// =========================
export function toggleTheme() {
  AppState.theme = AppState.theme === 'light' ? 'dark' : 'light';
  applyTheme();
}

function loadTheme() {
  const saved = localStorage.getItem('flowdesk-theme');
  if (saved) AppState.theme = saved;
  applyTheme();
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', AppState.theme);
  localStorage.setItem('flowdesk-theme', AppState.theme);
}

// =========================
// Notifications
// =========================
export function notify(message, type = 'info') {
  const id = Date.now();
  AppState.notifications.push({ id, message, type });
  renderNotifications();

  setTimeout(() => removeNotification(id), 4000);
}

function removeNotification(id) {
  AppState.notifications = AppState.notifications.filter(n => n.id !== id);
  renderNotifications();
}

function renderNotifications() {
  const container = $('#notifications');
  if (!container) return;

  container.innerHTML = '';
  AppState.notifications.forEach(n => {
    const el = document.createElement('div');
    el.className = `toast ${n.type}`;
    el.textContent = n.message;
    container.appendChild(el);
  });
}

// =========================
// Keyboard Shortcuts
// =========================
function bindKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      notify('Command palette coming soon 👀');
    }

    if (e.ctrlKey && e.key === 'd') {
      e.preventDefault();
      renderPage('dashboard');
    }

    if (e.ctrlKey && e.key === 't') {
      e.preventDefault();
      renderPage('tasks');
    }

    if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      renderPage('calendar');
    }
  });
}

// =========================
// Role Permissions
// =========================
export function requireRole(role) {
  return AppState.user.role === role;
}

export function setRole(role) {
  AppState.user.role = role;
  notify(`Role switched to ${role}`, 'success');
}

// =========================
// Demo Mode
// =========================
export function enableDemoMode() {
  setRole('demo');
  AppState.tasks = getDemoTasks();
}

function getDemoTasks() {
  return [
    { id: 1, title: 'Welcome to FlowDesk', status: 'done' },
    { id: 2, title: 'Try the Calendar view', status: 'todo' },
    { id: 3, title: 'Switch themes', status: 'in-progress' },
  ];
}
