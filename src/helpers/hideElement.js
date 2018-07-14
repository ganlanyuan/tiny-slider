import { hasAttr } from './hasAttr.js';
import { setAttrs } from './setAttrs.js';

export function hideElement(el) {
  if (!hasAttr(el, 'hidden')) {
    setAttrs(el, {'hidden': ''});
  }
}