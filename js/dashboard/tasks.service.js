/* ======================================================
   FlowDesk — Tasks Service (LocalStorage)
====================================================== */

const TaskService = (() => {

  const STORAGE_KEY = "flowdesk_tasks";

  /* ================= HELPERS ================= */

  const getUser = () => {
    const user = AuthService.getCurrentUser();
    if (!user) throw new Error("User not authenticated");
    return user.id;
  };

  const loadAll = () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  };

  const saveAll = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const generateId = () => crypto.randomUUID();

  /* ================= PUBLIC API ================= */

  const getTasks = () => {
    const userId = getUser();
    const data = loadAll();
    return data[userId] || [];
  };

  const addTask = (title) => {
    const userId = getUser();
    const data = loadAll();

    const newTask = {
      id: generateId(),
      title,
      completed: false,
      createdAt: Date.now()
    };

    if (!data[userId]) data[userId] = [];
    data[userId].push(newTask);

    saveAll(data);
    return newTask;
  };

  const toggleTask = (taskId) => {
    const userId = getUser();
    const data = loadAll();

    const task = data[userId]?.find(t => t.id === taskId);
    if (!task) return;

    task.completed = !task.completed;
    saveAll(data);
  };

  const deleteTask = (taskId) => {
    const userId = getUser();
    const data = loadAll();

    data[userId] = (data[userId] || []).filter(t => t.id !== taskId);
    saveAll(data);
  };

  const clearTasks = () => {
    const userId = getUser();
    const data = loadAll();
    data[userId] = [];
    saveAll(data);
  };

  return {
    getTasks,
    addTask,
    toggleTask,
    deleteTask,
    clearTasks
  };

})();
