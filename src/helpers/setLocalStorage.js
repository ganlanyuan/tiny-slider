export function setLocalStorage(storage, key, value, access) {
  if (access) {
    try { storage.setItem(key, value); } catch () {}
  }
  return value;
}