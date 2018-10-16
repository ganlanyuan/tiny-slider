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

// simulateClick(clickHandler)
// https://stackoverflow.com/questions/6157929/how-to-simulate-a-mouse-click-using-javascript#answer-6158160
function simulateClick(target, options) {
  if (target.dispatchEvent) {
    var event = target.ownerDocument.createEvent('MouseEvents'),
        options = options || {},
        opts = { // These are the default values, set up for un-modified left clicks
          type: 'click',
          canBubble: true,
          cancelable: true,
          view: target.ownerDocument.defaultView,
          detail: 1,
          screenX: 0, //The coordinates within the entire page
          screenY: 0,
          clientX: 0, //The coordinates within the viewport
          clientY: 0,
          ctrlKey: false,
          altKey: false,
          shiftKey: false,
          metaKey: false, //I *think* 'meta' is 'Cmd/Apple' on Mac, and 'Windows key' on Win. Not sure, though!
          button: 0, //0 = left, 1 = middle, 2 = right
          relatedTarget: null,
        };

    //Merge the options with the defaults
    for (var key in options) {
      if (options.hasOwnProperty(key)) {
        opts[key] = options[key];
      }
    }

    //Pass in the options
    event.initMouseEvent(
        opts.type,
        opts.canBubble,
        opts.cancelable,
        opts.view,
        opts.detail,
        opts.screenX,
        opts.screenY,
        opts.clientX,
        opts.clientY,
        opts.ctrlKey,
        opts.altKey,
        opts.shiftKey,
        opts.metaKey,
        opts.button,
        opts.relatedTarget
    );

    //Fire the event
    target.dispatchEvent(event);
  } else {
    target.click();
  }
}

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

// Object.keys polyfill
if (!Object.keys) Object.keys = function(o) {
  if (o !== Object(o))
    throw new TypeError('Object.keys called on a non-object');
  var k=[],p;
  for (p in o) if (Object.prototype.hasOwnProperty.call(o,p)) k.push(p);
  return k;
}

// element child polyfills
(function(){
  "use strict";
  
  var patches = {
    
    firstElementChild: function(){
      for(var nodes = this.children, n, i = 0, l = nodes.length; i < l; ++i)
        if(n = nodes[i], 1 === n.nodeType) return n;
      return null;
    },
    
    lastElementChild: function(){
      for(var nodes = this.children, n, i = nodes.length - 1; i >= 0; --i)
        if(n = nodes[i], 1 === n.nodeType) return n;
      return null;
    },
    
    nextElementSibling: function(){
      var e = this.nextSibling;
      while(e && 1 !== e.nodeType)
        e = e.nextSibling;
      return e;
    },
    
    previousElementSibling: function(){
      var e = this.previousSibling;
      while(e && 1 !== e.nodeType)
        e = e.previousSibling;
      return e;
    },
    
    childElementCount: function(){
      for(var c = 0, nodes = this.children, n, i = 0, l = nodes.length; i < l; ++i)
        (n = nodes[i], 1 === n.nodeType) && ++c;
      return c;
    }
  };
  
  for(var i in patches)
    i in document.documentElement ||
    Object.defineProperty(Element.prototype, i, {get: patches[i]});
}());