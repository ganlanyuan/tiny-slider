export function getLocalStorage(key, value) {
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, value);
  }
  var result = localStorage.getItem(key);
  return (['true', 'false', 'null'].indexOf(result) >= 0) ? JSON.parse(result) : result;
}