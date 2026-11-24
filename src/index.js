export { UiButton } from './atoms/ui-button.js';
export { UiInput } from './atoms/ui-input.js';
export { UiLabel } from './atoms/ui-label.js';
export { UiBadge } from './atoms/ui-badge.js';
export { UiIcon } from './atoms/ui-icon.js';
export { UiSkeleton } from './atoms/ui-skeleton.js';
export { UiChip } from './atoms/ui-chip.js';
export { UiProgress } from './atoms/ui-progress.js';
export { UiTextarea } from './atoms/ui-textarea.js';
export { UiSelect } from './atoms/ui-select.js';
export { UiDot } from './atoms/ui-dot.js';
export { UiCheckbox } from './atoms/ui-checkbox.js';
export { UiSlider } from './atoms/ui-slider.js';
export { UiSwitch } from './atoms/ui-switch.js';
export { UiTooltip } from './atoms/ui-tooltip.js';
export { UiSurface } from './atoms/ui-surface.js';
export { UiDivider } from './atoms/ui-divider.js';

export { UiField } from './molecules/ui-field.js';
export { UiSearchBar } from './molecules/ui-search-bar.js';
export { UiMediaCard } from './molecules/ui-media-card.js';
export { UiStatTile } from './molecules/ui-stat-tile.js';
export { UiCallout } from './molecules/ui-callout.js';
export { UiCodeBlock } from './molecules/ui-code-block.js';
export { UiToolbar } from './molecules/ui-toolbar.js';
export { UiTabs } from './molecules/ui-tabs.js';
export { UiPanelHeader } from './molecules/ui-panel-header.js';

export { UiNavbar } from './organisms/ui-navbar.js';
export { UiModal } from './organisms/ui-modal.js';
export { UiCatalogGrid } from './organisms/ui-catalog-grid.js';
export { UiPopover } from './organisms/ui-popover.js';
export { UiDrawer } from './organisms/ui-drawer.js';
export { UiToast } from './organisms/ui-toast.js';
export { UiTable } from './organisms/ui-table.js';

export { PageShell } from './templates/page-shell.js';
export { CatalogLayout } from './templates/catalog-layout.js';
export { DetailLayout } from './templates/detail-layout.js';
export { WorkspaceLayout } from './templates/workspace-layout.js';

export const TOKENS_URL = new URL('./tokens/tokens.css', import.meta.url).href;

export const ATOMS = [
  'ui-button',
  'ui-input',
  'ui-label',
  'ui-badge',
  'ui-icon',
  'ui-skeleton',
  'ui-chip',
  'ui-progress',
  'ui-textarea',
  'ui-select',
  'ui-dot',
  'ui-checkbox',
  'ui-slider',
  'ui-switch',
  'ui-tooltip',
  'ui-surface',
  'ui-divider',
];

export const MOLECULES = [
  'ui-field',
  'ui-search-bar',
  'ui-media-card',
  'ui-stat-tile',
  'ui-callout',
  'ui-code-block',
  'ui-toolbar',
  'ui-tabs',
  'ui-panel-header',
];

export const ORGANISMS = [
  'ui-navbar',
  'ui-modal',
  'ui-catalog-grid',
  'ui-popover',
  'ui-drawer',
  'ui-toast',
  'ui-table',
];

export const TEMPLATES = [
  'page-shell',
  'catalog-layout',
  'detail-layout',
  'workspace-layout',
];

/**
 * Ensures the design system token stylesheet is linked into the given document.
 * @param {Document} [doc=document]
 * @returns {HTMLLinkElement}
 */
export function ensureTokens(doc = document) {
  const existing = doc.querySelector('link[data-asdlc-tokens]');
  if (existing) return existing;
  const link = doc.createElement('link');
  link.rel = 'stylesheet';
  link.href = TOKENS_URL;
  link.setAttribute('data-asdlc-tokens', 'true');
  doc.head.appendChild(link);
  return link;
}
