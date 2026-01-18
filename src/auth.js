<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FlowDesk • Authentication</title>

  <!-- CSS -->
  <link rel="stylesheet" href="css/variables.css" />
  <link rel="stylesheet" href="css/base.css" />
  <link rel="stylesheet" href="css/components.css" />
  <link rel="stylesheet" href="css/playful.css" />
  <link rel="stylesheet" href="css/responsive.css" />

  <style>
    body {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: var(--bg);
    }

    .auth-card {
      width: 100%;
      max-width: 420px;
      padding: 2rem;
      border-radius: 16px;
      background: var(--surface);
      box-shadow: var(--card-shadow);
    }

    .auth-card h2 {
      text-align: center;
      margin-bottom: 1rem;
    }

    .auth-card input {
      width: 100%;
      padding: 12px;
      margin-bottom: 12px;
      border-radius: 10px;
      border: 1px solid var(--border);
      font-size: 1rem;
    }

    .auth-card button {
      width: 100%;
      padding: 12px;
      border-radius: 12px;
      font-size: 1rem;
    }

    .auth-switch {
      text-align: center;
      margin-top: 1rem;
      font-size: 0.9rem;
      cursor: pointer;
      color: var(--primary);
    }

    .auth-error {
      color: #ef4444;
      text-align: center;
      margin-bottom: 0.5rem;
      display: none;
    }
  </style>
</head>

<body>

<div class="auth-card">
  <h2 id="authTitle" data-i18n="auth.login_title"></h2>

  <div class="auth-error" id="authError"></div>

  <input
    type="email"
    id="emailInput"
    placeholder="Email"
    data-i18n-placeholder="auth.email"
  />

  <input
    type="password"
    id="passwordInput"
    placeholder="Password"
    data-i18n-placeholder="auth.password"
  />

  <button class="btn primary" id="authSubmitBtn" data-i18n="auth.login_btn"></button>

  <div class="auth-switch" id="authSwitch" data-i18n="auth.switch_register"></div>
</div>

<!-- JS -->
<script src="js/i18n.js"></script>
<script src="js/auth.js"></script>

</body>
</html>
