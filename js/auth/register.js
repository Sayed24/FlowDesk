/* ======================================================
   FlowDesk — Register Controller
====================================================== */

document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("registerForm");
  if (!form) return;

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmInput = document.getElementById("confirmPassword");

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
    const confirm = confirmInput.value;

    let hasError = false;

    if (!email) {
      showError(emailInput, "This field is required");
      hasError = true;
    }

    if (!password) {
      showError(passwordInput, "This field is required");
      hasError = true;
    }

    if (password !== confirm) {
      showError(confirmInput, "Passwords do not match");
      hasError = true;
    }

    if (hasError) return;

    try {
      await AuthService.register(email, password);
      window.location.href = "login.html";
    } catch (err) {
      showError(emailInput, err.message);
    }
  });

});
