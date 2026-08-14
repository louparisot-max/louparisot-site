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

  return `<div class="home-item" style="${style}"><img src="${item.src}" alt="${item.title || ""}"></div>${tag}`;
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

async function loadHome() {
  const collage = document.getElementById("home-collage");
  if (!collage) return;

  const res = await fetch("data/home.json");
  const sections = await res.json();

  collage.innerHTML = sections.map(renderSection).join("");
}

document.addEventListener("DOMContentLoaded", loadHome);
