// The catalog is the only source of contracts, token values and counts.
const catalog = await fetch('./catalog.json').then((res) => res.json());
const CONTRACTS = Object.fromEntries(catalog.components.map((c) => [c.tag, c]));
const names = (list) => list.map((x) => x.name ?? x).join(', ') || '—';

const el = (tag, attrs = {}, ...children) => {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  node.append(...children);
  return node;
};
const usedBy = (tag) => [
  ...catalog.components.filter((c) => c.composes.includes(tag)).map((c) => c.tag),
  ...catalog.pages.filter((p) => p.templates.includes(tag)).map((p) => p.id),
];
const links = (label, tags) => el('p', { class: 'relations muted' }, `${label} `,
  ...tags.flatMap((tag, i) => [i ? ', ' : '', el('a', { href: `#${tag}` }, tag)]));

// How each kind of token is shown, by name prefix. The first match wins.
const SAMPLES = [
  [/^--(palette|color|glow)-/, 'chip', 'background'],
  [/^--font-/, 'text', 'font-family'],
  [/^--text-/, 'text', 'font-size'],
  [/^--weight-/, 'text', 'font-weight'],
  [/^--tracking-/, 'text', 'letter-spacing'],
  [/^--leading-/, 'text', 'line-height'],
  [/^--radius-/, 'box', 'border-radius'],
  [/^--shadow-/, 'box', 'box-shadow'],
  [/^--opacity-/, 'box fill', 'opacity'],
  [/^--pad-/, 'box pad', 'padding'],
  [/^--(space|border|focus|control|icon|size|switch|panel|layout|anchor)-/, 'bar', 'width'],
];
function sample(name) {
  const [, kind, prop] = SAMPLES.find(([pattern]) => pattern.test(name)) ?? [];
  const box = el('span', { class: `token-sample ${kind ?? ''}`, 'aria-hidden': 'true' }, kind === 'text' ? 'Ag' : '');
  if (prop) box.style.setProperty(prop, `var(${name})`);
  return el('span', { class: 'token-stage' }, box);
}
function tokenGroup([group, tokens]) {
  const { title, summary } = catalog.tokenGroups[group];
  const rows = tokens.map((t) => el('li', { class: 'token' }, sample(t.name), el('code', {}, t.name),
    el('span', { class: 'token-value' }, t.value ?? (t.dark === t.light ? t.dark : `${t.dark} / ${t.light}`))));
  return el('article', { class: 'specimen token-group', 'data-tier': 'tokens', 'data-id': group, id: `tokens-${group}` },
    el('div', { class: 'specimen-head' }, el('h3', {}, title), el('ui-badge', { variant: 'neutral' }, String(tokens.length))),
    el('p', { class: 'specimen-desc' }, summary), el('ul', { class: 'token-list', tabindex: '0', 'aria-label': title }, ...rows));
}

for (const { tag, description } of catalog.components) {
  document.querySelector(`#${tag} > .specimen-desc`).textContent = description;
}
for (const tier of catalog.tiers) {
  const section = document.getElementById(tier.id);
  section.querySelector('[data-tier-summary]').textContent = tier.summary;
  section.querySelector('[data-tier-uses]').textContent = tier.mayUse.length ? `May use: ${tier.mayUse.join(', ')}` : 'Uses no other tier';
}
document.querySelector('#tokens .specimen-grid').append(...Object.entries(catalog.tokens).map(tokenGroup));
document.querySelector('#pages .specimen-grid').append(...catalog.pages.map((page) => el('article', { class: 'specimen', 'data-tier': 'pages', 'data-id': page.id, id: page.id },
  el('div', { class: 'specimen-head' }, el('h3', {}, page.title), el('ui-badge', { variant: 'neutral' }, 'pages')),
  el('p', { class: 'specimen-desc' }, page.description), links('Composes', page.templates))));

const root = document.documentElement;
// Link targets stay clear of the sticky header, whose height depends on the width.
new ResizeObserver(([entry]) => root.style.setProperty('--header-height', `${entry.borderBoxSize[0].blockSize}px`))
  .observe(document.getElementById('navbar'));
