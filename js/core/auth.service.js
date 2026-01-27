/* ======================================================
   FlowDesk — Auth Service (Local)
====================================================== */

const AuthService = (() => {

  const USERS_KEY = "flowdesk_users";
  const SESSION_KEY = "flowdesk_session";

  /* ================= HELPERS ================= */

  const loadUsers = () => {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  };

  const saveUsers = (users) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  const hashPassword = async (password) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  };

  const generateId = () => {
    return crypto.randomUUID();
  };

  /* ================= PUBLIC API ================= */

  const register = async (email, password) => {
    const users = loadUsers();

    if (users.find(u => u.email === email)) {
      throw new Error("Email already registered");
    }

    const hashed = await hashPassword(password);

    const newUser = {
      id: generateId(),
      email,
      password: hashed,
      createdAt: Date.now()
    };

    users.push(newUser);
    saveUsers(users);

    return true;
  };

  const login = async (email, password) => {
    const users = loadUsers();
    const hashed = await hashPassword(password);

    const user = users.find(
      u => u.email === email && u.password === hashed
    );

    if (!user) {
      throw new Error("Invalid email or password");
    }

    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        id: user.id,
        email: user.email
      })
    );

    return true;
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
  };

  const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  };

  return {
    register,
    login,
    logout,
    getCurrentUser
  };

})();
