// js/team.js
import { initDB, getStore } from "./db/indexeddb.js";

/* ============================
   CONFIG
============================ */
const DEMO_MODE = !localStorage.getItem("session");

/* ============================
   DOM
============================ */
const teamList = document.getElementById("teamList");
const emptyState = document.getElementById("teamEmpty");
const addBtn = document.getElementById("addMemberBtn");

/* ============================
   INIT
============================ */
await initDB();
renderTeam();

addBtn?.addEventListener("click", addMember);

/* ============================
   AUTH / ROLE
============================ */
function currentUserRole() {
  if (DEMO_MODE) return "admin";

  const role = localStorage.getItem("role");
  return role || "member";
}

function canManageTeam() {
  return currentUserRole() === "admin";
}

/* ============================
   CRUD
============================ */
function addMember() {
  if (!canManageTeam()) {
    alert("Admin permission required");
    return;
  }

  const name = prompt("Member name");
  if (!name) return;

  const role = prompt("Role (admin / member / viewer)", "member");
  if (!role) return;

  const member = {
    id: crypto.randomUUID(),
    name,
    role,
    createdAt: Date.now()
  };

  if (DEMO_MODE) {
    const demoTeam = JSON.parse(localStorage.getItem("demo_team") || "[]");
    demoTeam.push(member);
    localStorage.setItem("demo_team", JSON.stringify(demoTeam));
    renderTeam();
    return;
  }

  const store = getStore("team", "readwrite");
  store.add(member).onsuccess = renderTeam;
}

function removeMember(id) {
  if (!canManageTeam()) return;

  if (DEMO_MODE) {
    const team = JSON.parse(localStorage.getItem("demo_team") || "[]")
      .filter(m => m.id !== id);
    localStorage.setItem("demo_team", JSON.stringify(team));
    renderTeam();
    return;
  }

  const store = getStore("team", "readwrite");
  store.delete(id).onsuccess = renderTeam;
}

/* ============================
   RENDER
============================ */
function renderTeam() {
  teamList.innerHTML = "";

  const render = members => {
    if (!members.length) {
      emptyState.classList.remove("hidden");
      return;
    }

    emptyState.classList.add("hidden");

    members.forEach(member => {
      const card = document.createElement("div");
      card.className = "card team-card";

      card.innerHTML = `
        <h3>${member.name}</h3>
        <p class="muted">Role: ${member.role}</p>
        ${canManageTeam()
          ? `<button class="btn btn-danger" data-id="${member.id}">Remove</button>`
          : ""
        }
      `;

      card.querySelector("button")?.addEventListener("click", () =>
        removeMember(member.id)
      );

      teamList.appendChild(card);
    });
  };

  if (DEMO_MODE) {
    render(JSON.parse(localStorage.getItem("demo_team") || "[]"));
    return;
  }

  const store = getStore("team");
  store.getAll().onsuccess = e => render(e.target.result);
}

