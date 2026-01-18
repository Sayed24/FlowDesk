/* ======================================================
   FlowDesk Main App Bootstrap
====================================================== */

const FlowDesk = {
  protectedPages: [
    "index.html",
    "tasks.html",
    "habits.html",
    "settings.html"
  ],

  init() {
    this.checkAuth();
    this.initTheme();
    this.bindLogout();
  },

  /* ======================================================
     AUTH GUARD
  ====================================================== */
  checkAuth() {
    const currentPage = location.pathname.split("/").pop() || "index.html";
    const isAuthPage = currentPage === "auth.html";
    const session = localStorage.getItem("flowdesk_session");

    if (!session && this.protectedPages.includes(currentPage)) {
      location.href = "auth.html";
      return;
    }

    if (session && isAuthPage) {
      location.href = "index.html";
    }
  },

  /* ======================================================
     LOGOUT
  ====================================================== */
  bindLogout() {
    const logoutBtn = document.getElementById("logoutBtn");
    if (!logoutBtn) return;

    logoutBtn.addEventListener("click", e => {
      e.preventDefault();
      localStorage.removeItem("flowdesk_session");
      location.href = "auth.html";
    });
  },

  /* ======================================================
     THEME SYSTEM
  ====================================================== */
  initTheme() {
    const themeToggle = document.getElementById("themeToggle");
    const savedTheme = localStorage.getItem("flowdesk_theme") || "light";

    document.documentElement.setAttribute("data-theme", savedTheme);

    if (themeToggle) {
      themeToggle.textContent = savedTheme === "dark" ? "☀️" : "🌙";

      themeToggle.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme");
        const next = current === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("flowdesk_theme", next);
        themeToggle.textContent = next === "dark" ? "☀️" : "🌙";
      });
    }
  }
};

/* ======================================================
   DOM READY
====================================================== */
document.addEventListener("DOMContentLoaded", () => {
  FlowDesk.init();
});
