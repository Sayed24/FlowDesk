const STORAGE_KEYS = [
  "flowdesk_tasks",
  "flowdesk_notes",
  "flowdesk_goals",
  "flowdesk_habits"
];

export function exportData() {
  const data = {};
  STORAGE_KEYS.forEach(key => {
    data[key] = JSON.parse(localStorage.getItem(key) || "[]");
  });

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "flowdesk-backup.json";
  a.click();
}

export function importData(file) {
  const reader = new FileReader();
  reader.onload = e => {
    const data = JSON.parse(e.target.result);
    STORAGE_KEYS.forEach(key => {
      if (data[key]) {
        localStorage.setItem(key, JSON.stringify(data[key]));
      }
    });
    alert("Data restored successfully");
    location.reload();
  };
  reader.readAsText(file);
}

