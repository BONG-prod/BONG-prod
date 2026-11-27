(() => {
  "use strict";
  async function unpack(path) {
    const response = await fetch(path, { cache: "no-cache" });
    if (!response.ok) throw new Error(`Failed to load ${path}: ${response.status}`);
    if (!("DecompressionStream" in window)) throw new Error("This browser does not support compressed site assets.");
    const compressed = await response.arrayBuffer();
    const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream("gzip"));
    return new Response(stream).text();
  }
  async function start() {
    const css = await unpack("./styles.css.gz");
    const style = document.createElement("style");
    style.dataset.icysell = "site-styles";
    style.textContent = css;
    document.head.append(style);

    const javascript = await unpack("./app.js.gz");
    const script = document.createElement("script");
    script.dataset.icysell = "site-app";
    script.textContent = javascript;
    document.body.append(script);
  }
  start().catch(error => {
    console.error("Icysell could not start:", error);
    const app = document.getElementById("app");
    if (app) app.innerHTML = '<div class="container page"><h1>Не удалось загрузить сайт</h1><p>Обнови страницу или попробуй другой браузер.</p></div>';
  });
})();
