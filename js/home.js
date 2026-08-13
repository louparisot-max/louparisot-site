function renderMedia(item) {
  if (item.type === "color") {
    return `<div class="home-color" style="background:${item.color};"></div>`;
  }
  const fitClass = item.fit === "cover" ? "home-media--cover" : "home-media--contain";
  const bg = item.fit !== "cover" && item.color ? ` style="background-color:${item.color};"` : "";
  const caption = item.title
    ? `<div class="home-caption">
         <div class="home-caption__title">${item.title}${item.year ? `<span class="year">, ${item.year}</span>` : ""}</div>
         ${item.venue ? `<div class="home-caption__venue">${item.venue}</div>` : ""}
       </div>`
    : "";
  return `<img class="home-media ${fitClass}" src="${item.src}" alt="${item.title || ""}"${bg}>${caption}`;
}

async function loadHome() {
  const feed = document.getElementById("home-feed");
  if (!feed) return;

  const res = await fetch("data/home.json");
  const blocks = await res.json();

  feed.innerHTML = blocks
    .map((block) => {
      if (block.type === "split") {
        return `<div class="home-block home-block--split">
          <div class="home-block__side">${renderMedia(block.left)}</div>
          <div class="home-block__side">${renderMedia(block.right)}</div>
        </div>`;
      }
      return `<div class="home-block">${renderMedia(block)}</div>`;
    })
    .join("");
}

document.addEventListener("DOMContentLoaded", loadHome);
