/* ======================================================
   FlowDesk — Internationalization (i18n)
====================================================== */

window.i18n = (() => {

  let currentLang = CONFIG.defaultLanguage;
  let translations = {};

  /* ===== LOAD LANGUAGE FILE ===== */
  const loadLanguage = async (lang) => {
    try {
      const response = await fetch(`js/i18n/${lang}.json`);
      translations = await response.json();
      currentLang = lang;
      StorageService.set(CONFIG.storage.language, lang);
      applyTranslations();
    } catch (err) {
      console.error("i18n load error:", err);
    }
  };

  /* ===== APPLY TEXT ===== */
  const applyTranslations = () => {
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (translations[key]) {
        el.textContent = translations[key];
      }
    });
  };

  /* ===== PUBLIC API ===== */
  const setLanguage = (lang) => {
    loadLanguage(lang);
  };

  const initSelector = () => {
    const selector = document.getElementById("languageSelect");
    if (!selector) return;

    selector.value = StorageService.get(
      CONFIG.storage.language,
      CONFIG.defaultLanguage
    );

    selector.addEventListener("change", e => {
      setLanguage(e.target.value);
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    initSelector();
    loadLanguage(
      StorageService.get(CONFIG.storage.language, CONFIG.defaultLanguage)
    );
  });

  return {
    setLanguage,
    get current() {
      return currentLang;
    }
  };

})();