document.getElementById('navbar').addEventListener('ui-theme-change', (e) => {
  if (e.detail.theme === 'light') root.setAttribute('data-theme', 'light');
  else root.removeAttribute('data-theme');
});

const specimens = Array.from(document.querySelectorAll('#specimen-grid .specimen'));
const countEl = document.getElementById('catalog-count');
// Search looks at the specimen itself, not at the links to its relatives.
const searchText = new Map(specimens.map((node) => [node, node.textContent.toLowerCase()]));
for (const node of specimens.filter((n) => CONTRACTS[n.dataset.id])) {
  const { tag, composes } = CONTRACTS[node.dataset.id];
  const foot = node.querySelector('.specimen-foot');
  if (composes.length) foot.before(links('Composes', composes));
  if (usedBy(tag).length) foot.before(links('Used by', usedBy(tag)));
}
const sections = Array.from(document.querySelectorAll('.tier'));
const emptyEl = document.getElementById('catalog-empty');
const tierBtns = Array.from(document.querySelectorAll('.tier-btn'));
for (const btn of tierBtns) {
  const tier = catalog.tiers.find((t) => t.id === btn.dataset.tier);
  if (tier) btn.textContent += ` (${tier.members.length})`;
}
let activeTier = 'all';
let activeQuery = '';

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

function applyFilter() {
  const q = activeQuery.trim().toLowerCase();
  for (const node of specimens) {
    const tierOk = activeTier === 'all' || node.dataset.tier === activeTier;
    node.hidden = !(tierOk && searchText.get(node).includes(q));
  }
  const shown = specimens.filter((node) => !node.hidden);
  const groups = shown.filter((node) => node.dataset.tier === 'tokens').length;
  const pages = shown.filter((node) => node.dataset.tier === 'pages').length;
  const components = shown.length - groups - pages;
  const parts = [[groups, 'token group'], [components, 'component'], [pages, 'page']].filter(([n]) => n);
  countEl.textContent = parts.map(([n, word]) => plural(n, word)).join(', ') || 'No matches';
  for (const section of sections) section.hidden = !section.querySelector('.specimen:not([hidden])');
  emptyEl.hidden = shown.length > 0;
}

function selectTier(tier) {
  activeTier = tier;
  for (const btn of tierBtns) {
    const on = btn.dataset.tier === tier;
    btn.setAttribute('variant', on ? 'primary' : 'secondary');
    btn.setAttribute('aria-pressed', String(on));
  }
  applyFilter();
}

// A link to a filtered-out specimen clears the filter first.
function followHash() {
  const target = document.getElementById(location.hash.slice(1));
  if (!target || !target.closest('#specimen-grid')) return;
  if (target.hidden || target.closest('.tier')?.hidden) {
    activeQuery = '';
    document.getElementById('catalog-search').setAttribute('value', '');
    selectTier('all');
  }
  target.scrollIntoView();
}
window.addEventListener('hashchange', followHash);

document.getElementById('catalog-search').addEventListener('ui-search', (e) => {
  activeQuery = e.detail.query || '';
  applyFilter();
});

for (const btn of tierBtns) btn.addEventListener('ui-press', () => selectTier(btn.dataset.tier));

const modal = document.getElementById('detail-modal');
const modalDone = document.getElementById('modal-done-btn');
for (const btn of document.querySelectorAll('.inspect-btn')) {
  btn.addEventListener('ui-press', () => {
    const id = btn.dataset.component;
    const info = CONTRACTS[id];
    modal.setAttribute('title', `<${id}> Contract`);
    document.getElementById('contract-tier').textContent = info.tier;
    document.getElementById('contract-composes').textContent = names(info.composes);
    document.getElementById('contract-used').textContent = names(usedBy(id));
    document.getElementById('contract-attrs').textContent = names(Object.keys(info.attributes));
    document.getElementById('contract-slots').textContent = names(info.slots);
    document.getElementById('contract-events').textContent = names(info.events);
    document.getElementById('contract-a11y').textContent = info.accessibility;
    modal.showModal(btn);
  });
}
modalDone.addEventListener('ui-press', () => modal.close('done'));
applyFilter();
followHash();
