# Time logging reminder (Chrome extension)

[![Repository](https://img.shields.io/badge/GitHub-pagkt2%2Fchrome--web--popup-blue)](https://github.com/pagkt2/chrome-web-popup)

A small **Manifest V3** Chrome extension that shows an on-page reminder on Google Docs, Google Drive, and any other URLs you add—so you remember to **log how much time** you spend in the tool you name (for example Harvest, Toggl, or an internal tracker).

**Repository:** [github.com/pagkt2/chrome-web-popup](https://github.com/pagkt2/chrome-web-popup)

## What it does

- When you open a matching page, a **modal** appears: *“Be sure to log your time in …”* with the name you set.
- After you click **Got it** (or the dimmed backdrop), the reminder **stays dismissed for that browser tab** until you close the tab (uses `sessionStorage`).
- Chrome does **not** provide a built-in “minutes per site per day” report on desktop; this extension is a **nudge to log time yourself**, not automatic time tracking.

## Install (load unpacked)

1. Open Chrome and go to `chrome://extensions`.
2. Turn on **Developer mode** (top right).
3. Click **Load unpacked** and select this project folder (the one that contains `manifest.json`).

After loading, you can **pin** the extension from the puzzle icon in the toolbar if you want quick access.

## Configure sites and the message

You do **not** need to edit code for extra websites.

1. Click the extension icon → **Open settings** (or right-click the extension → **Options**).
2. **Log time in (shown as X)** — name of the app or system you log time in.
3. **Enable reminders** — master on/off.
4. **Extra URL match patterns** — one [Chrome match pattern](https://developer.chrome.com/docs/extensions/develop/concepts/match-patterns) per line (for example `https://app.example.com/*`).
5. Click **Save**. Chrome will ask for permission for each new host; approve so the script can run on those pages.

### Default sites (in code)

Out of the box, these patterns are always included (see `DEFAULT_MATCHES` in `background.js`):

- `https://docs.google.com/*`
- `https://drive.google.com/*`

Change those only if you want different **defaults** for every install from this repo.

## Project layout

| File | Purpose |
|------|---------|
| `manifest.json` | Extension manifest (MV3), permissions, UI entry points |
| `background.js` | Registers the content script for permitted URL patterns |
| `content.js` | Injects the reminder UI on matched pages |
| `overlay.css` | Modal styling (scoped under `#time-logging-reminder-root`) |
| `options.html` / `options.js` / `options.css` | Settings page |
| `popup.html` / `popup.js` / `popup.css` | Toolbar popup (shortcut to settings) |

## Privacy

Settings are stored in **`chrome.storage.sync`** (Chrome sync, if you use it). The extension does not send your browsing data to a custom backend; it only runs the reminder script on URLs you allow.

## License

No license file is included yet; add one if you plan to share or distribute the project beyond personal use.
