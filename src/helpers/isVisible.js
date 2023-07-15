import { isServer } from './isServer';

export function isVisible(el) {
  return isServer ? false : window.getComputedStyle(el).display !== 'none';
}