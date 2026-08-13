function numColumnsForWidth() {
  const w = window.innerWidth;
  if (w <= 560) return 1;
  if (w <= 900) return 2;
  return 3;
}

// Distributes items into columns so the LAST item always ends up
// at the bottom of the first (leftmost) column, regardless of count.
function distributeIntoColumns(items, numColumns) {
  const columns = Array.from({ length: numColumns }, () => []);
  for (let i = items.length - 1; i >= 0; i--) {
    const col = (items.length - 1 - i) % numColumns;
    columns[col].push(items[i]);
  }
  columns.forEach((col) => col.reverse());
  return columns;
}

function renderGallery(images, indexOffset) {
  const numColumns = numColumnsForWidth();
  const withIndex = images.map((img, i) => ({ ...img, __index: indexOffset + i }));
  const columns = distributeIntoColumns(withIndex, numColumns);

  return columns
    .map((col) => {
      const items = col
        .map(
          (img) => `
        <figure class="gallery__item" data-index="${img.__index}">
          <img src="${img.src}" alt="${img.title || ""}">
          <figcaption class="gallery__caption">
            <strong>${img.title || ""}</strong>${img.caption ? " — " + img.caption : ""}
          </figcaption>
        </figure>`
        )
        .join("");
      return `<div class="gallery__column">${items}</div>`;
    })
    .join("");
}

async function loadExhibitions() {
  const container = document.getElementById("exhibitions-list");
  if (!container) return;

  const res = await fetch("data/exhibitions.json");
  const exhibitions = await res.json();

  let index = 0;
  const allImages = [];

  container.innerHTML = exhibitions
    .map((expo) => {
      const startIndex = index;
      expo.images.forEach((img) => allImages.push(img));
      index += expo.images.length;

      const gallery = renderGallery(expo.images, startIndex);
      const paragraphs = (expo.description || []).map((p) => `<p>${p}</p>`).join("");

      return `
        <section class="expo-block">
          <hr class="expo-separator">
          <div class="expo-intro">
            <h2 class="expo-title">${expo.title}</h2>
            <div class="expo-meta">${[expo.venue, expo.date].filter(Boolean).join(" — ")}</div>
            <div class="expo-description">${paragraphs}</div>
          </div>
          <div class="gallery">${gallery}</div>
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
