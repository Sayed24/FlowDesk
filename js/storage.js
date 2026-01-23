/* ======================================================
   FlowDesk — Storage Utility
   Safe LocalStorage Wrapper
====================================================== */

window.StorageService = (() => {

  /* ===== INTERNAL ===== */
  const isAvailable = () => {
    try {
      const test = "__flowdesk_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  };

  const enabled = isAvailable();

  const parse = (value, fallback = null) => {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  };

  /* ===== PUBLIC API ===== */
  return {

    enabled,

    get(key, fallback = null) {
      if (!enabled) return fallback;
      const value = localStorage.getItem(key);
      return value ? parse(value, fallback) : fallback;
    },

    set(key, value) {
      if (!enabled) return false;
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    },

    remove(key) {
      if (!enabled) return;
      localStorage.removeItem(key);
    },

    clear() {
      if (!enabled) return;
      localStorage.clear();
    },

    /* ===== USER SESSION ===== */
    getUser() {
      return this.get(CONFIG.storage.user);
    },

    setUser(user) {
      this.set(CONFIG.storage.user, user);
    },

    clearUser() {
      this.remove(CONFIG.storage.user);
    }

  };

})();
