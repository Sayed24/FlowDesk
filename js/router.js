/* ======================================================
   FlowDesk — Router
====================================================== */

window.Router = (() => {

  const routes = {
    "/": "index.html",
    "/login": "login.html",
    "/register": "register.html",
    "/dashboard": "dashboard.html"
  };

  const protectedRoutes = ["/dashboard"];

  const isAuthenticated = () => {
    return Boolean(StorageService.getUser());
  };

  const navigate = (path) => {
    if (protectedRoutes.includes(path) && !isAuthenticated()) {
      window.location.href = routes["/login"];
      return;
    }

    const target = routes[path];
    if (target) {
      window.location.href = target;
    }
  };

  const guard = () => {
    const path = window.location.pathname.replace(".html", "") || "/";
    if (protectedRoutes.includes(path) && !isAuthenticated()) {
      window.location.replace(routes["/login"]);
    }
  };

  return {
    navigate,
    guard
  };

})();
