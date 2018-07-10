export function setLocalStorage(storage, key, value, access) {
  if (access) { storage.setItem(key, value); }
  return value;
}