const appNameEl = document.getElementById("appName");
const enabledEl = document.getElementById("enabled");
const extraMatchesEl = document.getElementById("extraMatches");
const saveBtn = document.getElementById("save");
const statusEl = document.getElementById("status");

function linesToPatterns(text) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function patternsToOrigins(patterns) {
  return patterns
    .map((pattern) => {
      try {
        const m = pattern.match(/^(\*|https?|file|ftp):\/\/([^/]+)\//);
        if (!m) return null;
        const scheme = m[1] === "*" ? "https" : m[1];
        const host = m[2];
        return `${scheme}://${host}/*`;
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function showStatus(message, kind) {
  statusEl.hidden = false;
  statusEl.textContent = message;
  statusEl.className = `status ${kind}`;
}

async function load() {
  const { appName, enabled, extraMatches } = await chrome.storage.sync.get({
    appName: "your time tracker",
    enabled: true,
    extraMatches: [],
  });
  appNameEl.value = appName;
  enabledEl.checked = enabled;
  extraMatchesEl.value = (extraMatches || []).join("\n");
}

saveBtn.addEventListener("click", async () => {
  statusEl.hidden = true;
  const appName = appNameEl.value.trim() || "your time tracker";
  const enabled = enabledEl.checked;
  const extraMatches = linesToPatterns(extraMatchesEl.value);

  const origins = patternsToOrigins(extraMatches);
  const uniqueOrigins = [...new Set(origins)];

  if (uniqueOrigins.length > 0) {
    const granted = await chrome.permissions.request({
      origins: uniqueOrigins,
      permissions: [],
    });
    if (!granted) {
      showStatus("Host permission was not granted; extra patterns were not saved.", "error");
      return;
    }
  }

  await chrome.storage.sync.set({ appName, enabled, extraMatches });

  try {
    const res = await chrome.runtime.sendMessage({ type: "reRegisterContentScripts" });
    if (res && !res.ok) {
      showStatus(res.error || "Could not update injected scripts.", "error");
      return;
    }
  } catch (e) {
    showStatus(String(e?.message || e), "error");
    return;
  }

  showStatus("Saved.", "ok");
});

load();
