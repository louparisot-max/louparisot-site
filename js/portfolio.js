async function loadExhibitions() {
  const container = document.getElementById("exhibitions-list");
  if (!container) return;

  const res = await fetch("data/exhibitions.json");
  const exhibitions = await res.json();

  let index = 0;
  const allImages = [];

  container.innerHTML = exhibitions
    .map((expo) => {
      const images = expo.images
        .map((img) => {
          allImages.push(img);
          const i = index++;
          return `
          <figure class="gallery__item" data-index="${i}">
            <img src="${img.src}" alt="${img.title || ""}">
            <figcaption class="gallery__caption">
              <strong>${img.title || ""}</strong>${img.caption ? " — " + img.caption : ""}
            </figcaption>
          </figure>`;
        })
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

  const lightbox = document.getElementById("lightbox");
  const lightboxImg = lightbox.querySelector("img");
  const lightboxCaption = lightbox.querySelector(".lightbox__caption");

  function open(i) {
    const item = allImages[i];
    lightboxImg.src = item.src;
    lightboxImg.alt = item.title || "";
    lightboxCaption.textContent = [item.title, item.caption].filter(Boolean).join(" — ");
    lightbox.classList.add("is-open");
  }

  container.querySelectorAll(".gallery__item").forEach((el) => {
    el.addEventListener("click", () => open(Number(el.dataset.index)));
  });

  lightbox.querySelector(".lightbox__close").addEventListener("click", () => {
    lightbox.classList.remove("is-open");
  });
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) lightbox.classList.remove("is-open");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") lightbox.classList.remove("is-open");
  });
}

document.addEventListener("DOMContentLoaded", loadExhibitions);
