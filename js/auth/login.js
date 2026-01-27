/* ======================================================
   FlowDesk — Login Controller
====================================================== */

document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("loginForm");
  if (!form) return;

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  const showError = (input, message) => {
    const field = input.closest(".field");
    const error = field.querySelector(".error");
    error.textContent = message;
  };

  const clearErrors = () => {
    form.querySelectorAll(".error").forEach(e => e.textContent = "");
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    let hasError = false;

    if (!email) {
      showError(emailInput, "This field is required");
      hasError = true;
    }

    if (!password) {
      showError(passwordInput, "This field is required");
      hasError = true;
    }

    if (hasError) return;

    try {
      await AuthService.login(email, password);
      window.location.href = "dashboard.html";
    } catch (err) {
      showError(emailInput, err.message);
    }
  });

});
