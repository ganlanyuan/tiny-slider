function simulateClick(el) {
  try {
    // modern browsers, IE11+
    var event = new MouseEvent('click', {
      'view': window,
      'bubbles': true,
      'cancelable': true
    });
    el.dispatchEvent(event);
    alert('MouseEvent');
  } catch (e) {
    if ('createEvent' in document) {
      // modern browsers, IE9+
      var event = document.createEvent('HTMLEvents');
      event.initEvent('click', false, true);
      el.dispatchEvent(event);
      alert('createEvent');
    } else {
      // IE8
      var event = document.createEventObject();
      el.fireEvent('onclick', event);
      alert('None');
    }
  }
}
// simulateClick(clickHandler)

function CustomEvent (event, params) {
  params = params || { bubbles: false, cancelable: false, detail: undefined };
  var evt;
  try {
    evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
  } catch (error) {
    // fallback for browsers that don't support createEvent('CustomEvent')
    evt = document.createEvent('Event');
    for (var param in params) {
      evt[param] = params[param];
    }
    evt.initEvent(event, params.bubbles, params.cancelable);
  }
  return evt;
}
if(typeof window.CustomEvent !== 'undefined') {
  CustomEvent.prototype = window.CustomEvent.prototype;
}
window.CustomEvent = CustomEvent;

function fire (el, type,options){
  var event=new CustomEvent(type);
  for(var p in options){
     event[p] = options[p];
  }
  el.dispatchEvent(event);
}
// fire(keyboardHandler, "keydown",{"ctrlKey":false,"keyCode":37,"bubbles":true});

function timeout(delay) {
  return function () {
    return new Promise(function(resolve, reject) {
      setTimeout(resolve, delay);
    });
  };
}

// Promise.resolve().then(timeout(3000)).then(function () {
//   nextBtn.click();
// }).then(timeout(3000)).then(function () {
//   nextBtn.click();
// }).then(timeout(3000)).then(function () {
//   nextBtn.click();
// });