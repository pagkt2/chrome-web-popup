const SCRIPT_ID = "time-logging-reminder";

const DEFAULT_MATCHES = [
  "https://docs.google.com/*",
  "https://drive.google.com/*",
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
    const origin = matchPatternToOrigin(pattern);
    if (!origin) continue;
    const granted = await chrome.permissions.contains({ origins: [origin] });
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

/** Best-effort: derive an origin permission entry from a match pattern. */
function matchPatternToOrigin(pattern) {
  try {
    const m = pattern.match(/^(\*|https?|file|ftp):\/\/([^/]+)\//);
    if (!m) return null;
    const scheme = m[1] === "*" ? "https" : m[1];
    const host = m[2];
    return `${scheme}://${host}/*`;
  } catch {
    return null;
  }
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
