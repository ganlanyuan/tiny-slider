// get subpixel support value
// @return - boolean
export function subpixelLayout() {
  var doc = document,
      body = doc.body,
      parent = doc.createElement('div'),
      child1 = doc.createElement('div'),
      child2;
  parent.style.cssText = 'width: 10px';
  child1.style.cssText = 'float: left; width: 5.5px; height: 10px;';
  child2 = child1.cloneNode(true);

  parent.appendChild(child1);
  parent.appendChild(child2);
  body.appendChild(parent);

  var supported = child1.offsetTop !== child2.offsetTop;
  body.removeChild(parent);

  return supported;
}