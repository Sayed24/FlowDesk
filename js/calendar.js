let events = JSON.parse(localStorage.getItem("flowdesk_events")) || [];

function render() {
  const ul = document.getElementById("events");
  ul.innerHTML = "";
  events.forEach(e => {
    const li = document.createElement("li");
    li.textContent = `${e.date}: ${e.text}`;
    ul.appendChild(li);
  });
}

document.getElementById("addEvent").onclick = () => {
  events.push({
    date: date.value,
    text: eventText.value
  });
  localStorage.setItem("flowdesk_events", JSON.stringify(events));
  render();
};

render();

