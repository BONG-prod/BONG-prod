(() => {
  "use strict";
  const KEY = "icysell-theme-v1";
  const button = document.getElementById("themeToggle");
  function apply(mode, save = false) {
    const value = mode === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = value;
    if (button) {
      button.setAttribute("aria-label", value === "dark" ? "Включить светлую тему" : "Включить тёмную тему");
      button.setAttribute("aria-pressed", String(value === "light"));
      button.innerHTML = value === "dark" ? '<span aria-hidden="true">☼</span>' : '<span aria-hidden="true">☾</span>';
    }
    if (save) { try { localStorage.setItem(KEY, value); } catch (_) {} }
  }
  let initial = "dark";
  try { const value = localStorage.getItem(KEY); if (value === "light" || value === "dark") initial = value; } catch (_) {}
  apply(initial);
  button?.addEventListener("click", () => apply(document.documentElement.dataset.theme === "dark" ? "light" : "dark", true));
  window.addEventListener("storage", event => { if (event.key === KEY) apply(event.newValue); });
})();
