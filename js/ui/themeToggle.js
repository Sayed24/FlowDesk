/* ======================================================
   FlowDesk — Theme & UI Toggle
====================================================== */

(() => {

  const html = document.documentElement;

  const themeBtn = document.getElementById("uiToggle");
  const modeBtn = document.getElementById("themeToggle");

  const getTheme = () =>
    html.getAttribute("data-theme") || CONFIG.defaultTheme;

  const getMode = () =>
    html.getAttribute("data-mode") || CONFIG.defaultMode;

  const setTheme = (theme) => {
    html.setAttribute("data-theme", theme);
    StorageService.set(CONFIG.storage.theme, theme);
    updateIcons();
  };

  const setMode = (mode) => {
    html.setAttribute("data-mode", mode);
    StorageService.set(CONFIG.storage.mode, mode);
    updateIcons();
  };

  const toggleTheme = () => {
    setTheme(getTheme() === "material" ? "ios" : "material");
  };

  const toggleMode = () => {
    setMode(getMode() === "light" ? "dark" : "light");
  };

  const updateIcons = () => {
    if (modeBtn) {
      modeBtn.textContent = getMode() === "dark" ? "☀️" : "🌙";
    }
    if (themeBtn) {
      themeBtn.textContent = getTheme() === "material" ? "🍎" : "🎨";
    }
  };

  const init = () => {
    if (themeBtn) themeBtn.addEventListener("click", toggleTheme);
    if (modeBtn) modeBtn.addEventListener("click", toggleMode);
    updateIcons();
  };

  document.addEventListener("DOMContentLoaded", init);

})();
