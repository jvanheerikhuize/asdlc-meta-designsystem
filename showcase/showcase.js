// The catalog is the only source of contracts, token values and counts.
const catalog = await fetch('./catalog.json').then((res) => res.json());
const CONTRACTS = Object.fromEntries(catalog.components.map((c) => [c.tag, c]));
const TOKENS = Object.fromEntries(Object.values(catalog.tokens).flat().map((t) => [t.name, t]));
const names = (list) => list.map((x) => x.name ?? x).join(', ') || '—';

for (const el of document.querySelectorAll('.swatch-meta')) {
  const token = TOKENS[el.previousElementSibling.textContent];
  el.textContent = `${token.dark} / ${token.light}`;
}

const root = document.documentElement;
document.getElementById('navbar').addEventListener('ui-theme-change', (e) => {
  if (e.detail.theme === 'light') root.setAttribute('data-theme', 'light');
  else root.removeAttribute('data-theme');
});

const specimens = Array.from(document.querySelectorAll('#specimen-grid .specimen'));
const countEl = document.getElementById('catalog-count');
const tierBtns = Array.from(document.querySelectorAll('.tier-btn'));
for (const btn of tierBtns) {
  const inTier = specimens.filter((el) => el.dataset.tier === btn.dataset.tier).length;
  if (inTier) btn.textContent += ` (${inTier})`;
}
let activeTier = 'all';
let activeQuery = '';

function applyFilter() {
  let visible = 0;
  const q = activeQuery.trim().toLowerCase();
  for (const el of specimens) {
    const tierOk = activeTier === 'all' || el.dataset.tier === activeTier;
    const queryOk = !q || el.textContent.toLowerCase().includes(q);
    const show = tierOk && queryOk;
    el.hidden = !show;
    if (show) visible += 1;
  }
  countEl.textContent = `${visible} component${visible === 1 ? '' : 's'}`;
}

document.getElementById('catalog-search').addEventListener('ui-search', (e) => {
  activeQuery = e.detail.query || '';
  applyFilter();
});

for (const btn of tierBtns) {
  btn.addEventListener('ui-press', () => {
    activeTier = btn.dataset.tier;
    for (const b of tierBtns) b.setAttribute('variant', b === btn ? 'primary' : 'secondary');
    applyFilter();
  });
}

const modal = document.getElementById('detail-modal');
const modalDone = document.getElementById('modal-done-btn');
for (const btn of document.querySelectorAll('.inspect-btn')) {
  btn.addEventListener('ui-press', () => {
    const id = btn.dataset.component;
    const info = CONTRACTS[id];
    modal.setAttribute('title', `<${id}> Contract`);
    document.getElementById('contract-tier').textContent = info.tier;
    document.getElementById('contract-attrs').textContent = names(Object.keys(info.attributes));
    document.getElementById('contract-slots').textContent = names(info.slots);
    document.getElementById('contract-events').textContent = names(info.events);
    document.getElementById('contract-a11y').textContent = info.accessibility;
    modal.showModal(btn);
  });
}
modalDone.addEventListener('ui-press', () => modal.close('done'));
applyFilter();
