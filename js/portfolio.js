async function loadExhibitions() {
  const container = document.getElementById("exhibitions-list");
  if (!container) return;

  const res = await fetch("data/exhibitions.json");
  const exhibitions = await res.json();

  container.innerHTML = exhibitions
    .map((expo) => {
      const images = expo.images
        .map(
          (img) => `
          <figure class="gallery__item">
            <img src="${img.src}" alt="${img.title || ""}" loading="lazy">
            <figcaption class="gallery__caption">
              <strong>${img.title || ""}</strong>${img.caption ? " — " + img.caption : ""}
            </figcaption>
          </figure>`
        )
        .join("");

      const paragraphs = (expo.description || []).map((p) => `<p>${p}</p>`).join("");

      return `
        <section class="expo-block">
          <hr class="expo-separator">
          <div class="expo-intro">
            <h2 class="expo-title">${expo.title}</h2>
            <div class="expo-meta">${[expo.venue, expo.date].filter(Boolean).join(" — ")}</div>
            <div class="expo-description">${paragraphs}</div>
          </div>
          <div class="gallery">${images}</div>
        </section>`;
    })
    .join("");
}

document.addEventListener("DOMContentLoaded", loadExhibitions);
