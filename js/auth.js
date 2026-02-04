const users = JSON.parse(localStorage.getItem("flowdesk_users")) || [];

function saveUsers() {
  localStorage.setItem("flowdesk_users", JSON.stringify(users));
}

const email = document.getElementById("email");
const password = document.getElementById("password");

const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");

if (registerBtn) {
  registerBtn.onclick = () => {
    if (!email.value || !password.value) return alert("Fill all fields");

    users.push({ email: email.value, password: password.value });
    saveUsers();
    alert("Registered successfully");
    location.href = "login.html";
  };
}

if (loginBtn) {
  loginBtn.onclick = () => {
    const user = users.find(
      u => u.email === email.value && u.password === password.value
    );

    if (!user) return alert("Invalid credentials");

    localStorage.setItem("flowdesk_session", JSON.stringify(user));
    location.href = "index.html";
  };
}
