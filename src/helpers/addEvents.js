export function addEvents(el, events) {
  function add(arr) {
    el.addEventListener(arr[0], arr[1], false);
  }

  if (Array.isArray(events)) {
    if (Array.isArray(events[0])) {
      for (var i = events.length; i--;) {
        add(events[i]);
      }
    } else {
      add(events);
    }
  }
}