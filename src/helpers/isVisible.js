export function isVisible(el) {
  return window.getComputedStyle(el).display !== 'none';
}