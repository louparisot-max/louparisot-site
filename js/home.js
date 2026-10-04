const DESIGN_WIDTH = 1440;
const TITLE_TOP = 10;

const SPARK_RAIN_COUNT = 22;

function seededRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function renderSparkField() {
  const field = document.getElementById("spark-field");
  if (!field) return;
  const rand = seededRandom(42);
  let html = "";
  for (let i = 0; i < SPARK_RAIN_COUNT; i++) {
    const left = (rand() * 100).toFixed(1);
    const length = Math.round(24 + rand() * 46);
    const duration = (1.6 + rand() * 2.2).toFixed(2);
    const delay = (rand() * 5).toFixed(2);
    const steps = 6 + Math.floor(rand() * 5);
    html += `<div class="spark" style="left:${left}%; width:${length}px; animation-duration:${duration}s; animation-delay:-${delay}s; animation-timing-function:steps(${steps}, end);"></div>`;
  }
  field.innerHTML = html;
}

function pct(value, base) {
  return `${(value / base) * 100}%`;
}

function wrapLetters(text) {
  return text
    .split("")
    .map((ch, i) => {
      const display = ch === " " ? "&nbsp;" : ch;
      return `<span style="transition-delay:${i * 30}ms">${display}</span>`;
    })
    .join("");
}

let homeLightboxIndex = [];

function renderItem(item, sectionHeight, globalIndex, delayMs) {
  const style = `top:${pct(item.top, sectionHeight)}; left:${pct(item.left, DESIGN_WIDTH)}; width:${pct(item.width, DESIGN_WIDTH)}; height:${pct(item.height, sectionHeight)}; z-index:${item.z}; transition-delay:${delayMs || 0}ms;`;

  if (item.type === "color") {
    return `<div class="home-item home-item--color" style="${style} background:${item.color};"></div>`;
  }

  const tag = item.title
    ? `<div class="home-tag" style="top:${pct(item.tagTop, sectionHeight)}; left:${pct(item.tagLeft, DESIGN_WIDTH)};"><strong>${item.title}</strong> — ${item.meta}</div>`
    : "";

  const bg = item.bg ? ` background-color:${item.bg};` : "";

  if (item.type === "video") {
    const video = `<video src="${item.src}" autoplay muted loop playsinline></video>`;
    const media = item.link
      ? `<a class="home-item__link" href="${item.link}" target="_blank" rel="noopener">${video}</a>`
      : video;
    return `<div class="home-item" style="${style}${bg}">${media}</div>${tag}`;
  }

  return `<div class="home-item" style="${style}${bg}" data-lightbox-index="${globalIndex}"><img src="${item.src}" alt="${item.title || ""}"></div>${tag}`;
}

function renderSection(section) {
  const canvasStyle = `padding-top:${(section.height / DESIGN_WIDTH) * 100}%;`;
  const titleStyle = `top:${pct(TITLE_TOP, section.height)}; left:0;`;

  const items = section.items
    .map((item, i) => {
      if (item.type === "image") homeLightboxIndex.push(item);
      return renderItem(item, section.height, item.type === "image" ? homeLightboxIndex.length - 1 : -1, i * 160);
    })
    .join("");

  return `<div class="home-section">
    <div class="home-section__canvas" style="${canvasStyle}">
      <a class="home-section__title" style="${titleStyle}" href="${section.link}" target="_blank" rel="noopener">${wrapLetters(section.title)}<span class="arrow">&gt;</span></a>
      ${items}
    </div>
  </div>`;
}

function renderSeparator() {
  return `<div class="home-separator-slot"><div class="home-separator"></div></div>`;
}

function initItemReveal() {
  const items = document.querySelectorAll(".home-item");
  if (!items.length) return;

  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.15 }
  );
  items.forEach((el) => io.observe(el));
}

function initSeparatorReveal() {
  const separators = document.querySelectorAll(".home-separator");
  if (!separators.length) return;

  if (!("IntersectionObserver" in window)) {
    separators.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.3 }
  );
  separators.forEach((el) => io.observe(el));
}

function initParallax() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const items = Array.from(document.querySelectorAll(".home-item"));
  if (!items.length) return;

  const speeds = items.map((_, i) => 0.025 + (i % 5) * 0.008);
  let ticking = false;

  function update() {
    items.forEach((el, i) => {
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      const offset = Math.max(-20, Math.min(20, -center * speeds[i]));
      el.style.transform = `translateY(${offset.toFixed(1)}px)`;
    });
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true }
  );
  update();
}

