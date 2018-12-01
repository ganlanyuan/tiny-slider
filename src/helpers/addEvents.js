import { passiveOption } from './passiveOption.js';

export function addEvents(el, obj, preventScroll) {
  for (var prop in obj) {
    el.addEventListener(prop, obj[prop], preventScroll ? false : passiveOption);
  }
}