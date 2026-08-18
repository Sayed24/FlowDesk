# FlowDesk

FlowDesk is a framework-free, offline-first productivity dashboard built with HTML, CSS and Vanilla JavaScript. It is designed as a portfolio project that demonstrates responsive UI engineering, IndexedDB persistence, local authentication, CRUD workflows, offline support, analytics, keyboard shortcuts and GitHub Pages deployment.

## Features

- Local login/register with SHA-256 password hashing
- Demo mode
- Tasks CRUD with priority, due dates, status, search, filtering, completion and time tracking
- Notes CRUD with tags and pinning
- Goals CRUD with progress tracking
- Habits CRUD with weekly check-ins and streaks
- Calendar events and task deadlines
- Analytics generated from local data
- Local team workspace demo with roles
- Light/dark mode plus accent theme controls
- In-app notifications and optional browser notifications
- Command/search palette and keyboard shortcuts
- JSON backup/restore, CSV export and print/PDF report
- Installable PWA and offline caching
- Responsive desktop, tablet and mobile navigation

## Run locally

Because ES modules, IndexedDB and the service worker work best over HTTP, use any simple local server instead of opening `index.html` directly.

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## GitHub Pages

Push the entire project to a repository, open **Settings → Pages**, select **Deploy from a branch**, then publish the repository root from `main`.

## Privacy

FlowDesk is browser-local. It does not send personal productivity data to a server.
