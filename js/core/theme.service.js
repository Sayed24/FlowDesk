/* ======================================================
   FlowDesk — Theme Service (Light / Dark)
====================================================== */

const ThemeService = (() => {

  const THEME_KEY = "flowdesk_theme";

  const getSystemTheme = () => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  const getTheme = () => {
    return localStorage.getItem(THEME_KEY) || getSystemTheme();
  };

  const setTheme = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  };

  const toggleTheme = () => {
    const current = getTheme();
    setTheme(current === "dark" ? "light" : "dark");
  };

  const init = () => {
    setTheme(getTheme());
  };

  return {
    init,
    toggleTheme,
    getTheme
  };

})();
