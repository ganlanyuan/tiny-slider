export function setLocalStorage(key, value) {
  localStorage.setItem(key, value);
  return value;
}