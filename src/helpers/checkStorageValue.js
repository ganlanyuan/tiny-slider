export function checkStorageValue (value) {
  return ['true', 'false', 'null'].indexOf(value) >= 0 ? JSON.parse(value) : value;
}