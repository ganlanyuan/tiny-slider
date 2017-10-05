import { hasClass } from './hasClass';
export function removeClass(el, str) {
  if (hasClass(el, str)) {
    el.className = el.className.replace(str, '');
  }
}