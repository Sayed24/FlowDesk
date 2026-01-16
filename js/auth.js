/* ===============================
   FlowDesk — Local Auth System
   File: js/auth.js
   =============================== */

/*
  Auth strategy:
  - Credentials stored in localStorage (hashed)
  - Session stored separately
  - Simple, reliable, offline-first
*/

/* ---------- CONFIG ---------- */
const AUTH_KEY = "flowdesk_user";
const SESSION_KEY = "flowdesk_session";

/* ---------- HASHING ---------- */
function hash(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString();
}

/* ---------- REGISTER ---------- */
function register(username, password) {
  if (!username || !password) {
    return { success: false, message: "Missing fields" };
  }

  if (localStorage.getItem(AUTH_KEY)) {
    return { success: false, message: "User already exists" };
  }

  const user = {
    username,
    password: hash(password),
    createdAt: Date.now()
  };

  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  createSession(user.username);

  return { success: true };
}

/* ---------- LOGIN ---------- */
function login(username, password) {
  const stored = JSON.parse(localStorage.getItem(AUTH_KEY));

  if (!stored) {
    return { success: false, message: "No user found" };
  }

  if (
    stored.username !== username ||
    stored.password !== hash(password)
  ) {
    return { success: false, message: "Invalid credentials" };
  }

  createSession(username);
  return { success: true };
}

/* ---------- LOGOUT ---------- */
function logout() {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = "login.html";
}

/* ---------- SESSION ---------- */
function createSession(username) {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      username,
      loggedInAt: Date.now()
    })
  );
}

function getSession() {
  return JSON.parse(localStorage.getItem(SESSION_KEY));
}

function isAuthenticated() {
  return !!getSession();
}

/* ---------- PROTECT PAGES ---------- */
function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = "login.html";
  }
}
