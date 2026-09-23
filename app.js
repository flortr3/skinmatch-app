/* SkinMatch — static mobile-first skincare application.
   The product catalog and the similarity rankings come from the Python project.
   No unreliable classifier outputs are presented as skin suitability predictions. */

const DATA_URL = './data/skinmatch_mobile.json';
const SKIN_TYPES = [
  ['dry', 'Dry skin'],
  ['oily', 'Oily skin'],
  ['normal', 'Normal skin'],
  ['combination', 'Combination skin'],
];
const app = document.querySelector('#app');
const homeButton = document.querySelector('#homeButton');
let catalog = [];
let productById = new Map();
let rankedPopular = [];

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
}
function normalized(value) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}
function number(value) { return new Intl.NumberFormat('en-US').format(Number(value) || 0); }
function percentage(value) { return Number.isFinite(Number(value)) && value != null ? `${Number(value).toFixed(1)}%` : 'N/A'; }
function safeList(value) { return Array.isArray(value) ? value.map(x => String(x)) : []; }
function countReviews(product) {
  return Object.values(product.skin_type_insights || {}).reduce((total, s) => total + (Number(s.review_count) || 0), 0);
}
function ingredients(product) { return safeList(product.ingredients); }
function brand(product) { return product.brand_name || 'Unknown brand'; }
function name(product) { return product.product_name || 'Unnamed product'; }

function renderHome() {
  app.innerHTML = `
    <section class="hero">
      <span class="eyebrow">Ingredient-led skincare discovery</span>
      <h1>Know your skincare.<br><em>Find your match.</em></h1>
      <p class="hero-copy">Explore what's inside a skincare product, compare consumer experiences across four skin types, and discover formulations with similar ingredients.</p>
      <div class="search-shell">
        <label class="search-field" for="productSearch">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>
          <input id="productSearch" autocomplete="off" type="search" placeholder="Search product name or brand" aria-label="Search product name or brand" />
          <span class="search-tag">${number(catalog.length)} products</span>
        </label>
        <div id="searchResults" class="search-results" aria-live="polite"></div>
        <p class="under-search">Search our Sephora skincare catalog. No skin-type questionnaire required.</p>
      </div>
    </section>
    <div class="section-head"><div><span class="eyebrow">Start exploring</span><h2>Popular in the catalog</h2></div><span class="stat-chip">Based on review volume</span></div>
    <div class="popular-grid">${rankedPopular.slice(0, 4).map(p => `
       <button class="popular-card" type="button" data-product-id="${esc(p.product_id)}">
         <span class="result-brand">${esc(brand(p))}</span><h3>${esc(name(p))}</h3>
         <p>${number(countReviews(p))} reviews · ${esc(p.category || 'Skincare')}</p>
       </button>`).join('')}</div>`;

  const input = document.querySelector('#productSearch');
  input.addEventListener('input', () => renderSearchResults(input.value));
  document.querySelector('#searchResults').hidden = true;
  const hashId = decodeURIComponent(location.hash.slice(1));
  if (hashId && productById.has(hashId)) renderProduct(hashId, false);
}

function renderSearchResults(query) {
  const container = document.querySelector('#searchResults');
  if (!container) return;
  const text = normalized(query.trim());
  if (!text) { container.hidden = true; container.innerHTML = ''; return; }
  const matches = rankedPopular.filter(p =>
    normalized(`${brand(p)} ${name(p)} ${p.category || ''}`).includes(text)
  ).slice(0, 10);
  container.hidden = false;
  container.innerHTML = matches.length ? matches.map(p => `
    <button class="result-button" type="button" data-product-id="${esc(p.product_id)}">
      <span><span class="result-brand">${esc(brand(p))}</span><span class="result-name">${esc(name(p))}</span></span>
      <span class="result-arrow" aria-hidden="true">›</span></button>`).join('') :
    '<div class="empty-panel">No matches found. Try a brand name or a shorter search.</div>';
}

