(function () {
  const FLAG = "timeLoggingReminderDismissed";

  function readSettings() {
    return chrome.storage.sync.get({
      appName: "your time tracker",
      enabled: true,
    });
  }

  function mountOverlay(appName) {
    if (document.getElementById("time-logging-reminder-root")) return;

    const root = document.createElement("div");
    root.id = "time-logging-reminder-root";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-label", "Time logging reminder");

    const backdrop = document.createElement("div");
    backdrop.className = "tlr-backdrop";

    const card = document.createElement("div");
    card.className = "tlr-card";

    const title = document.createElement("p");
    title.className = "tlr-title";
    title.textContent = "Time logging";

    const body = document.createElement("p");
    body.className = "tlr-body";
    body.textContent = `Be sure to log your time in ${appName}.`;

    const actions = document.createElement("div");
    actions.className = "tlr-actions";

    const ok = document.createElement("button");
    ok.type = "button";
    ok.className = "tlr-btn tlr-btn-primary";
    ok.textContent = "Got it";

    const dismiss = () => {
      try {
        sessionStorage.setItem(FLAG, "1");
      } catch {
        /* private mode, etc. */
      }
      root.remove();
    };

    ok.addEventListener("click", dismiss);
    backdrop.addEventListener("click", dismiss);

    actions.appendChild(ok);
    card.appendChild(title);
    card.appendChild(body);
    card.appendChild(actions);
    root.appendChild(backdrop);
    root.appendChild(card);

    document.documentElement.appendChild(root);
    ok.focus();
  }

  readSettings().then(({ appName, enabled }) => {
    if (!enabled) return;
    try {
      if (sessionStorage.getItem(FLAG)) return;
    } catch {
      /* continue */
    }
    mountOverlay(appName.trim() || "your time tracker");
  });
})();
