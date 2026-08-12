async function loadEntries(jsonPath, containerId, render) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const res = await fetch(jsonPath);
  const items = await res.json();
  container.innerHTML = items.map(render).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  loadEntries(
    "data/news.json",
    "news-list",
    (item) => `
      <article class="entry">
        <div class="entry__meta">${item.date || ""}</div>
        <h2 class="entry__title">${item.title || ""}</h2>
        <p class="entry__text">${item.text || ""}</p>
        ${item.link ? `<a class="entry__link" href="${item.link}" target="_blank" rel="noopener">En savoir plus →</a>` : ""}
      </article>`
  );

  loadEntries(
    "data/texts.json",
    "texts-list",
    (item) => `
      <article class="entry">
        <div class="entry__meta">${[item.source, item.date].filter(Boolean).join(" — ")}</div>
        <h2 class="entry__title">${item.title || ""}</h2>
        <p class="entry__text">${item.excerpt || ""}</p>
        ${item.pdf ? `<a class="entry__link" href="${item.pdf}" target="_blank" rel="noopener">Lire le PDF →</a>` : ""}
      </article>`
  );
});
