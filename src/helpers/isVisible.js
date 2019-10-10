export function isVisible(el) {

  return typeof window === 'undefined' ? false : window.getComputedStyle(el).display !== 'none';
}