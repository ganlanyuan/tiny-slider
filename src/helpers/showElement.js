import { hasAttr } from './hasAttr.js';
import { removeAttrs } from './removeAttrs.js';

export function showElement(el) {
  if (hasAttr(el, 'hidden')) {
    removeAttrs(el, 'hidden');
  }
}