/* ===============================
   FlowDesk — Main Global Logic
   File: js/main.js
   =============================== */

/* ---------- THEME (LIGHT / DARK) ---------- */
const themeToggle = document.querySelector(".theme-toggle");

function applyTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }
  localStorage.setItem("theme", theme);
}

function initTheme() {
  const saved =
    localStorage.getItem("theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light");
  applyTheme(saved);
}

themeToggle?.addEventListener("click", () => {
  const next = document.body.classList.contains("dark") ? "light" : "dark";
  applyTheme(next);
});

/* ---------- ACTIVE NAV LINK ---------- */
function setActiveNav() {
  const links = document.querySelectorAll(".sidebar a");
  const current = location.pathname.split("/").pop();

  links.forEach(link => {
    if (link.getAttribute("href") === current) {
      link.classList.add("active");
    }
  });
}

/* ---------- AUTH GUARD ---------- */
function requireAuth() {
  const session = localStorage.getItem("session");
  const isLoginPage = location.pathname.includes("login.html");

  if (!session && !isLoginPage) {
    location.href = "login.html";
  }
}
/* ===============================
   FlowDesk — App Bootstrap
   File: js/main.js
   =============================== */

/* ---------- AUTH GUARD ---------- */
if (typeof requireAuth === "function") {
  requireAuth();
}

/* ---------- INIT APP ---------- */
document.addEventListener("DOMContentLoaded", async () => {
  /* Init IndexedDB */
  if (typeof initDB === "function") {
    try {
      await initDB();
      console.log("IndexedDB ready");
    } catch (e) {
      console.error("DB init failed", e);
    }
  }

  /* ---------- ACTIVE NAV ---------- */
  const current = location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll(".nav-link, .bottom-nav a").forEach(link => {
    if (link.getAttribute("href") === current) {
      link.classList.add("active");
    }
  });

  /* ---------- THEME ---------- */
  const toggle = document.querySelector(".theme-toggle");
  const savedTheme = localStorage.getItem("flowdesk-theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark");
  }

  if (toggle) {
    toggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      localStorage.setItem(
        "flowdesk-theme",
        document.body.classList.contains("dark") ? "dark" : "light"
      );
    });
  }

  /* ---------- LOGOUT ---------- */
  const logoutBtn = document.querySelector("[data-logout]");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  /* ---------- FAB ---------- */
  const fab = document.querySelector(".fab");
  if (fab) {
    fab.addEventListener("click", () => {
      document.dispatchEvent(new CustomEvent("fab:click"));
    });
  }
});

/* ---------- LOGOUT ---------- */
function logout() {
  localStorage.removeItem("session");
  location.href = "login.html";
}

/* ---------- LANGUAGE INIT ---------- */
function initLanguage() {
  const langSelect = document.getElementById("langSelect");
  const savedLang = localStorage.getItem("lang") || "en";

  if (typeof setLang === "function") {
    setLang(savedLang);
  }

  if (langSelect) {
    langSelect.value = savedLang;
    langSelect.addEventListener("change", e => {
      setLang(e.target.value);
    });
  }
}

/* ---------- GLOBAL INIT ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  setActiveNav();
  requireAuth();
  initLanguage();
});
