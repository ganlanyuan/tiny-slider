import { hasClass } from './hasClass';
export function addClass(el, str) {
  if (!hasClass(el,  str)) {
    el.className += ' ' + str;
  }
}