/* ===============================
   FlowDesk — Settings Module
   File: js/settings.js
   =============================== */

document.addEventListener("DOMContentLoaded", () => {
  initLanguage();
  bindClearData();
});

/* ---------- LANGUAGE ---------- */
function initLanguage() {
  const select = document.getElementById("language-select");
  if (!select) return;

  const savedLang = localStorage.getItem("flowdesk-lang") || "en";
  select.value = savedLang;

  select.addEventListener("change", () => {
    localStorage.setItem("flowdesk-lang", select.value);
    applyLanguage(select.value);
  });

  applyLanguage(savedLang);
}

/* ---------- APPLY LANGUAGE ---------- */
function applyLanguage(lang) {
  const dict = {
    en: {
      Dashboard: "Dashboard",
      Tasks: "Tasks",
      Habits: "Habits",
      Settings: "Settings",
      Logout: "Logout"
    },
    es: {
      Dashboard: "Panel",
      Tasks: "Tareas",
      Habits: "Hábitos",
      Settings: "Configuración",
      Logout: "Cerrar sesión"
    },
    fr: {
      Dashboard: "Tableau",
      Tasks: "Tâches",
      Habits: "Habitudes",
      Settings: "Paramètres",
      Logout: "Déconnexion"
    }
  };

  document.querySelectorAll(".nav-link").forEach(link => {
    const key = link.textContent.trim();
    if (dict[lang][key]) {
      link.textContent = dict[lang][key];
    }
  });
}

/* ---------- CLEAR DATA ---------- */
function bindClearData() {
  const btn = document.getElementById("clear-data");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    const ok = confirm("This will delete all FlowDesk data. Continue?");
    if (!ok) return;

    await db.clear("tasks");
    await db.clear("habits");

    localStorage.removeItem("flowdesk-theme");
    localStorage.removeItem("flowdesk-lang");

    alert("All data cleared. Reloading app.");
    location.href = "login.html";
  });
}
