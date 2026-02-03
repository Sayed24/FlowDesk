let tasks = JSON.parse(localStorage.getItem("flowdesk_tasks")) || [];
let currentEdit = null;

const modal = document.getElementById("taskModal");
const titleInput = document.getElementById("taskTitle");

document.getElementById("addTaskBtn").onclick = () => {
  modal.classList.remove("hidden");
  titleInput.value = "";
  currentEdit = null;
};

document.getElementById("saveTask").onclick = () => {
  const title = titleInput.value.trim();
  if (!title) return;

  if (currentEdit !== null) {
    tasks[currentEdit].title = title;
  } else {
    tasks.push({ title, status: "todo" });
  }

  save();
  modal.classList.add("hidden");
};

function save() {
  localStorage.setItem("flowdesk_tasks", JSON.stringify(tasks));
  render();
}

function render() {
  document.querySelectorAll(".column").forEach(col => col.innerHTML = `<h3>${col.dataset.status}</h3>`);
  tasks.forEach((t, i) => {
    const el = document.createElement("div");
    el.className = "task";
    el.textContent = t.title;
    el.draggable = true;

    el.ondragstart = () => el.dataset.index = i;

    el.onclick = () => {
      currentEdit = i;
      titleInput.value = t.title;
      modal.classList.remove("hidden");
    };

    document.querySelector(`[data-status="${t.status}"]`).appendChild(el);
  });
}

document.querySelectorAll(".column").forEach(col => {
  col.ondragover = e => e.preventDefault();
  col.ondrop = e => {
    const i = e.dataTransfer.getData("text");
    tasks[i].status = col.dataset.status;
    save();
  };
});

render();
