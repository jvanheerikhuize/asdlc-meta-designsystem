export { UiButton } from './atoms/ui-button.js';
export { UiInput } from './atoms/ui-input.js';
export { UiLabel } from './atoms/ui-label.js';
export { UiBadge } from './atoms/ui-badge.js';
export { UiIcon } from './atoms/ui-icon.js';
export { UiSkeleton } from './atoms/ui-skeleton.js';

export const TOKENS_URL = new URL('./tokens/tokens.css', import.meta.url).href;

export const ATOMS = [
  'ui-button',
  'ui-input',
  'ui-label',
  'ui-badge',
  'ui-icon',
  'ui-skeleton',
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
