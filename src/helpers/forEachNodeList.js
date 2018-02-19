// https://toddmotto.com/ditch-the-array-foreach-call-nodelist-hack/
export function forEachNodeList (arr, callback, scope) {
  for (var i = 0, l = arr.length; i < l; i++) {
    callback.call(scope, arr[i], i);
  }
}