function skinCards(product) {
  const evidence = product.skin_type_insights || {};
  const wellReviewed = SKIN_TYPES.map(([key]) => ({key, data: evidence[key]}))
    .filter(x => Number(x.data?.review_count) >= 20 && Number.isFinite(Number(x.data?.recommendation_rate)));
  const highest = wellReviewed.length ? Math.max(...wellReviewed.map(x => Number(x.data.recommendation_rate))) : null;
  const cards = SKIN_TYPES.map(([key, label]) => {
    const row = evidence[key];
    const reviews = Number(row?.review_count) || 0;
    const valid = row && reviews > 0 && row.recommendation_rate != null;
    const featured = valid && reviews >= 20 && Number(row.recommendation_rate) === highest;
    const rating = row?.average_rating == null ? 'N/A' : `${Number(row.average_rating).toFixed(1)}/5 rating`;
    return `<article class="skin-card ${featured ? 'featured' : ''}">
       <div class="skin-row"><span class="skin-label">${label}</span><span class="evidence-pill ${reviews < 20 ? 'limited' : ''}">${reviews === 0 ? 'No data' : reviews < 20 ? 'Limited reviews' : '20+ reviews'}</span></div>
       <strong class="skin-rate ${!valid ? 'empty' : ''}">${valid ? percentage(row.recommendation_rate) : 'No data'}</strong>
       <p class="skin-detail">${number(reviews)} consumer reviews · ${rating}</p>
     </article>`;
  }).join('');
  let summary = '';
  if (wellReviewed.length) {
    const top = wellReviewed.filter(x => Number(x.data.recommendation_rate) === highest);
    const label = top.map(x => SKIN_TYPES.find(t => t[0] === x.key)[1]).join(' and ');
    const reviewCounts = top.map(x => number(x.data.review_count)).join(' / ');
    summary = `<div class="summary"><span class="eyebrow">What the reviews show</span><p><strong>${esc(label)}</strong> ${top.length > 1 ? 'share' : 'has'} the highest observed recommendation rate among groups with at least 20 reviews: <strong>${percentage(highest)}</strong> (${reviewCounts} reviews${top.length > 1 ? ' respectively' : ''}). This reflects historical feedback, not proof of skin compatibility.</p></div>`;
  } else {
    summary = '<div class="summary"><p>There are not enough reviews for any skin type to highlight a comparison with at least 20 reviews.</p></div>';
  }
  return `<div class="skin-grid">${cards}</div>${summary}
  <div class="notice">Recommendation rates are historical Sephora consumer feedback, not a dermatological assessment. Percentages from small review groups are less informative.</div>`;
}

function ingredientSection(product) {
  const list = ingredients(product);
  if (!list.length) return '<div class="empty-panel">No ingredient list is available for this product.</div>';
  const initial = 14;
  return `<div class="panel"><div class="chips" id="ingredientChips">${list.slice(0, initial).map(i => `<span class="chip">${esc(i)}</span>`).join('')}</div>
  ${list.length > initial ? `<button class="secondary-button" type="button" id="toggleIngredients">View all ${list.length} ingredients</button>` : ''}
  <p class="section-subtitle" style="margin-top:15px">Ingredient names were extracted from the dataset. Their presence does not establish concentration or effectiveness.</p></div>`;
}

function matchSection(product) {
  const matches = safeList([]); // keeps the output empty for a product with no ranked matches
  const recommendations = Array.isArray(product.similar_products) ? product.similar_products.slice(0, 5) : matches;
  const originalSet = new Set(ingredients(product).map(normalized));
  const cards = recommendations.map(rec => {
    const other = productById.get(String(rec.product_id));
    if (!other || other.product_id === product.product_id) return '';
    const shared = ingredients(other).filter(item => originalSet.has(normalized(item)));
    const score = Number(rec.similarity_score);
    return `<article class="match-card">
      <div class="match-top"><div><span class="result-brand">${esc(brand(other))}</span><h3>${esc(name(other))}</h3></div>
        <span class="match-score">${Number.isFinite(score) ? score.toFixed(3) : 'N/A'}</span></div>
      <p class="match-shared"><strong>${number(shared.length)} shared ingredients</strong>${shared.length ? ` · ${esc(shared.slice(0, 5).join(' · '))}${shared.length > 5 ? '…' : ''}` : ''}</p>
      <p class="section-subtitle">Cosine similarity score (0–1), not a skin-suitability percentage.</p>
      <button class="secondary-button" type="button" data-product-id="${esc(other.product_id)}">View product →</button>
    </article>`;
  }).filter(Boolean).join('');
  return cards ? `<div class="match-grid">${cards}</div>` : '<div class="empty-panel">No comparable products were found in the same skincare category.</div>';
}

