/* Site lists, filters, and thematic collections. */
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {year:"numeric",month:"long",day:"numeric"});
}
function badgeHTML(submission) {
  return `<span class="badge ${submission === "Thematic" ? "thematic" : "rolling"}">${escapeHTML(submission)}</span>`;
}
function themeTagHTML(essay) {
  if (!essay.theme) return "";
  const theme = THEMES.find(t => t.name === essay.theme);
  return theme ? `<a class="tag" href="${themePageURL(theme)}">${escapeHTML(theme.name)}</a>` : "";
}
function themePageURL(theme) { return `../themes/theme.html?slug=${encodeURIComponent(theme.slug)}`; }
function essayCardHTML(essay) {
  return `<article class="essay-card">
    <div class="badges">${badgeHTML(essay.submission)} ${themeTagHTML(essay)}</div>
    <h4><a href="../essay.html?id=${encodeURIComponent(essay.id)}">${escapeHTML(essay.title)}</a></h4>
    <p class="excerpt">${escapeHTML(essay.excerpt)}</p>
    <div class="byline"><span>${escapeHTML(essay.author)}</span><span>&middot;</span><span>${formatDate(essay.date)}</span></div>
  </article>`;
}
function archiveRowHTML(essay) {
  return `<div class="archive-row">
    <div class="date">${formatDate(essay.date)}</div>
    <div><h4><a href="../essay.html?id=${encodeURIComponent(essay.id)}">${escapeHTML(essay.title)}</a></h4>
    <p class="excerpt" style="margin:0 0 6px;color:var(--ink-soft);font-size:0.92rem;">${escapeHTML(essay.excerpt)}</p>
    <div class="meta"><span>${escapeHTML(essay.author)}</span>${essay.theme ? `<span>&middot;</span>${themeTagHTML(essay)}` : ""}</div></div>
    <div class="badges-col">${badgeHTML(essay.submission)}</div>
  </div>`;
}
function sortedEssays(items, order) {
  return [...items].sort((a,b) => order === "oldest" ? a.date.localeCompare(b.date) : order === "title" ? a.title.localeCompare(b.title) : b.date.localeCompare(a.date));
}
function renderHomepage() {
  const sorted = sortedEssays(ESSAYS,"newest");
  const featured = sorted.find(e => e.featured) || sorted[0];
  if (!featured) return;
  document.getElementById("featured-essay").innerHTML = `<div class="featured-eyebrow">Featured</div>
    <div class="badges" style="margin-bottom:14px;">${badgeHTML(featured.submission)} ${themeTagHTML(featured)}</div>
    <h2><a href="../essay.html?id=${encodeURIComponent(featured.id)}">${escapeHTML(featured.title)}</a></h2>
    <p class="dek">${escapeHTML(featured.excerpt)}</p>
    <div class="byline"><span>${escapeHTML(featured.author)}</span><span>&middot;</span><span>${formatDate(featured.date)}</span></div>`;
  document.getElementById("essay-grid").innerHTML = sorted.filter(e => e.id !== featured.id).slice(0,6).map(essayCardHTML).join("");
}
function initArchivePage() {
  const sort = document.getElementById("sort-select");
  const list = document.getElementById("archive-list");
  function redraw() {
    list.innerHTML = ESSAYS.length
      ? sortedEssays(ESSAYS, sort.value).map(archiveRowHTML).join("")
      : '<div class="empty-state">No essays have been published yet.</div>';
  }
  sort.addEventListener("change", redraw);
  redraw();
}
function renderThemesPage() {
  const list = document.getElementById("themes-list");
  list.innerHTML = THEMES.length ? THEMES.map(theme => {
    const count = ESSAYS.filter(e => e.theme === theme.name).length;
    return `<a class="theme-banner" href="${themePageURL(theme)}">
      <span class="featured-eyebrow">Thematic collection ${theme.startDate ? `· Since ${formatDate(theme.startDate)}` : ""}</span>
      <h2>${escapeHTML(theme.name)} <span class="theme-arrow" aria-hidden="true">&rarr;</span></h2>
      <p class="dek">${escapeHTML(theme.description)}</p>
      <span class="theme-count">${count} ${count === 1 ? "article" : "articles"}</span>
    </a>`;
  }).join("") : '<div class="empty-state">No themes are available yet.</div>';
}
function initThemeDetailPage() {
  const slug = new URLSearchParams(location.search).get("slug");
  const theme = THEMES.find(t => t.slug === slug);
  const header = document.getElementById("theme-heading");
  const list = document.getElementById("theme-articles");
  if (!theme) {header.textContent = "Theme not found";list.innerHTML = '<div class="empty-state">This theme does not exist. <a href="themes.html">View all themes</a>.</div>';return;}
  document.title = `${theme.name} — Nerds Unbridled`;
  header.textContent = theme.name;
  document.getElementById("theme-description").textContent = theme.description;
  document.getElementById("theme-start-date").textContent = theme.startDate ? `Since ${formatDate(theme.startDate)}` : "";
  const essays = sortedEssays(ESSAYS.filter(e => e.theme === theme.name),"newest");
  list.innerHTML = essays.length ? essays.map(archiveRowHTML).join("") : '<div class="empty-state">No essays have been published in this theme yet.</div>';
}

