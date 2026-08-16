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

// Splits paragraphs into two columns by character count, keeping the
// left column always at least as large as the right (newspaper-style).
function splitParagraphsForColumns(paragraphs) {
  if (paragraphs.length <= 1) return { left: paragraphs, right: [] };

  const lengths = paragraphs.map((p) => p.length);
  const total = lengths.reduce((a, b) => a + b, 0);

  let leftLen = 0;
  let splitAt = paragraphs.length;
  for (let i = 0; i < paragraphs.length; i++) {
    const nextLeftLen = leftLen + lengths[i];
    if (nextLeftLen / total >= 0.55 && i < paragraphs.length - 1) {
      splitAt = i + 1;
      break;
    }
    leftLen = nextLeftLen;
  }
  return { left: paragraphs.slice(0, splitAt), right: paragraphs.slice(splitAt) };
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
      const isManualColumns = expo.description && !Array.isArray(expo.description);
      const { left, right } = isManualColumns
        ? { left: expo.description.left || [], right: expo.description.right || [] }
        : splitParagraphsForColumns(expo.description || []);
      const linksHtml =
        expo.links && expo.links.length
          ? `<div class="expo-links">${expo.links
              .map((l) => `<a href="${l.href}" target="_blank" rel="noopener">${l.label}</a>`)
              .join("")}</div>`
          : "";
      const leftLinks = expo.linksColumn === "left" ? linksHtml : "";
      const rightLinks = expo.linksColumn === "right" ? linksHtml : "";
      const outsideLinks = !expo.linksColumn ? linksHtml : "";

      const leftHtml = left.map((p) => `<p>${p}</p>`).join("") + leftLinks;
      const rightHtml = right.map((p) => `<p>${p}</p>`).join("") + rightLinks;

      const metaContent = expo.subtitle || [expo.venue, expo.date].filter(Boolean).join(" — ");

      return `
        <section class="expo-block">
          <hr class="expo-separator">
          <div class="expo-intro">
            <h2 class="expo-title">${expo.link ? `<a href="${expo.link}" target="_blank" rel="noopener">${expo.title}</a>` : expo.title}</h2>
            <div class="expo-meta">${expo.link ? `<a href="${expo.link}" target="_blank" rel="noopener">${metaContent}</a>` : metaContent}</div>
            <div class="expo-description">
              <div class="expo-description__col">${leftHtml}</div>
              <div class="expo-description__col">${rightHtml}</div>
            </div>
            ${outsideLinks}
          </div>
          <div class="gallery">${gallery}</div>
        </section>`;
    })
    .join("");

  const lightbox = document.getElementById("lightbox");
  const lightboxStage = lightbox.querySelector(".lightbox__stage");
  const lightboxImg = lightbox.querySelector("img");
  const lightboxCaption = lightbox.querySelector(".lightbox__caption");
  let currentIndex = 0;

  function open(i, e) {
    currentIndex = i;
    const item = allImages[currentIndex];
    lightboxImg.src = item.src;
    lightboxImg.alt = item.title || "";
    lightboxCaption.textContent = [item.title, item.caption].filter(Boolean).join(" — ");
    if (!lightbox.classList.contains("is-open")) {
      lightboxStage.style.transformOrigin = e ? `${e.clientX}px ${e.clientY}px` : "50% 50%";
    }
    lightbox.classList.add("is-open");
  }

  function showRelative(delta) {
    open((currentIndex + delta + allImages.length) % allImages.length);
  }

  container.querySelectorAll(".gallery__item").forEach((el) => {
    el.addEventListener("click", (e) => open(Number(el.dataset.index), e));
  });

  lightbox.querySelector(".lightbox__close").addEventListener("click", () => {
    lightbox.classList.remove("is-open");
  });
  lightbox.querySelector(".lightbox__nav--prev").addEventListener("click", () => showRelative(-1));
  lightbox.querySelector(".lightbox__nav--next").addEventListener("click", () => showRelative(1));
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) lightbox.classList.remove("is-open");
  });
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") lightbox.classList.remove("is-open");
    if (e.key === "ArrowLeft") showRelative(-1);
    if (e.key === "ArrowRight") showRelative(1);
  });
}

document.addEventListener("DOMContentLoaded", loadExhibitions);
