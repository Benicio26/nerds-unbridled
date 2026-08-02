/* =========================================================
   Site logic
   Reads from js/data.js and renders
   ========================================================= 
*/

function formatDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function badgeHTML(format) {
  const cls = format === "Academic" ? "academic" : "nonacademic";
  return `<span class="badge ${cls}">${format}</span>`;
}

function essayCardHTML(essay) {
  return `
    <article class="essay-card">
      <div class="badges">
        ${badgeHTML(essay.format)}
        <span class="tag">${essay.category}</span>
      </div>
      <h4><a href="essay.html?id=${encodeURIComponent(essay.id)}">${essay.title}</a></h4>
      <p class="excerpt">${essay.excerpt}</p>
      <div class="byline">
        <span>${essay.author}</span>
        <span>&middot;</span>
        <span>${formatDate(essay.date)}</span>
      </div>
    </article>
  `;
}

function archiveRowHTML(essay) {
  return `
    <div class="archive-row">
      <div class="date">${formatDate(essay.date)}</div>
      <div>
        <h4><a href="essay.html?id=${encodeURIComponent(essay.id)}">${essay.title}</a></h4>
        <p class="excerpt" style="margin:0 0 6px;color:var(--ink-soft);font-size:0.92rem;">${essay.excerpt}</p>
        <div class="meta">
          <span>${essay.author}</span>
          <span>&middot;</span>
          <span>${essay.category}</span>
        </div>
      </div>
      <div class="badges-col">
        ${badgeHTML(essay.format)}
      </div>
    </div>
  `;
}

/* ---------------- HOMEPAGE ---------------- */

function renderHomepage() {
  const sorted = [...ESSAYS].sort((a, b) => new Date(b.date) - new Date(a.date));
  const featured = sorted.find(e => e.featured) || sorted[0];
  const rest = sorted.filter(e => e.id !== featured.id).slice(0, 6);

  const featuredEl = document.getElementById("featured-essay");
  if (featuredEl && featured) {
    featuredEl.innerHTML = `
      <div class="featured-eyebrow">Featured</div>
      <div class="badges" style="margin-bottom:14px;">
        ${badgeHTML(featured.format)}
        <span class="tag">${featured.category}</span>
      </div>
      <h2><a href="essay.html?id=${encodeURIComponent(featured.id)}">${featured.title}</a></h2>
      <p class="dek">${featured.excerpt}</p>
      <div class="byline">
        <span>${featured.author}</span>
        <span>&middot;</span>
        <span>${formatDate(featured.date)}</span>
      </div>
    `;
  }

  const gridEl = document.getElementById("essay-grid");
  if (gridEl) {
    gridEl.innerHTML = rest.map(essayCardHTML).join("");
  }
}

/* ---------------- ARCHIVE  ---------------- */

let activeCategory = "All";
let activeFormat = "All";
let activeSort = "newest";

function getCategories() {
  const cats = new Set(ESSAYS.map(e => e.category));
  return ["All", ...Array.from(cats).sort()];
}

function renderFilters() {
  const catGroup = document.getElementById("category-filters");
  if (catGroup) {
    catGroup.innerHTML = getCategories().map(cat => `
      <button class="filter-btn ${cat === activeCategory ? "active" : ""}" data-category="${cat}">${cat}</button>
    `).join("");
  }

  const fmtGroup = document.getElementById("format-filters");
  if (fmtGroup) {
    const formats = ["All", "Academic", "Non-Academic"];
    fmtGroup.innerHTML = formats.map(fmt => `
      <button class="filter-btn ${fmt === activeFormat ? "active" : ""}" data-format="${fmt}">${fmt}</button>
    `).join("");
  }
}

function renderArchiveList() {
  let filtered = ESSAYS.filter(e => {
    const matchCat = activeCategory === "All" || e.category === activeCategory;
    const matchFmt = activeFormat === "All" || e.format === activeFormat;
    return matchCat && matchFmt;
  });

  filtered.sort((a, b) => {
    if (activeSort === "newest") return new Date(b.date) - new Date(a.date);
    if (activeSort === "oldest") return new Date(a.date) - new Date(b.date);
    if (activeSort === "title") return a.title.localeCompare(b.title);
    return 0;
  });

  const listEl = document.getElementById("archive-list");
  if (!listEl) return;

  if (filtered.length === 0) {
    listEl.innerHTML = `<div class="empty-state">No essays match these filters yet. Try clearing one.</div>`;
    return;
  }

  listEl.innerHTML = filtered.map(archiveRowHTML).join("");
}

function initArchivePage() {
  renderFilters();
  renderArchiveList();

  document.getElementById("category-filters").addEventListener("click", (e) => {
    if (!e.target.matches(".filter-btn")) return;
    activeCategory = e.target.dataset.category;
    renderFilters();
    renderArchiveList();
  });

  document.getElementById("format-filters").addEventListener("click", (e) => {
    if (!e.target.matches(".filter-btn")) return;
    activeFormat = e.target.dataset.format;
    renderFilters();
    renderArchiveList();
  });

  document.getElementById("sort-select").addEventListener("change", (e) => {
    activeSort = e.target.value;
    renderArchiveList();
  });
}

/* ---------------- ESSAY DETAIL  ---------------- */

function initEssayPage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const essay = ESSAYS.find(e => e.id === id);
  const container = document.getElementById("essay-detail");

  if (!essay) {
    container.innerHTML = `
      <a class="back-link" href="archive.html">&larr; Back to archive</a>
      <h1>Essay not found</h1>
      <p>We couldn't find the essay you were looking for. It may have been moved or the link is incorrect.</p>
      <img src="images/notFoundCat.png" alt="Confused Cat" style="width:300px;height:300px;margin:auto;margin-top:40px;">
    `;
    document.title = "Not found — Students Unbridled";
    return;
  }

  document.title = `${essay.title} — Students Unbridled`;

  container.innerHTML = `
    <a class="back-link" href="archive.html">&larr; Back to archive</a>
    <div class="badges">
      ${badgeHTML(essay.format)}
      <span class="tag">${essay.category}</span>
    </div>
    <h1>${essay.title}</h1>
    <p>${essay.excerpt}</p>
    <div class="byline">
      <span>By ${essay.author}</span>
      <span>&middot;</span>
      <span>${formatDate(essay.date)}</span>
    </div>
    <div class="essay-body">
      ${essay.content.map(p => `<p>${p}</p>`).join("")}
    </div>
  `;
}
