const SCRIPT_ID = "time-logging-reminder";

const DEFAULT_MATCHES = [
  /* Google Docs, Sheets, NotebookLM (not Drive or other apps) */
  "https://docs.google.com/document/*",
  "https://docs.google.com/spreadsheets/*",
  "https://notebooklm.google.com/*",
  /* YouTube (www, mobile, Music, etc.) */
  "https://*.youtube.com/*",
  /* Finance & investing */
  "https://*.fidelity.com/*",
  "https://*.usbank.com/*",
  "https://*.schwab.com/*",
  "https://humaninterest.com/*",
  "https://*.humaninterest.com/*",
  "https://*.tradingview.com/*",
  /* Social */
  "https://twitter.com/*",
  "https://*.twitter.com/*",
  "https://x.com/*",
  "https://*.x.com/*",
];

async function getAllMatches() {
  const { extraMatches = [] } = await chrome.storage.sync.get("extraMatches");
  const merged = [...DEFAULT_MATCHES];
  for (const p of extraMatches) {
    if (p && typeof p === "string" && !merged.includes(p)) merged.push(p);
  }
  return merged;
}

async function filterPermittedMatches(patterns) {
  const out = [];
  for (const pattern of patterns) {
    const granted = await chrome.permissions.contains({ origins: [pattern] });
    if (granted) out.push(pattern);
  }
  return out;
}

async function ensureContentScripts() {
  const all = await getAllMatches();
  const matches = await filterPermittedMatches(all);

  try {
    await chrome.scripting.unregisterContentScripts({ ids: [SCRIPT_ID] });
  } catch {
    /* not registered yet */
  }

  if (matches.length === 0) return;

  await chrome.scripting.registerContentScripts([
    {
      id: SCRIPT_ID,
      matches,
      js: ["content.js"],
      css: ["overlay.css"],
      runAt: "document_idle",
    },
  ]);
}

chrome.runtime.onInstalled.addListener(() => {
  ensureContentScripts();
});

chrome.runtime.onStartup.addListener(() => {
  ensureContentScripts();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.extraMatches) {
    ensureContentScripts();
  }
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "reRegisterContentScripts") {
    ensureContentScripts()
      .then(() => sendResponse({ ok: true }))
      .catch((err) => sendResponse({ ok: false, error: String(err?.message || err) }));
    return true;
  }
});