/* ---------------- NEWS & ANNOUNCEMENTS ---------------- */
function sortedNews() {
  return [...NEWS_POSTS].sort((a, b) => b.date.localeCompare(a.date));
}
function renderNewsPage() {
  const list = document.getElementById("news-list");
  list.innerHTML = sortedNews().length ? sortedNews().map(post => `
    <a class="theme-banner news-banner" href="../news/post.html?id=${encodeURIComponent(post.id)}">
      <span class="featured-eyebrow">News &amp; updates · ${formatDate(post.date)}</span>
      <h2>${escapeHTML(post.title)} <span class="theme-arrow" aria-hidden="true">&rarr;</span></h2>
      <p class="dek">${escapeHTML(post.summary)}</p>
    </a>`).join("") : '<div class="empty-state">No announcements have been published yet.</div>';
}
function renderNewsPost() {
  const id = new URLSearchParams(window.location.search).get("id");
  const post = NEWS_POSTS.find(item => item.id === id);
  const target = document.getElementById("news-post");
  if (!post) {
    document.title = "News not found — Nerds Unbridled";
    target.innerHTML = '<a class="back-link" href="news.html">&larr; Back to news</a><h1>Announcement not found</h1>';
    return;
  }
  document.title = `${post.title} — Nerds Unbridled`;
  target.innerHTML = `
    <a class="back-link" href="news.html">&larr; Back to news</a>
    <div class="featured-eyebrow">News &amp; updates · ${formatDate(post.date)}</div>
    <h1>${escapeHTML(post.title)}</h1>
    <p class="news-post-summary">${escapeHTML(post.summary)}</p>
    <div class="essay-body">${(post.body || []).map(p => `<p>${escapeHTML(p)}</p>`).join("")}</div>`;
}

/* ---------------- ESSAY DETAIL  ---------------- */

function loadEssayContent(essay) {
  if (typeof essay.content === "string") {
    const html = marked.parse(essay.content);

    return DOMPurify.sanitize(html, {
      USE_PROFILES: { html: true }
    });
  }

  return "";
}

function initEssayPage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const essay = ESSAYS.find(e => e.id === id);
  const container = document.getElementById("essay-detail");

  if (!essay) {
    container.innerHTML = `
      <a class="back-link" href="archive/archive.html">&larr; Back to archive</a>
      <h1>Essay not found</h1>
      <p>We couldn't find the essay you were looking for. It may have been moved or the link is incorrect.</p>
      <img src="images/notFoundCat.png" alt="Confused Cat" style="width:300px;height:300px;margin:auto;margin-top:40px;">
    `;

    document.title = "Not found — Students Unbridled";
    return;
  }

  document.title = `${essay.title} — Students Unbridled`;

  container.innerHTML = `
    <a class="back-link" href="archive/archive.html">&larr; Back to archive</a>

    <div class="badges">
      ${badgeHTML(essay.submission)}
      ${essay.theme ? `<a class="tag" href="themes/theme.html?slug=${encodeURIComponent(THEMES.find(t => t.name === essay.theme)?.slug || "")}">${escapeHTML(essay.theme)}</a>` : ""}
    </div>

    <h1>${essay.title}</h1>

    <p>${essay.excerpt}</p>

    <div class="byline">
      <span>By ${essay.author}</span>
      <span>&middot;</span>
      <span>${formatDate(essay.date)}</span>
    </div>

    <div class="essay-body" id="essay-note">
      <span>A note from the author: ${essay.note}</span> <br>
      <br>
      <hr>
      <br>
    </div>


    <div class="essay-body" id="essay-body">
      <p>Loading article...</p>
    </div>
  `;

  const body = document.getElementById("essay-body");

  try {
    body.innerHTML = loadEssayContent(essay);
  } catch (error) {
    console.error(error);

    body.innerHTML = `
      <p>There was a problem loading this article.</p>
    `;
  }
}

/* ---------------- FIXED / AUTO-COMPACTING MASTHEAD ---------------- */

function initAutoCompactMasthead() {
  const masthead = document.querySelector('.masthead');
  if (!masthead) return;

  const compactAt = 50;
  // Require meaningful scrolling beyond the collapse point, not just a few pixels.
  const minimumScrollRange = compactAt + 150;
  let canCompact = false;
  let ticking = false;

  // Always reserve the EXPANDED masthead's height in the page layout.
  // Shrinking this space along with the header changes the document's scroll
  // range, which can cause a collapse/expand feedback loop on short pages.
  function measureExpandedHeight() {
    masthead.classList.add('is-measuring');
    const wasCompact = masthead.classList.contains('is-scrolled');
    masthead.classList.remove('is-scrolled');
    const height = masthead.offsetHeight;
    document.documentElement.style.setProperty('--masthead-height', `${height}px`);
    if (wasCompact) masthead.classList.add('is-scrolled');
    masthead.classList.remove('is-measuring');
  }

  function updateMasthead() {
    // Measuring the scroll range is stable because the body reserves the
    // expanded height, regardless of the visual state of the masthead.
    canCompact = (document.documentElement.scrollHeight - window.innerHeight) >= minimumScrollRange;
    masthead.classList.toggle('is-scrolled', canCompact && window.scrollY > compactAt);
  }

  function scheduleUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateMasthead();
      ticking = false;
    });
  }

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', () => {
    measureExpandedHeight();
    scheduleUpdate();
  });
  window.addEventListener('load', () => {
    measureExpandedHeight();
    scheduleUpdate();
  });

  // Article cards and theme/news listings can be populated after DOMContentLoaded.
  // Re-evaluate eligibility as those sections grow or shrink.
  if ('ResizeObserver' in window) {
    const contentObserver = new ResizeObserver(scheduleUpdate);
    document.querySelectorAll('main, footer').forEach(el => contentObserver.observe(el));
  }

  measureExpandedHeight();
  scheduleUpdate();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAutoCompactMasthead);
} else {
  initAutoCompactMasthead();
}