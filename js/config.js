/* ======================================================
   FlowDesk — App Configuration
====================================================== */

window.CONFIG = {
  appName: "FlowDesk",
  version: "1.0.0",

  /* ===== Defaults ===== */
  defaultTheme: "material", // material | ios
  defaultMode: "light",     // light | dark
  defaultLanguage: "en",

  /* ===== Storage Keys ===== */
  storage: {
    theme: "flowdesk_theme",
    mode: "flowdesk_mode",
    language: "flowdesk_lang",
    user: "flowdesk_user"
  },

  /* ===== Feature Flags ===== */
  features: {
    auth: true,
    i18n: true,
    tauri: true
  }
};

/* ===== Tauri Detection ===== */
window.IS_TAURI = Boolean(window.__TAURI__);
