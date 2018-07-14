// get subpixel support value
// @return - boolean
import { getBody } from './getBody.js';
import { setFakeBody } from './setFakeBody.js';
import { resetFakeBody } from './resetFakeBody.js';

export function subpixelLayout() {
  // check subpixel layout supporting
  var doc = document,
      body = getBody(),
      docOverflow = setFakeBody(body),
      parent = doc.createElement('div'),
      child1 = doc.createElement('div'),
      child2,
      supported = false;

  parent.style.cssText = 'width: 10px';
  child1.style.cssText = 'float: left; width: 5.5px; height: 10px;';
  child2 = child1.cloneNode(true);

  parent.appendChild(child1);
  parent.appendChild(child2);
  body.appendChild(parent);

  // check calc() capability
  if(child1.offsetTop !== child2.offsetTop) {
    var wrapper = doc.createElement('div'),
        outer = doc.createElement('div'),
        inner = doc.createElement('div'),
        count = 700;

    wrapper.className = "tns-t-subp2";
    outer.className = "out";
    inner.className = "in";
    outer.appendChild(inner);
    wrapper.appendChild(outer);
    body.appendChild(wrapper);

    supported = inner.offsetWidth === 500;
  }

  body.fake ? resetFakeBody(body, docOverflow) : parent.remove();

  return supported;
}