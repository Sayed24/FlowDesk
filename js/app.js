/* ======================================================
   FlowDesk — App Core
====================================================== */

window.App = (() => {

  const applyTheme = (theme, mode) => {
    const html = document.documentElement;
    html.setAttribute("data-theme", theme);
    html.setAttribute("data-mode", mode);
  };

  const initTheme = () => {
    const theme = StorageService.get(
      CONFIG.storage.theme,
      CONFIG.defaultTheme
    );
    const mode = StorageService.get(
      CONFIG.storage.mode,
      CONFIG.defaultMode
    );

    applyTheme(theme, mode);
  };

  const initLanguage = () => {
    const lang = StorageService.get(
      CONFIG.storage.language,
      CONFIG.defaultLanguage
    );

    if (window.i18n) {
      i18n.setLanguage(lang);
    }
  };

  const initRouter = () => {
    if (window.Router) {
      Router.guard();
    }
  };

  const init = () => {
    initTheme();
    initLanguage();
    initRouter();
    console.log("🚀 FlowDesk initialized");
  };

  return {
    init,
    applyTheme
  };

})();
