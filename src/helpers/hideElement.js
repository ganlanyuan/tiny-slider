import { hasAttr } from './hasAttr';
import { setAttrs } from './setAttrs';

export function hideElement(el) {
  if (!hasAttr(el, 'hidden')) {
    setAttrs(el, {'hidden': ''});
  }
}