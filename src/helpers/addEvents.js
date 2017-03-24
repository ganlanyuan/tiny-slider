import { passiveOption } from './passiveOption';

export function addEvents(el, obj) {
  for (var prop in obj) {
    var option = (prop === 'touchstart' || prop === 'touchmove') ? passiveOption : false;
    el.addEventListener(prop, obj[prop], option);
  }
}