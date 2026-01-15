// Create Task
function addTask(task) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["tasks"], "readwrite");
    const store = transaction.objectStore("tasks");
    task.id = Date.now().toString(); // unique ID
    store.add(task);

    transaction.oncomplete = () => resolve(task);
    transaction.onerror = () => reject("Add failed");
  });
}

// Read All Tasks
function getAllTasks() {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["tasks"], "readonly");
    const store = transaction.objectStore("tasks");
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject("Read failed");
  });
}

// Update Task
function updateTask(task) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["tasks"], "readwrite");
    const store = transaction.objectStore("tasks");
    store.put(task);

    transaction.oncomplete = () => resolve(task);
    transaction.onerror = () => reject("Update failed");
  });
}

// Delete Task
function deleteTask(id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["tasks"], "readwrite");
    const store = transaction.objectStore("tasks");
    store.delete(id);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject("Delete failed");
  });
}
