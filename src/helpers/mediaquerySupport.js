export function mediaquerySupport () {
  var doc = document,
      body = doc.body,
      div = doc.createElement('div');

  div.className = 'tns-mq-test';
  body.appendChild(div);

  var position = (window.getComputedStyle) ? window.getComputedStyle(div).position : div.currentStyle['position'];
  body.removeChild(div);

  return position === "absolute";
}