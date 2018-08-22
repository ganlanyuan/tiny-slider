import { hasAttr } from './hasAttr.js';
import { removeAttrs } from './removeAttrs.js';

export function showElement(el, forceHide) {
  if (forceHide) {
    if (el.style.display === 'none') { el.style.display = ''; }
  } else if (hasAttr(el, 'hidden')) {
    removeAttrs(el, 'hidden');
  }
}