function initHomeLightbox() {
  const lightbox = document.getElementById("home-lightbox");
  if (!lightbox) return;
  const lightboxStage = lightbox.querySelector(".lightbox__stage");
  const zoomWrap = lightbox.querySelector(".lightbox__zoom-wrap");
  const zoomBtn = lightbox.querySelector(".lightbox__zoom-btn");
  const lightboxImg = lightbox.querySelector("img");
  const lightboxCaption = lightbox.querySelector(".lightbox__caption");

  function resetZoom() {
    zoomWrap.classList.remove("is-zoomed");
    zoomBtn.classList.remove("is-zoomed");
    zoomBtn.setAttribute("aria-label", "Zoomer sur l'image");
    lightboxImg.style.width = "";
    lightboxImg.style.height = "";
    zoomWrap.scrollLeft = 0;
    zoomWrap.scrollTop = 0;
  }

  function toggleZoom() {
    if (zoomWrap.classList.contains("is-zoomed")) {
      resetZoom();
      return;
    }
    if (!lightboxImg.naturalWidth) return;
    zoomWrap.classList.add("is-zoomed");
    zoomBtn.classList.add("is-zoomed");
    zoomBtn.setAttribute("aria-label", "Réduire l'image");
    lightboxImg.style.width = lightboxImg.naturalWidth + "px";
    lightboxImg.style.height = "auto";
    requestAnimationFrame(() => {
      zoomWrap.scrollLeft = (zoomWrap.scrollWidth - zoomWrap.clientWidth) / 2;
      zoomWrap.scrollTop = (zoomWrap.scrollHeight - zoomWrap.clientHeight) / 2;
    });
  }

  function open(i, e) {
    const item = homeLightboxIndex[i];
    if (!item) return;
    resetZoom();
    lightboxImg.src = item.src;
    lightboxImg.alt = item.title || "";
    lightboxCaption.textContent = [item.title, item.meta].filter(Boolean).join(" — ");
    if (!lightbox.classList.contains("is-open")) {
      lightboxStage.style.transformOrigin = e ? `${e.clientX}px ${e.clientY}px` : "50% 50%";
    }
    lightbox.classList.add("is-open");
  }

  function close() {
    lightbox.classList.remove("is-open");
    resetZoom();
  }

  document.querySelectorAll('.home-item[data-lightbox-index]').forEach((el) => {
    const idx = Number(el.dataset.lightboxIndex);
    if (idx < 0) return;
    el.addEventListener("click", (e) => open(idx, e));
  });

  zoomBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleZoom();
  });

  let dragInfo = null;
  let didDrag = false;

  zoomWrap.addEventListener("mousedown", (e) => {
    if (!zoomWrap.classList.contains("is-zoomed")) return;
    didDrag = false;
    dragInfo = { startX: e.clientX, startY: e.clientY, scrollLeft: zoomWrap.scrollLeft, scrollTop: zoomWrap.scrollTop };
    zoomWrap.classList.add("is-dragging");
    e.preventDefault();
  });

  window.addEventListener("mousemove", (e) => {
    if (!dragInfo) return;
    const dx = e.clientX - dragInfo.startX;
    const dy = e.clientY - dragInfo.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) didDrag = true;
    zoomWrap.scrollLeft = dragInfo.scrollLeft - dx;
    zoomWrap.scrollTop = dragInfo.scrollTop - dy;
  });

  window.addEventListener("mouseup", () => {
    dragInfo = null;
    zoomWrap.classList.remove("is-dragging");
  });

  zoomWrap.addEventListener("click", () => {
    if (!zoomWrap.classList.contains("is-zoomed")) {
      toggleZoom();
    } else if (!didDrag) {
      resetZoom();
    }
    didDrag = false;
  });

  lightbox.querySelector(".lightbox__close").addEventListener("click", close);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

async function loadNewsTicker() {
  const ticker = document.getElementById("news-ticker");
  const track = document.getElementById("news-ticker-track");
  if (!ticker || !track) return;

  const res = await fetch("data/news.json");
  const items = await res.json();
  const entry = items.find((it) => (it.title || "").includes("EST Galerie")) || items[0];
  if (!entry) return;

  const label = `NEWS : ${entry.date ? entry.date + " — " : ""}${entry.text || entry.title}`;
  const itemHtml = `<a class="news-ticker__item" href="${entry.link}" target="_blank" rel="noopener">${label}</a>`;
  track.innerHTML = `<div class="news-ticker__inner">${itemHtml}${itemHtml}</div>`;
  ticker.hidden = false;
}

async function loadHome() {
  const collage = document.getElementById("home-collage");
  if (!collage) return;

  const res = await fetch("data/home.json");
  const sections = await res.json();

  homeLightboxIndex = [];
  collage.innerHTML = sections
    .map((section, i) => {
      const html = renderSection(section);
      const separator = i < sections.length - 1 ? renderSeparator() : "";
      return html + separator;
    })
    .join("");

  initItemReveal();
  initSeparatorReveal();
  initParallax();
  initHomeLightbox();
}

document.addEventListener("DOMContentLoaded", () => {
  loadHome();
  loadNewsTicker();
  renderSparkField();
});
