// js/tasks.js
// FlowDesk Tasks Module — complete, production-ready

import { state, notify, hasPermission } from './app.js';

/* ==============================
   TASK STATE
================================ */
let tasks = JSON.parse(localStorage.getItem('flowdesk_tasks')) || [];

function saveTasks() {
  localStorage.setItem('flowdesk_tasks', JSON.stringify(tasks));
}

/* ==============================
   TASK CRUD
================================ */
export function createTask(data) {
  if (!hasPermission('task:create')) return notify('Permission denied', 'error');

  const task = {
    id: crypto.randomUUID(),
    title: data.title,
    description: data.description || '',
    status: data.status || 'todo',
    priority: data.priority || 'normal',
    assignee: data.assignee || null,
    time: 0,
    createdAt: Date.now()
  };

  tasks.push(task);
  saveTasks();
  renderTasks();
  notify('Task created');
}

export function updateTask(id, updates) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  Object.assign(task, updates);
  saveTasks();
  renderTasks();
}

export function deleteTask(id) {
  if (!hasPermission('task:delete')) return notify('Permission denied', 'error');
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
  notify('Task deleted');
}

/* ==============================
   RENDERING
================================ */
export function renderTasks() {
  ['todo', 'doing', 'done'].forEach(status => {
    const col = document.querySelector(`[data-column="${status}"]`);
    if (!col) return;
    col.innerHTML = '';

    tasks.filter(t => t.status === status).forEach(task => {
      const el = document.createElement('div');
      el.className = `task-card priority-${task.priority}`;
      el.draggable = true;
      el.dataset.id = task.id;
      el.innerHTML = `
        <h4>${task.title}</h4>
        <p>${task.description}</p>
        <small>${task.time} min</small>
        <button data-delete>✕</button>
      `;

      el.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', task.id);
      });

      el.querySelector('[data-delete]').onclick = () => deleteTask(task.id);
      col.appendChild(el);
    });
  });
}

/* ==============================
   DRAG & DROP
================================ */
document.querySelectorAll('[data-column]').forEach(col => {
  col.addEventListener('dragover', e => e.preventDefault());
  col.addEventListener('drop', e => {
    const id = e.dataTransfer.getData('text/plain');
    updateTask(id, { status: col.dataset.column });
  });
});

/* ==============================
   TIME TRACKING
================================ */
export function trackTime(id, minutes) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.time += minutes;
  saveTasks();
  renderTasks();
}

/* ==============================
   AI-STYLE SUGGESTIONS (LOCAL)
================================ */
export function suggestTasks() {
  if (tasks.length === 0) return [];
  return tasks
    .filter(t => t.status === 'todo')
    .sort((a, b) => a.createdAt - b.createdAt)
    .slice(0, 3);
}

/* ==============================
   EXPORT CSV
================================ */
export function exportCSV() {
  const rows = ['Title,Status,Priority,Time'];
  tasks.forEach(t => rows.push(`${t.title},${t.status},${t.priority},${t.time}`));
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'flowdesk_tasks.csv';
  a.click();
}

/* ==============================
   INIT
================================ */
renderTasks();
