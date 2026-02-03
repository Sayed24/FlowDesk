if ("Notification" in window) {
  Notification.requestPermission();
}

export function notify(msg) {
  if (Notification.permission === "granted") {
    new Notification("FlowDesk", { body: msg });
  }
}

