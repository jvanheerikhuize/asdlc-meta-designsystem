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
export { UiAbbr } from './atoms/ui-abbr.js';
export { UiArrow } from './atoms/ui-arrow.js';
export { UiAudio } from './atoms/ui-audio.js';
export { UiAvatar } from './atoms/ui-avatar.js';
export { UiCenter } from './atoms/ui-center.js';
export { UiCluster } from './atoms/ui-cluster.js';
export { UiCode } from './atoms/ui-code.js';
export { UiColorInput } from './atoms/ui-color-input.js';
export { UiCounter } from './atoms/ui-counter.js';
export { UiDisclosure } from './atoms/ui-disclosure.js';
export { UiEmbed } from './atoms/ui-embed.js';
export { UiFieldset } from './atoms/ui-fieldset.js';
export { UiFileInput } from './atoms/ui-file-input.js';
export { UiGlow } from './atoms/ui-glow.js';
export { UiGrid } from './atoms/ui-grid.js';
export { UiHandle } from './atoms/ui-handle.js';
export { UiHeading } from './atoms/ui-heading.js';
export { UiHint } from './atoms/ui-hint.js';
export { UiImage } from './atoms/ui-image.js';
export { UiKbd } from './atoms/ui-kbd.js';
export { UiLink } from './atoms/ui-link.js';
export { UiList } from './atoms/ui-list.js';
export { UiLive } from './atoms/ui-live.js';
export { UiMark } from './atoms/ui-mark.js';
export { UiMarker } from './atoms/ui-marker.js';
export { UiMenuItem } from './atoms/ui-menu-item.js';
export { UiMeter } from './atoms/ui-meter.js';
export { UiNavLink } from './atoms/ui-nav-link.js';
export { UiNumber } from './atoms/ui-number.js';
export { UiNumberInput } from './atoms/ui-number-input.js';
export { UiOutput } from './atoms/ui-output.js';
export { UiQuote } from './atoms/ui-quote.js';
export { UiRadio } from './atoms/ui-radio.js';
export { UiRating } from './atoms/ui-rating.js';
export { UiRatio } from './atoms/ui-ratio.js';
export { UiRing } from './atoms/ui-ring.js';
export { UiScrim } from './atoms/ui-scrim.js';
export { UiScroll } from './atoms/ui-scroll.js';
export { UiSkipLink } from './atoms/ui-skip-link.js';
export { UiSpacer } from './atoms/ui-spacer.js';
export { UiSparkline } from './atoms/ui-sparkline.js';
export { UiSpinner } from './atoms/ui-spinner.js';
export { UiStack } from './atoms/ui-stack.js';
export { UiStepMarker } from './atoms/ui-step-marker.js';
export { UiSwatch } from './atoms/ui-swatch.js';
export { UiText } from './atoms/ui-text.js';
export { UiTime } from './atoms/ui-time.js';
export { UiTrend } from './atoms/ui-trend.js';
export { UiVideo } from './atoms/ui-video.js';
export { UiVisuallyHidden } from './atoms/ui-visually-hidden.js';

export { UiField } from './molecules/ui-field.js';
export { UiSearchBar } from './molecules/ui-search-bar.js';
export { UiMediaCard } from './molecules/ui-media-card.js';
export { UiStatTile } from './molecules/ui-stat-tile.js';
export { UiCallout } from './molecules/ui-callout.js';
export { UiCodeBlock } from './molecules/ui-code-block.js';
export { UiToolbar } from './molecules/ui-toolbar.js';
export { UiTabs } from './molecules/ui-tabs.js';
export { UiPanelHeader } from './molecules/ui-panel-header.js';
export { UiEmptyState } from './molecules/ui-empty-state.js';
export { UiThemeToggle } from './molecules/ui-theme-toggle.js';

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
  'ui-abbr',
  'ui-arrow',
  'ui-audio',
  'ui-avatar',
  'ui-center',
  'ui-cluster',
  'ui-code',
  'ui-color-input',
  'ui-counter',
  'ui-disclosure',
  'ui-embed',
  'ui-fieldset',
  'ui-file-input',
  'ui-glow',
  'ui-grid',
  'ui-handle',
  'ui-heading',
  'ui-hint',
  'ui-image',
  'ui-kbd',
  'ui-link',
  'ui-list',
  'ui-live',
  'ui-mark',
  'ui-marker',
  'ui-menu-item',
  'ui-meter',
  'ui-nav-link',
  'ui-number',
  'ui-number-input',
  'ui-output',
  'ui-quote',
  'ui-radio',
  'ui-rating',
  'ui-ratio',
  'ui-ring',
  'ui-scrim',
  'ui-scroll',
  'ui-skip-link',
  'ui-spacer',
  'ui-sparkline',
  'ui-spinner',
  'ui-stack',
  'ui-step-marker',
  'ui-swatch',
  'ui-text',
  'ui-time',
  'ui-trend',
  'ui-video',
  'ui-visually-hidden',
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
  'ui-empty-state',
  'ui-theme-toggle',
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
