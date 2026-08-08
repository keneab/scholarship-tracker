# Departures — Scholarship Tracker

A single-page tracker for scholarship and opportunity applications, styled
like an airport departures board. Each entry shows how many days remain
until its deadline, color-coded by urgency for an at-a-glance view of what
needs attention.

## Features

- **Application tracking**: name, country, deadline, status, a link, and
  free-form notes (e.g. documents still needed).
- **Automatic urgency sorting** — whatever's due soonest appears at the top.
- **Color-coded countdown**: red at 7 days or less, amber at 30 days or
  less, teal beyond that, gray/struck-through once a deadline has passed.
- **Status filters**: Researching, Drafting, Submitted, Interview, Decision,
  Archived.
- **No account or server required.** Data is saved automatically in the
  browser's local storage and persists across sessions.

## Usage

1. Open `index.html` in a browser.
2. Click **+ Add scholarship** and fill in the details. Name and deadline
   are required; the rest is optional.
3. Click any row to edit or delete it (the delete option appears while
   editing an existing entry).
4. Use the filter chips to narrow the board to a single status, or select
   **All** to see everything.
5. **Export** downloads a JSON backup of the current board. **Import**
   loads a JSON file back in, replacing whatever is currently on the board.

A single example entry is preloaded on first load — edit or delete it once
real entries have been added.

### A note on where data is saved

Browser local storage is tied to the exact address the page is opened from.
Opening the file directly (`file://...`), running it on a local server
(`http://localhost:...`), and visiting a deployed version
(`https://username.github.io/...`) are each treated as separate storage —
entries saved in one won't appear in another. This is expected behavior,
not a bug; pick one way of running the site and stick with it, or use
Export/Import to move data between them.

## Running locally

Open `index.html` directly, or serve it:

```bash
cd scholarship-tracker
python3 -m http.server 8000
# visit http://localhost:8000
```
