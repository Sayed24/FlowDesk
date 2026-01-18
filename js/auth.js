/* ======================================================
   FlowDesk Local Authentication Engine
====================================================== */

const Auth = {
  usersKey: "flowdesk_users",
  sessionKey: "flowdesk_session",

  getUsers() {
    return JSON.parse(localStorage.getItem(this.usersKey)) || [];
  },

  saveUsers(users) {
    localStorage.setItem(this.usersKey, JSON.stringify(users));
  },

  async hash(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  },

  async register(email, password) {
    const users = this.getUsers();
    if (users.find(u => u.email === email)) {
      throw new Error("USER_EXISTS");
    }

    const hashed = await this.hash(password);
    users.push({ email, password: hashed, createdAt: Date.now() });
    this.saveUsers(users);
    this.startSession(email);
  },

  async login(email, password) {
    const users = this.getUsers();
    const user = users.find(u => u.email === email);
    if (!user) throw new Error("INVALID");

    const hashed = await this.hash(password);
    if (user.password !== hashed) throw new Error("INVALID");

    this.startSession(email);
  },

  startSession(email) {
    localStorage.setItem(this.sessionKey, JSON.stringify({
      email,
      loggedInAt: Date.now()
    }));
    location.href = "index.html";
  },

  logout() {
    localStorage.removeItem(this.sessionKey);
    location.href = "auth.html";
  },

  isAuthenticated() {
    return !!localStorage.getItem(this.sessionKey);
  }
};

/* ======================================================
   UI Logic
====================================================== */

let isLogin = true;

const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const submitBtn = document.getElementById("authSubmitBtn");
const switchBtn = document.getElementById("authSwitch");
const errorBox = document.getElementById("authError");
const title = document.getElementById("authTitle");

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.style.display = "block";
}

function clearError() {
  errorBox.style.display = "none";
}

submitBtn.addEventListener("click", async () => {
  clearError();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    showError(I18N.t("auth.error_required"));
    return;
  }

  try {
    if (isLogin) {
      await Auth.login(email, password);
    } else {
      await Auth.register(email, password);
    }
  } catch (err) {
    if (err.message === "USER_EXISTS") {
      showError(I18N.t("auth.error_exists"));
    } else {
      showError(I18N.t("auth.error_invalid"));
    }
  }
});

switchBtn.addEventListener("click", () => {
  isLogin = !isLogin;
  title.setAttribute("data-i18n", isLogin ? "auth.login_title" : "auth.register_title");
  submitBtn.setAttribute("data-i18n", isLogin ? "auth.login_btn" : "auth.register_btn");
  switchBtn.setAttribute("data-i18n", isLogin ? "auth.switch_register" : "auth.switch_login");
  I18N.translatePage();
});

/* ======================================================
   Auto redirect if already logged in
====================================================== */
if (Auth.isAuthenticated()) {
  location.href = "index.html";
}
