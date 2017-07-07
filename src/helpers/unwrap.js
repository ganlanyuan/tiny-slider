export function unwrap(el) {
  // get the element's parent node
  var parent = el.parentNode;
  
  // move all children out of the element
  while (el.firstChild) { 
    parent.insertBefore(el.firstChild, el); 
  }
  
  // remove the empty element
  parent.removeChild(el);
}