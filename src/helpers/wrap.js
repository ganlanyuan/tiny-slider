export function wrap(el, wrapper) {
  // Cache the current parent and sibling.
  var parent = el.parentNode, sibling = el.nextSibling;

  // Wrap the element (is automatically removed from its current parent).
  wrapper.appendChild(el);

  // If the element had a sibling, insert the wrapper before
  // the sibling to maintain the HTML structure; otherwise, just
  // append it to the parent.
  if (sibling) {
    parent.insertBefore(wrapper, sibling);
  } else {
    parent.appendChild(wrapper);
  }
}