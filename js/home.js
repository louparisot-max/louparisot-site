const DESIGN_WIDTH = 1440;
const TITLE_TOP = 10;

function pct(value, base) {
  return `${(value / base) * 100}%`;
}

function renderItem(item, sectionHeight) {
  const style = `top:${pct(item.top, sectionHeight)}; left:${pct(item.left, DESIGN_WIDTH)}; width:${pct(item.width, DESIGN_WIDTH)}; height:${pct(item.height, sectionHeight)}; z-index:${item.z};`;

  if (item.type === "color") {
    return `<div class="home-item home-item--color" style="${style} background:${item.color};"></div>`;
  }

  const tag = item.title
    ? `<div class="home-tag" style="top:${pct(item.tagTop, sectionHeight)}; left:${pct(item.tagLeft, DESIGN_WIDTH)};"><strong>${item.title}</strong> — ${item.meta}</div>`
    : "";

  const bg = item.bg ? ` background-color:${item.bg};` : "";
  return `<div class="home-item" style="${style}${bg}"><img src="${item.src}" alt="${item.title || ""}"></div>${tag}`;
}

function renderSection(section) {
  const canvasStyle = `padding-top:${(section.height / DESIGN_WIDTH) * 100}%;`;
  const titleStyle = `top:${pct(TITLE_TOP, section.height)}; left:0;`;

  const items = section.items.map((item) => renderItem(item, section.height)).join("");

  return `<div class="home-section">
    <div class="home-section__canvas" style="${canvasStyle}">
      <a class="home-section__title" style="${titleStyle}" href="${section.link}" target="_blank" rel="noopener">${section.title}<span class="arrow">&gt;</span></a>
      ${items}
    </div>
  </div>`;
}

function seededRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function buildOrganicPath(rand, width, height) {
  const y0 = height * (0.25 + rand() * 0.5);
  const y1 = height * (0.25 + rand() * 0.5);
  const cp1x = width * (0.15 + rand() * 0.25);
  const cp1y = y0 + (rand() - 0.5) * height * 0.7;
  const cp2x = width * (0.55 + rand() * 0.25);
  const cp2y = y1 + (rand() - 0.5) * height * 0.7;
  return `M -30 ${y0.toFixed(1)} C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${(width + 30).toFixed(1)} ${y1.toFixed(1)}`;
}

function renderOrganicLine(seed, heightPx) {
  const rand = seededRandom(seed * 7919 + 13);
  const d = buildOrganicPath(rand, DESIGN_WIDTH, heightPx);
  return `<div class="home-organic-line-slot">
    <div class="home-organic-line" style="height:${heightPx}px;">
      <svg viewBox="0 0 ${DESIGN_WIDTH} ${heightPx}" preserveAspectRatio="none">
        <path d="${d}"></path>
      </svg>
    </div>
  </div>`;
}

function initOrganicLines() {
  const lines = document.querySelectorAll(".home-organic-line");
  if (!lines.length) return;

  lines.forEach((el) => {
    const path = el.querySelector("path");
    if (!path) return;
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${len}`;
  });

  if (!("IntersectionObserver" in window)) {
    lines.forEach((el) => {
      el.classList.add("is-visible");
      const path = el.querySelector("path");
      if (path) path.style.strokeDashoffset = "0";
    });
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        const path = entry.target.querySelector("path");
        if (path) path.style.strokeDashoffset = "0";
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.1 }
  );
  lines.forEach((el) => io.observe(el));
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

async function loadHome() {
  const collage = document.getElementById("home-collage");
  if (!collage) return;

  const res = await fetch("data/home.json");
  const sections = await res.json();

  collage.innerHTML = sections
    .map((section, i) => {
      const html = renderSection(section);
      const separator = i < sections.length - 1 ? renderOrganicLine(i, 260) : "";
      return html + separator;
    })
    .join("");

  initOrganicLines();
  initParallax();
}

document.addEventListener("DOMContentLoaded", loadHome);
