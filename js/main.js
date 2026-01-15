// Highlight the active navigation link based on current URL
document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".nav-link");
  const bottomLinks = document.querySelectorAll(".bottom-nav a");
  const currentPage = window.location.pathname.split("/").pop();

  // Sidebar navigation
  navLinks.forEach(link => {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // Mobile bottom nav
  bottomLinks.forEach(link => {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
});
