/* ======================================================
   FlowDesk — Authentication Core
====================================================== */

window.AuthService = (() => {

  const USERS_KEY = "flowdesk_users";

  /* ===== HELPERS ===== */
  const getUsers = () => {
    return StorageService.get(USERS_KEY, []);
  };

  const saveUsers = (users) => {
    StorageService.set(USERS_KEY, users);
  };

  const hash = async (value) => {
    const data = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  };

  /* ===== REGISTER ===== */
  const register = async (email, password) => {
    const users = getUsers();

    if (users.find(u => u.email === email)) {
      throw new Error("User already exists");
    }

    const hashed = await hash(password);
    users.push({ email, password: hashed });

    saveUsers(users);
    return true;
  };

  /* ===== LOGIN ===== */
  const login = async (email, password) => {
    const users = getUsers();
    const hashed = await hash(password);

    const user = users.find(
      u => u.email === email && u.password === hashed
    );

    if (!user) {
      throw new Error("Invalid credentials");
    }

    StorageService.setUser({ email });
    return true;
  };

  /* ===== LOGOUT ===== */
  const logout = () => {
    StorageService.clearUser();
    window.location.href = "login.html";
  };

  return {
    register,
    login,
    logout
  };

})();
