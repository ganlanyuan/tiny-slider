export function has3D(tf){
  if (!window.getComputedStyle) { return false; }
  
  var el = document.createElement('p'),
      has3d,
      cssTF = tf.length > 9 ? '-' + tf.slice(0, -9).toLowerCase() + '-' : '';

  cssTF += 'transform';

  // Add it to the body to get the computed style
  document.body.insertBefore(el, null);

  el.style[tf] = 'translate3d(1px,1px,1px)';
  has3d = window.getComputedStyle(el).getPropertyValue(cssTF);

  document.body.removeChild(el);
  return (has3d !== undefined && has3d.length > 0 && has3d !== "none");
}
