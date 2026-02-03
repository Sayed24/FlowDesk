export function setTheme(color) {
  document.documentElement.style.setProperty("--accent", color);
  localStorage.setItem("flowdesk_theme", color);
}

const saved = localStorage.getItem("flowdesk_theme");
if (saved) setTheme(saved);

