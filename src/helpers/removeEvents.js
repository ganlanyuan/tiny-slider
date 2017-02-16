export function removeEvents(el, events) {
  function remove(arr) {
    el.removeEventListener(arr[0], arr[1], false);
  }

  if (Array.isArray(events)) {
    if (Array.isArray(events[0])) {
      for (var i = events.length; i--;) {
        remove(events[i]);
      }
    } else {
      remove(events);
    }
  }
}