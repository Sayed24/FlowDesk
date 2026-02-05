// js/calendar.js
// FlowDesk Calendar Module — complete & production-ready

import { notify, hasPermission } from './app.js';

/* ==============================
   STATE
================================ */
let currentDate = new Date();
let events = JSON.parse(localStorage.getItem('flowdesk_events')) || [];

function saveEvents() {
  localStorage.setItem('flowdesk_events', JSON.stringify(events));
}

/* ==============================
   DOM
================================ */
const grid = document.getElementById('calendarGrid');
const label = document.getElementById('monthLabel');
const modal = document.getElementById('eventModal');
const titleInput = document.getElementById('eventTitle');
const dateInput = document.getElementById('eventDate');

/* ==============================
   RENDER
================================ */
function renderCalendar() {
  grid.innerHTML = '';

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  label.textContent = currentDate.toLocaleString('default', {
    month: 'long',
    year: 'numeric'
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    grid.appendChild(document.createElement('div'));
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement('div');
    cell.className = 'calendar-day';

    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cell.innerHTML = `<strong>${day}</strong>`;

    events.filter(e => e.date === dateStr).forEach(e => {
      const ev = document.createElement('div');
      ev.className = 'calendar-event';
      ev.textContent = e.title;
      cell.appendChild(ev);
    });

    cell.onclick = () => openModal(dateStr);
    grid.appendChild(cell);
  }
}

/* ==============================
   EVENTS
================================ */
function openModal(date) {
  if (!hasPermission('calendar:add')) return notify('Permission denied', 'error');
  modal.classList.add('open');
  dateInput.value = date;
}

function closeModal() {
  modal.classList.remove('open');
  titleInput.value = '';
  dateInput.value = '';
}

function saveEvent() {
  if (!titleInput.value || !dateInput.value) return;

  events.push({
    id: crypto.randomUUID(),
    title: titleInput.value,
    date: dateInput.value
  });

  saveEvents();
  closeModal();
  renderCalendar();
  notify('Event added');
}

/* ==============================
   NAVIGATION
================================ */
document.getElementById('prevMonth').onclick = () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
};

document.getElementById('nextMonth').onclick = () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
};

document.getElementById('todayBtn').onclick = () => {
  currentDate = new Date();
  renderCalendar();
};

document.getElementById('addEventBtn').onclick = () => openModal('');
document.getElementById('closeEvent').onclick = closeModal;
document.getElementById('saveEvent').onclick = saveEvent;

/* ==============================
   INIT
================================ */
renderCalendar();