function renderProduct(id, updateHash = true) {
  const product = productById.get(String(id));
  if (!product) { renderHome(); return; }
  if (updateHash) history.replaceState(null, '', `#${encodeURIComponent(product.product_id)}`);
  const list = ingredients(product);
  const price = Number(product.price_usd);
  const priceText = product.price_usd != null && Number.isFinite(price) ? `$${price.toFixed(2)} USD · historical dataset price` : 'Price unavailable';
  app.innerHTML = `<div class="product-topline"><button type="button" class="back-button" id="backButton">← Back to search</button><span class="mini-label">Product analysis</span></div>
   <section class="product-hero"><div><span class="eyebrow">${esc(brand(product))}</span><h1>${esc(name(product))}</h1>
      <div class="product-meta"><span>${esc(product.category || 'Skincare')}</span><span>${esc(priceText)}</span></div></div><div class="bottle" aria-hidden="true"></div></section>
   <section class="product-section"><span class="eyebrow">01 / Consumer evidence</span><h2>Skin type insights</h2>
     <p class="section-subtitle">What people with different skin types reported about this product.</p>${skinCards(product)}</section>
   <section class="product-section"><span class="eyebrow">02 / Formulation</span><h2>Inside the ingredients</h2>
     <p class="section-subtitle">${number(list.length)} unique extracted ingredients in the dataset.</p>${ingredientSection(product)}</section>
   <section class="product-section"><span class="eyebrow">03 / Content-based recommendations</span><h2>Ingredient matches</h2>
     <p class="section-subtitle">Matched using TF-IDF ingredient vectors and Cosine Similarity within the same product category.</p>${matchSection(product)}</section>`;
  document.querySelector('#backButton').addEventListener('click', () => {
    history.replaceState(null, '', location.pathname + location.search);
    renderHome(); window.scrollTo({top: 0, behavior: 'smooth'});
  });
  const toggle = document.querySelector('#toggleIngredients');
  if (toggle) toggle.addEventListener('click', () => {
    const chips = document.querySelector('#ingredientChips');
    const showingAll = toggle.dataset.expanded === 'true';
    chips.innerHTML = (showingAll ? list.slice(0, 14) : list).map(i => `<span class="chip">${esc(i)}</span>`).join('');
    toggle.textContent = showingAll ? `View all ${list.length} ingredients` : 'Show fewer ingredients';
    toggle.dataset.expanded = String(!showingAll);
  });
  window.scrollTo({top: 0, behavior: 'smooth'});
}

app.addEventListener('click', event => {
  const button = event.target.closest('[data-product-id]');
  if (button) renderProduct(button.dataset.productId);
});
homeButton.addEventListener('click', () => {
  history.replaceState(null, '', location.pathname + location.search);
  renderHome(); window.scrollTo({top:0, behavior:'smooth'});
});
window.addEventListener('hashchange', () => {
  const id = decodeURIComponent(location.hash.slice(1));
  if (id && productById.has(id)) renderProduct(id, false);
});

async function initialize() {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('The mobile database must be a product array.');
    catalog = data.filter(p => p && p.product_id != null).map(p => ({...p, product_id:String(p.product_id)}));
    productById = new Map(catalog.map(p => [p.product_id, p]));
    rankedPopular = [...catalog].sort((a,b) => countReviews(b)-countReviews(a));
    renderHome();
  } catch (error) {
    app.innerHTML = `<div class="empty-panel" style="margin-top:30px"><h2>We couldn't open the product library.</h2><p>Run this app with a local web server, not by double-clicking index.html. Check that <code>mobile-web/data/skinmatch_mobile.json</code> exists.</p><p>${esc(error.message)}</p></div>`;
    console.error(error);
  }
}
initialize();
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(console.warn));
}
