/* Icysell static renderer — PHP templates are pre-rendered, with local JS behavior. */
(() => {
  "use strict";
  const BASE = "/BONG-prod/icysell";
  const BUNDLE_PARTS = [
    "00.txt","01.txt",
    "02-00.txt","02-01.txt","02-02.txt","02-03.txt","02-04.txt",
    "02-05.txt","02-06.txt","02-07.txt","02-08.txt","02-09.txt",
    "03.txt","04.txt","05.txt","06.txt",
    "07-00.txt","07-01.txt","07-02.txt","08.txt"
  ];
  const fail = (error) => {
    console.error("Icysell could not load", error);
    document.body.innerHTML = '<main style="max-width:760px;margin:12vh auto;padding:24px;color:#e5e7eb;font:16px/1.6 system-ui"><h1>Icysell временно недоступен</h1><p>Не удалось загрузить статическую версию сайта. Перезагрузите страницу.</p></main>';
  };
  async function start() {
    const parts = await Promise.all(BUNDLE_PARTS.map(async (name) => {
      const response = await fetch(BASE + "/bundle/" + name, { cache: "no-cache" });
      if (!response.ok) throw new Error("Bundle part " + name + ": HTTP " + response.status);
      return response.text();
    }));
    const binary = atob(parts.join(""));
    const bytes = Uint8Array.from(binary, ch => ch.charCodeAt(0));
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
    const payload = JSON.parse(await new Response(stream).text());
    const params = new URLSearchParams(location.search);
    const page = params.get("page") || "home";
    let html = payload.pages[page] || payload.pages.home;
    for (const [path, svg] of Object.entries(payload.assets)) {
      const objectUrl = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
      html = html.split(BASE + path).join(objectUrl);
    }
    document.open();
    document.write(html);
    document.close();
  }
  start().catch(fail);
})();