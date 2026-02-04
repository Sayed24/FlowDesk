
const session = localStorage.getItem("flowdesk_session");

if (!session) {
  location.href = "login.html";
}
