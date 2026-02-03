export function suggestTask() {
  const suggestions = [
    "Review weekly goals",
    "Refactor old tasks",
    "Plan tomorrow",
    "Clean up notes"
  ];
  return suggestions[Math.floor(Math.random() * suggestions.length)];
}

