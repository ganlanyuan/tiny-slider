export function getSessionStorage(key, value) {
  if (!sessionStorage.getItem(key)) {
    sessionStorage.setItem(key, value);
  }
  var result = sessionStorage.getItem(key);
  return (['true', 'false', 'null'].indexOf(result) >= 0) ? JSON.parse(result) : result;
}