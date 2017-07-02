// get transitionend, animationend based on transitionDuration
// @propin: string
// @propOut: string, first-letter uppercase
// Usage: getEndProperty('webkitTransitionDuration', 'Transition') => webkitTransitionEnd
export function getEndProperty(propIn, propOut) {
  var endProp = false;
  if (/^webkit/.test(propIn)) {
    endProp = 'webkit' + propOut + 'End';
  } else if (/^o/.test(propIn)) {
    endProp = 'o' + propOut + 'End';
  } else if (propIn) {
    endProp = propOut.toLowerCase() + 'end';
  }
  return endProp;
}