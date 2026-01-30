import { initDB, getStore } from "./db/indexeddb.js";

await initDB();

export async function register(email, password) {
  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(password)
  );

  const store = getStore("users", "readwrite");
  store.add({
    email,
    password: Array.from(new Uint8Array(hash))
  });
}

export async function login(email, password) {
  const store = getStore("users");
  store.get(email).onsuccess = async (e) => {
    const user = e.target.result;
    if (!user) return alert("User not found");

    const hash = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(password)
    );

    if (
      JSON.stringify(user.password) ===
      JSON.stringify(Array.from(new Uint8Array(hash)))
    ) {
      localStorage.setItem("session", email);
      location.href = "index.html";
    } else {
      alert("Wrong password");
    }
  };
}

