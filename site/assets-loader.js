(() => {
  "use strict";
  const THEME_KEY = "icysell-theme-v1";
  function setupTheme() {
    const button = document.getElementById("themeToggle");
    const apply = (mode, persist = false) => {
      const theme = mode === "light" ? "light" : "dark";
      document.documentElement.dataset.theme = theme;
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "light" ? "#f2f6fb" : "#0b111b");
      if (button) {
        button.setAttribute("aria-label", theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему");
        button.setAttribute("aria-pressed", String(theme === "light"));
        button.innerHTML = theme === "dark" ? '<span aria-hidden="true">☼</span>' : '<span aria-hidden="true">☾</span>';
      }
      if (persist) { try { localStorage.setItem(THEME_KEY, theme); } catch (_) {} }
    };
    let saved = "dark";
    try { const value = localStorage.getItem(THEME_KEY); if (value === "light" || value === "dark") saved = value; } catch (_) {}
    apply(saved);
    button?.addEventListener("click", () => apply(document.documentElement.dataset.theme === "dark" ? "light" : "dark", true));
    window.addEventListener("storage", event => { if (event.key === THEME_KEY) apply(event.newValue); });
  }
  async function unpack(path) {
    const response = await fetch(path, { cache: "no-cache" });
    if (!response.ok) throw new Error(`Failed to load ${path}: ${response.status}`);
    const bytes = await response.arrayBuffer();
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
    return new Response(stream).text();
  }
  async function loadText(path) {
    const response = await fetch(path, { cache: "no-cache" });
    if (!response.ok) throw new Error(`Failed to load ${path}: ${response.status}`);
    return response.text();
  }
  async function start() {
    setupTheme();
    const css = document.createElement("style");
    css.textContent = await unpack("./styles.css.gz?v=20261127i");
    document.head.append(css);
    const system = document.createElement("style");
    system.textContent = await loadText("./design-system.css?v=20261127i");
    document.head.append(system);
    const app = document.createElement("script");
    app.textContent = await unpack("./app.js.gz?v=20261127i");
    document.body.append(app);
  }
  start().catch(error => {
    console.error("Icysell startup failed:", error);
    const app = document.getElementById("app");
    if (app) app.innerHTML = '<div class="container page"><h1>Не удалось загрузить сайт</h1><p>Обнови страницу или попробуй другой браузер.</p></div>';
  });
})();
