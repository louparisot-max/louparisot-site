async function loadGallery() {
  const grid = document.getElementById("gallery-grid");
  if (!grid) return;

  const res = await fetch("data/gallery.json");
  const items = await res.json();

  grid.innerHTML = items
    .map(
      (item, i) => `
      <figure class="gallery__item" data-index="${i}">
        <img src="${item.src}" alt="${item.title || ""}" loading="lazy">
        <figcaption class="gallery__caption">
          <strong>${item.title || ""}</strong>${item.year ? ", " + item.year : ""}${
        item.medium ? " — " + item.medium : ""
      }
        </figcaption>
      </figure>`
    )
    .join("");

  const lightbox = document.getElementById("lightbox");
  const lightboxImg = lightbox.querySelector("img");
  const lightboxCaption = lightbox.querySelector(".lightbox__caption");
  let current = 0;

  function show(index) {
    current = (index + items.length) % items.length;
    const item = items[current];
    lightboxImg.src = item.src;
    lightboxImg.alt = item.title || "";
    lightboxCaption.textContent = [item.title, item.year, item.medium, item.caption]
      .filter(Boolean)
      .join(" — ");
    lightbox.classList.add("is-open");
  }

  grid.querySelectorAll(".gallery__item").forEach((el) => {
    el.addEventListener("click", () => show(Number(el.dataset.index)));
  });

  lightbox.querySelector(".lightbox__close").addEventListener("click", () => {
    lightbox.classList.remove("is-open");
  });
  lightbox.querySelector(".lightbox__nav--prev").addEventListener("click", () => show(current - 1));
  lightbox.querySelector(".lightbox__nav--next").addEventListener("click", () => show(current + 1));
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) lightbox.classList.remove("is-open");
  });
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") lightbox.classList.remove("is-open");
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });
}

document.addEventListener("DOMContentLoaded", loadGallery);
