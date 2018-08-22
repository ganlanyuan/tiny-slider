import { hasAttr } from './hasAttr.js';
import { setAttrs } from './setAttrs.js';

export function hideElement(el, forceHide) {
  if (forceHide) {
    if (el.style.display !== 'none') { el.style.display = 'none'; }
  } else if (!hasAttr(el, 'hidden')) {
    setAttrs(el, {'hidden': ''});
  }
}