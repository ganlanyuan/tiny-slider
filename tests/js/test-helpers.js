if(!window.getComputedStyle){
  window.getComputedStyle = function(el){
    if(!el) { return null; }
    
    /**
     * currentStyle returns an instance of a non-standard class called "CSSCurrentStyleDeclaration"
     * instead of "CSSStyleDeclaration", which has a few methods and properties missing (such as cssText).
     * https://msdn.microsoft.com/en-us/library/cc848941(v=vs.85).aspx
     *
     * Instead of returning the currentStyle value directly, we'll copy its properties to the style
     * of a shadow element. This ensures cssText is included, and ensures the result is an instance of
     * the correct DOM interface.
     *
     * There'll still be some minor discrepancies in the style values. For example, IE preserves the way
     * colour values were authored, whereas standards-compliant browsers will expand colours to use "rgb()"
     * notation. We won't bother to fix things like these, as they'd involve too much fiddling for little
     * gain.
     */
    
    var style   = el.currentStyle;
    var box     = el.getBoundingClientRect();
    var shadow  = document.createElement("div");
    var output  = shadow.style;
    for(var i in style) {
      output[i] = style[i];
    }
    
    /** Fix some glitches */
    output.cssFloat = output.styleFloat;
    if("auto" === output.width) { output.width  = (box.right - box.left) + "px"; }
    if("auto" === output.height) { output.height = (box.bottom - box.top) + "px"; }
    return output;
  };
} 

function simulateClick(el) {
  try {
    // modern browsers, IE11+
    var event = new MouseEvent('click', {
      'view': window,
      'bubbles': true,
      'cancelable': true
    });
    el.dispatchEvent(event);
    // alert('MouseEvent');
  } catch (e) {
    if ('createEvent' in document) {
      // modern browsers, IE9+
      var event = document.createEvent('HTMLEvents');
      event.initEvent('click', false, true);
      el.dispatchEvent(event);
      // alert('createEvent');
    } else {
      // IE8
      var event = document.createEventObject();
      el.fireEvent('onclick', event);
      // alert('None');
    }
  }
}
// simulateClick(clickHandler)

// IE9+, firefox8+, chrome19+, opera12.1+, safari6+
function CustomEvent (event, params) {
  params = params || { bubbles: false, cancelable: false, detail: undefined };
  var evt;
  try {
    evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
  } catch (e) {
    // fallback for browsers that don't support createEvent('CustomEvent')
    try {
      evt = document.createEvent('Event');
      for (var param in params) {
        evt[param] = params[param];
      }
      evt.initEvent(event, params.bubbles, params.cancelable);
    } catch (e) {
    }
  }
  return evt;
}
if(typeof window.CustomEvent !== 'undefined') {
  CustomEvent.prototype = window.CustomEvent.prototype;
}
window.CustomEvent = CustomEvent;

function fire (el, type,options){
  if (el.dispatchEvent) {
    var event = new CustomEvent(type);
    for(var p in options){
       event[p] = options[p];
    }
    el.dispatchEvent(event);
  }
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