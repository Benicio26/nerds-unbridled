/* First-level, editor-published commentary. Depends on data.js, commentary-data.js and main.js. */
function commentariesFor(essayId) {
  return COMMENTARIES.filter(item => item.articleId === essayId);
}

function commentaryThreadURL(essayId) {
  return `/commentary/?article=${encodeURIComponent(essayId)}`;
}

function commentaryReadURL(id) {
  return `/commentary/read.html?id=${encodeURIComponent(id)}`;
}

function commentarySubmissionURL(essay) {
  if (!COMMENTARY_FORM || !COMMENTARY_FORM.url) return null;
  try {
    const form = new URL(COMMENTARY_FORM.url);
    if (form.protocol !== 'https:' || !['forms.gle', 'docs.google.com'].includes(form.hostname)) return null;
    if (COMMENTARY_FORM.articleFieldEntry && /^\d+$/.test(COMMENTARY_FORM.articleFieldEntry)) {
      form.searchParams.set(`entry.${COMMENTARY_FORM.articleFieldEntry}`, `https://nerdsunbridled.com/essay.html?id=${encodeURIComponent(essay.id)}`);
      form.searchParams.set('usp', 'pp_url');
    }
    return form.href;
  } catch (_) {
    return null;
  }
}

function commentarySubmitHTML(essay) {
  if (!essay.commentaryEnabled) return '';
  const url = commentarySubmissionURL(essay);
  return `<div class="commentary-callout">
    <div class="featured-eyebrow">Join the conversation</div>
    <h2>Have something to add?</h2>
    <p>Respond to this essay with a short piece of your own, up to 1,000 words. Submissions are reviewed by our editors before publication.</p>
    <p>If your piece is approved, it will be listed below!</p>
    ${url
      ? `<a class="btn commentary-submit" href="${escapeHTML(url)}" rel="noopener noreferrer">Write a commentary &rarr;</a>`
      : `<p class="commentary-unavailable">Commentary submissions are temporarily closed.</p>`}
    ${url && !COMMENTARY_FORM.articleFieldEntry
      ? `<p class="commentary-form-note">In the form, please identify the original article as "<strong>${escapeHTML(essay.title)}</strong>" and indicate that your submission is a commentary.</p>`
      : ''}
  </div>`;
}

function commentaryListHTML(items, { compact = false } = {}) {
  if (!items.length) return '<p class="commentary-empty">No commentaries have been published for this essay yet.</p>';
  return `<ol class="commentary-list${compact ? ' is-compact' : ''}">${items.map(item => `
    <li class="commentary-list-item">
      <div class="commentary-list-text">
        <h3><a href="${commentaryReadURL(item.id)}">${escapeHTML(item.title)}</a></h3>
        ${compact ? '' : `<p class="commentary-item-excerpt">${escapeHTML(item.excerpt)}</p>`}
        <div class="commentary-meta">By ${escapeHTML(item.author)} <span aria-hidden="true">·</span> ${formatDate(item.date)}</div>
      </div>
      <a class="commentary-arrow" href="${commentaryReadURL(item.id)}" aria-label="Read ${escapeHTML(item.title)}">&rarr;</a>
    </li>`).join('')}</ol>`;
}

function renderEssayCommentary(essay) {
  const target = document.getElementById('essay-commentary');
  if (!target) return;
  if (!essay.commentaryEnabled) {
    target.innerHTML = '<p class="commentary-closed">This essay is not open for commentary.</p>';
    return;
  }
  const items = commentariesFor(essay.id);
  target.innerHTML = `${commentarySubmitHTML(essay)}
    <section class="commentary-navigation" aria-labelledby="commentary-nav-heading">
      <div class="commentary-section-title">
        <h2 id="commentary-nav-heading">Commentaries <span class="commentary-count">${items.length}</span></h2>
        <a href="${commentaryThreadURL(essay.id)}">View discussion page &rarr;</a>
      </div>
      ${commentaryListHTML(items, { compact: true })}
    </section>`;
}

