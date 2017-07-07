export function getSessionStorage(key, value) {
  if (!sessionStorage.getItem(key)) {
    sessionStorage.setItem(key, value);
  }
  return sessionStorage.getItem(key);
}