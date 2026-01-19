/* ======================================================
   FlowDesk i18n Engine
   - Framework-free
   - Persistent language
   - Live UI updates
====================================================== */

const I18N = {
  currentLang: localStorage.getItem("flowdesk_lang") || "en",
  translations: {},

  async load(lang = "en") {
    try {
      const res = await fetch(`lang/${lang}.json`);
      if (!res.ok) throw new Error("Language file not found");
      this.translations = await res.json();
      this.currentLang = lang;
      localStorage.setItem("flowdesk_lang", lang);
      this.translatePage();
    } catch (err) {
      console.error("i18n load error:", err);
    }
  },

  t(key) {
    return key.split(".").reduce((obj, k) => obj?.[k], this.translations) || key;
  },

  translatePage() {
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      el.textContent = this.t(key);
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
      const key = el.getAttribute("data-i18n-placeholder");
      el.placeholder = this.t(key);
    });
  }
};

/* ======================================================
   Auto-init on page load
====================================================== */
document.addEventListener("DOMContentLoaded", () => {
  I18N.load(I18N.currentLang);
});