function renderCommentaryHub() {
  const output = document.getElementById('commentary-content');
  const essayId = new URLSearchParams(location.search).get('article');
  if (essayId) {
    const essay = ESSAYS.find(item => item.id === essayId);
    if (!essay) {
      document.title = 'Essay not found — Nerds Unbridled';
      output.innerHTML = '<a class="back-link" href="/commentary/">&larr; All conversations</a><h1>Essay not found</h1><p>This discussion is not available.</p>';
      return;
    }
    const items = commentariesFor(essay.id);
    document.title = `Commentary on ${essay.title} — Nerds Unbridled`;
    output.innerHTML = `<a class="back-link" href="/commentary/">&larr; All conversations</a>
      <div class="featured-eyebrow">Commentary on</div>
      <h1><a class="commentary-origin-title" href="/essay.html?id=${encodeURIComponent(essay.id)}">${escapeHTML(essay.title)}</a></h1>
      <p class="commentary-origin-excerpt">${escapeHTML(essay.excerpt)}</p>
      <div class="commentary-origin-meta">Original essay by ${escapeHTML(essay.author)} <span aria-hidden="true">·</span> ${formatDate(essay.date)} <span aria-hidden="true">·</span> <a href="/essay.html?id=${encodeURIComponent(essay.id)}">Read the original &rarr;</a></div>
      <hr class="commentary-rule">
      <div class="commentary-section-title"><h2>Published commentaries <span class="commentary-count">${items.length}</span></h2></div>
      ${commentaryListHTML(items)}
      ${commentarySubmitHTML(essay)}`;
    return;
  }

  document.title = 'Commentary — Nerds Unbridled';
  const threads = ESSAYS.filter(item => commentariesFor(item.id).length > 0)
    .sort((a, b) => b.date.localeCompare(a.date));
  output.innerHTML = `<a class="back-link" href="/">&larr; Latest essays</a>
    <div class="featured-eyebrow">Conversations</div>
    <h1>Commentary</h1>
    <p class="commentary-origin-excerpt">Essays are the beginning of a conversation. Read the responses and counterarguments they have inspired.</p>
    <hr class="commentary-rule">
    ${threads.length ? `<div class="commentary-threads">${threads.map(essay => {
      const count = commentariesFor(essay.id).length;
      return `<a class="commentary-thread" href="${commentaryThreadURL(essay.id)}">
        <div class="featured-eyebrow">${count} ${count === 1 ? 'commentary' : 'commentaries'}</div>
        <h2>${escapeHTML(essay.title)} <span class="theme-arrow" aria-hidden="true">&rarr;</span></h2>
        <p>${escapeHTML(essay.excerpt)}</p>
        <span class="commentary-meta">By ${escapeHTML(essay.author)}</span>
      </a>`;
    }).join('')}</div>` : '<div class="commentary-empty">No commentaries have been published yet. Open an <a href="/archive/">essay</a> to begin a conversation.</div>'}`;
}

function renderCommentaryArticle() {
  const target = document.getElementById('commentary-article');
  const id = new URLSearchParams(location.search).get('id');
  const item = COMMENTARIES.find(entry => entry.id === id);
  const essay = item && ESSAYS.find(entry => entry.id === item.articleId);
  if (!item || !essay) {
    document.title = 'Commentary not found — Nerds Unbridled';
    target.innerHTML = '<a class="back-link" href="/commentary/">&larr; All conversations</a><h1>Commentary not found</h1><p>This commentary may have moved or is no longer published.</p>';
    return;
  }
  document.title = `${item.title} — Nerds Unbridled`;
  target.innerHTML = `<a class="back-link" href="${commentaryThreadURL(essay.id)}">&larr; Commentaries on ${escapeHTML(essay.title)}</a>
    <div class="featured-eyebrow">Commentary</div>
    <h1>${escapeHTML(item.title)}</h1>
    <p class="commentary-origin-excerpt">${escapeHTML(item.excerpt)}</p>
    <div class="byline"><span>By ${escapeHTML(item.author)}</span><span>&middot;</span><span>${formatDate(item.date)}</span></div>
    <p class="commentary-in-response">In response to <a href="/essay.html?id=${encodeURIComponent(essay.id)}">${escapeHTML(essay.title)}</a>, by ${escapeHTML(essay.author)}</p>
    <div class="essay-body">${loadEssayContent(item)}</div>
    <nav class="commentary-after" aria-label="More commentary">
      <a href="${commentaryThreadURL(essay.id)}">&larr; All commentaries on this essay</a>
      <a href="/essay.html?id=${encodeURIComponent(essay.id)}">Read the original essay &rarr;</a>
    </nav>`;
}
