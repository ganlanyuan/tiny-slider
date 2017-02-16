import { hasAttr } from './hasAttr';
import { removeAttrs } from './removeAttrs';

export function showElement(el) {
  if (hasAttr(el, 'hidden')) {
    removeAttrs(el, 'hidden');
  }
}