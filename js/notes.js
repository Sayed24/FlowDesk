
// FlowDesk Notes Module
// Full CRUD with LocalStorage, modal support, and theme awareness

const notesKey = 'flowdesk_notes';
let notes = JSON.parse(localStorage.getItem(notesKey)) || [];
let editingNoteId = null;

// Elements
const notesContainer = document.getElementById('notesContainer');
const noteModal = document.getElementById('noteModal');
const noteForm = document.getElementById('noteForm');
const noteTitleInput = document.getElementById('noteTitle');
const noteBodyInput = document.getElementById('noteBody');
const openNoteBtn = document.getElementById('openNoteModal');
const closeNoteBtn = document.getElementById('closeNoteModal');

// Utilities
function saveNotes() {
  localStorage.setItem(notesKey, JSON.stringify(notes));
}

function generateId() {
  return Date.now().toString();
}

// Render
function renderNotes() {
  if (!notesContainer) return;
  notesContainer.innerHTML = '';

  if (notes.length === 0) {
    notesContainer.innerHTML = '<p class="empty">No notes yet. Create one ✍️</p>';
    return;
  }

  notes.forEach(note => {
    const card = document.createElement('div');
    card.className = 'note-card';

    card.innerHTML = `
      <h3>${note.title}</h3>
      <p>${note.body}</p>
      <div class="note-actions">
        <button data-edit="${note.id}">Edit</button>
        <button data-delete="${note.id}" class="danger">Delete</button>
      </div>
    `;

    notesContainer.appendChild(card);
  });
}

// Modal
function openModal(note = null) {
  noteModal.classList.add('active');

  if (note) {
    editingNoteId = note.id;
    noteTitleInput.value = note.title;
    noteBodyInput.value = note.body;
  } else {
    editingNoteId = null;
    noteForm.reset();
  }
}

function closeModal() {
  noteModal.classList.remove('active');
  editingNoteId = null;
}

// Events
openNoteBtn?.addEventListener('click', () => openModal());
closeNoteBtn?.addEventListener('click', closeModal);

noteForm?.addEventListener('submit', e => {
  e.preventDefault();

  const title = noteTitleInput.value.trim();
  const body = noteBodyInput.value.trim();

  if (!title || !body) return;

  if (editingNoteId) {
    notes = notes.map(n =>
      n.id === editingNoteId ? { ...n, title, body } : n
    );
  } else {
    notes.unshift({
      id: generateId(),
      title,
      body,
      createdAt: new Date().toISOString()
    });
  }

  saveNotes();
  renderNotes();
  closeModal();
});

notesContainer?.addEventListener('click', e => {
  const editId = e.target.dataset.edit;
  const deleteId = e.target.dataset.delete;

  if (editId) {
    const note = notes.find(n => n.id === editId);
    if (note) openModal(note);
  }

  if (deleteId) {
    if (confirm('Delete this note?')) {
      notes = notes.filter(n => n.id !== deleteId);
      saveNotes();
      renderNotes();
    }
  }
});

// Init
renderNotes();
