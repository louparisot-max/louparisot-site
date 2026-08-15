document.addEventListener("DOMContentLoaded", () => {
  const el = document.querySelector(".site-title");
  if (!el) return;
  el.innerHTML = el.textContent
    .split("")
    .map((ch, i) => {
      const display = ch === " " ? "&nbsp;" : ch;
      return `<span style="transition-delay:${i * 30}ms">${display}</span>`;
    })
    .join("");
});
