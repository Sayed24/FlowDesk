// Create Note
function addNote(note) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["notes"], "readwrite");
    const store = transaction.objectStore("notes");
    note.id = Date.now().toString();
    note.dateCreated = new Date().toISOString();
    store.add(note);

    transaction.oncomplete = () => resolve(note);
    transaction.onerror = () => reject("Add note failed");
  });
}

// Read All Notes
function getAllNotes() {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["notes"], "readonly");
    const store = transaction.objectStore("notes");
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject("Read notes failed");
  });
}

// Update Note
function updateNote(note) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["notes"], "readwrite");
    const store = transaction.objectStore("notes");
    store.put(note);

    transaction.oncomplete = () => resolve(note);
    transaction.onerror = () => reject("Update note failed");
  });
}

// Delete Note
function deleteNote(id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["notes"], "readwrite");
    const store = transaction.objectStore("notes");
    store.delete(id);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject("Delete note failed");
  });
}
