export function setLocalStorage(key, value, access) {
  if (access) { localStorage.setItem(key, value); }
  return value;
}