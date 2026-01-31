let notes = [];
let editingId = null;

const grid = document.getElementById("notesGrid");
const addBtn = document.getElementById("addNoteBtn");

const modal = document.getElementById("noteModal");
const closeBtn = document.getElementById("closeNoteModal");
const saveBtn = document.getElementById("saveNote");

const titleInput = document.getElementById("noteTitle");
const contentInput = document.getElementById("noteContent");
const tagsInput = document.getElementById("noteTags");

load();
render();

// Events
addBtn.onclick = () => openModal();
closeBtn.onclick = closeModal;
saveBtn.onclick = saveNote;

// Modal
function openModal(note = null) {
  editingId = note ? note.id : null;

  titleInput.value = note?.title || "";
  contentInput.value = note?.content || "";
  tagsInput.value = note?.tags?.join(", ") || "";

  modal.classList.remove("hidden");
}

function closeModal() {
  modal.classList.add("hidden");
}

// CRUD
function saveNote() {
  const title = titleInput.value.trim();
  if (!title) return alert("Title required");

  const note = {
    id: editingId || crypto.randomUUID(),
    title,
    content: contentInput.value,
    tags: tagsInput.value.split(",").map(t => t.trim()).filter(Boolean),
    pinned: false,
    createdAt: Date.now()
  };

  if (editingId) {
    notes = notes.map(n => n.id === editingId ? { ...n, ...note } : n);
  } else {
    notes.push(note);
  }

  persist();
  render();
  closeModal();
}

function deleteNote(id) {
  if (!confirm("Delete this note?")) return;
  notes = notes.filter(n => n.id !== id);
  persist();
  render();
}

function togglePin(id) {
  notes = notes.map(n =>
    n.id === id ? { ...n, pinned: !n.pinned } : n
  );
  persist();
  render();
}

// Render
function render() {
  grid.innerHTML = "";

  notes
    .sort((a,b) => b.pinned - a.pinned)
    .forEach(note => {
      const card = document.createElement("div");
      card.className = `note-card ${note.pinned ? "pinned" : ""}`;

      card.innerHTML = `
        <h3>${note.title}</h3>
        <p>${note.content}</p>
        <div class="note-tags">${note.tags.join(" • ")}</div>

        <div class="note-actions">
          <button onclick="(${togglePin})('${note.id}')">📌</button>
          <button onclick="(${() => openModal(note)})()">✏️</button>
          <button onclick="(${deleteNote})('${note.id}')">🗑️</button>
        </div>
      `;

      grid.appendChild(card);
    });
}

// Storage
function persist() {
  localStorage.setItem("flowdesk_notes", JSON.stringify(notes));
}

function load() {
  const data = localStorage.getItem("flowdesk_notes");
  if (data) notes = JSON.parse(data);
}
