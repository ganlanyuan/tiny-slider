/** ChildNode.remove */
if(!("remove" in Element.prototype)){
	Element.prototype.remove = function(){
		if(this.parentNode)
			this.parentNode.removeChild(this);
	};
}


/** DOMTokenList */
!function(){"use strict";var n,r,t,e,i=window,o=document,u=Object,f=null,a=!0,c=!1,l=" ",s="Element",d="create"+s,h="DOMTokenList",m="__defineGetter__",p="defineProperty",v="class",g="List",y=v+g,w="rel",L=w+g,_="div",b="length",j="contains",S="apply",k="HTML",E=("item "+j+" add remove toggle toString toLocaleString").split(l),A=E[2],C=E[3],M=E[4],N="prototype",O=p in u||m in u[N]||f,T=function(n,r,t,e){u[p]?u[p](n,r,{configurable:c===O?a:!!e,get:t}):n[m](r,t)},x=function(r,t){var e=this,i=[],o={},f=0,s=0,d=function(){if(f>=s)for(;f>s;++s)(function(n){T(e,n,function(){return h(),i[n]},c)})(s)},h=function(){var n,e,u=arguments,c=/\s+/;if(u[b])for(e=0;e<u[b];++e)if(c.test(u[e]))throw n=new SyntaxError('String "'+u[e]+'" '+j+" an invalid character"),n.code=5,n.name="InvalidCharacterError",n;for(i=(""+r[t]).replace(/^\s+|\s+$/g,"").split(c),""===i[0]&&(i=[]),o={},e=0;e<i[b];++e)o[i[e]]=a;f=i[b],d()};return h(),T(e,b,function(){return h(),f}),e[E[6]]=e[E[5]]=function(){return h(),i.join(l)},e.item=function(n){return h(),i[n]},e[j]=function(n){return h(),!!o[n]},e[A]=function(){h[S](e,n=arguments);for(var n,u,c=0,s=n[b];s>c;++c)u=n[c],o[u]||(i.push(u),o[u]=a);f!==i[b]&&(f=i[b]>>>0,r[t]=i.join(l),d())},e[C]=function(){h[S](e,n=arguments);for(var n,u={},c=0,s=[];c<n[b];++c)u[n[c]]=a,delete o[n[c]];for(c=0;c<i[b];++c)u[i[c]]||s.push(i[c]);i=s,f=s[b]>>>0,r[t]=i.join(l),d()},e[M]=function(r,t){return h[S](e,[r]),n!==t?t?(e[A](r),a):(e[C](r),c):o[r]?(e[C](r),c):(e[A](r),a)},function(n,r){if(r)for(var t=0;7>t;++t)r(n,E[t],{enumerable:c})}(e,u[p]),e},D=function(n,r,t){T(n[N],r,function(){var n,e=this,i=m+p+r;if(e[i])return n;if(e[i]=a,c===O){for(var u,f=D.mirror=D.mirror||o[d](_),l=f.childNodes,s=l[b],h=0;s>h;++h)if(l[h]._R===e){u=l[h];break}u||(u=f.appendChild(o[d](_))),n=x.call(u,e,t)}else n=new x(e,t);return T(e,r,function(){return n}),delete e[i],n},a)};if(i[h])r=o[d](_)[y],N=i[h][N],r[A][S](r,E),2>r[b]&&(t=N[A],e=N[C],N[A]=function(){for(var n=0,r=arguments;n<r[b];++n)t.call(this,r[n])},N[C]=function(){for(var n=0,r=arguments;n<r[b];++n)e.call(this,r[n])}),r[M](g,c)&&(N[M]=function(r,t){var e=this;return e[(t=n===t?!e[j](r):t)?A:C](r),!!t});else{if(O)try{T({},"support")}catch(G){O=c}x.polyfill=a,i[h]=x,D(i[s],y,v+"Name"),D(i[k+"Link"+s],L,w),D(i[k+"Anchor"+s],L,w),D(i[k+"Area"+s],L,w)}}();


/** Store "constants" on the window object to flag specific versions of Explorer. */
(function(){
	var i      = 6,
	WIN        = window,
	DOC        = document,
	IE_VERSION = "IE_VERSION";
	
	function is(v){
		var div = DOC.createElement("div");
		div.innerHTML = "<!--[if " + v + "]><i></i><![endif]-->";
		return div.getElementsByTagName("i").length;
	}
	
	for(; i < 10; ++i) if(is("IE " + i))
		WIN["IS_IE" + i ] = true,
		WIN[ IE_VERSION ] = i;

	is("IEMobile") && (WIN.IS_IEMobile = true);
	
	/** Might as well flag the root element with CSS classes while we're here. */
	DOC.documentElement.classList.add("ie", "ie"+WIN[ IE_VERSION ]);
}());


Date.now                = Date.now                || function(){return +new Date};
String.prototype.trim   = String.prototype.trim   || function(){return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");};
Object.defineProperties = Object.defineProperties || function(obj, props){for(var i in props) Object.defineProperty(obj, i, props[i]);};
Array.isArray           = Array.isArray           || function(obj){return "[object Array]" === Object.prototype.toString.call(obj)};
Number.isNaN            = Number.isNaN            || function(val){return val !== val};
String.prototype.repeat = String.prototype.repeat || function(num){return Array(num + 1).join(this)};


// Adapted from https://gist.github.com/paulirish/1579671 which derived from 
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller.
// Fixes from Paul Irish, Tino Zijdel, Andrew Mao, Klemen Slavič, Darius Bacon

// MIT license

if (!Date.now)
    Date.now = function() { return new Date().getTime(); };

(function() {
    'use strict';
    
    var vendors = ['webkit', 'moz'];
    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
        var vp = vendors[i];
        window.requestAnimationFrame = window[vp+'RequestAnimationFrame'];
        window.cancelAnimationFrame = (window[vp+'CancelAnimationFrame']
                                   || window[vp+'CancelRequestAnimationFrame']);
    }
    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) // iOS6 is buggy
        || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
        var lastTime = 0;
        window.requestAnimationFrame = function(callback) {
            var now = Date.now();
            var nextTime = Math.max(lastTime + 16, now);
            return setTimeout(function() { callback(lastTime = nextTime); },
                              nextTime - now);
        };
        window.cancelAnimationFrame = clearTimeout;
    }
}());


(function(window, document, undefined){
"use strict";

// create a test element
var testElem = document.createElement('test'),
    docElement = document.documentElement,
    defaultView = document.defaultView,
    getComputedStyle = defaultView && defaultView.getComputedStyle,
    computedValueBug,
    runit = /^(-?[\d+\.\-]+)([a-z]+|%)$/i,
    convert = {},
    conversions = [1/25.4, 1/2.54, 1/72, 1/6],
    units = ['mm', 'cm', 'pt', 'pc', 'in', 'mozmm'],
    i = 6; // units.length

// add the test element to the dom
docElement.appendChild(testElem);

// test for the WebKit getComputedStyle bug
// @see http://bugs.jquery.com/ticket/10639
if (getComputedStyle) {
    // add a percentage margin and measure it
    testElem.style.marginTop = '1%';
    computedValueBug = getComputedStyle(testElem).marginTop === '1%';
}

// pre-calculate absolute unit conversions
while(i--) {
    convert[units[i] + "toPx"] = conversions[i] ? conversions[i] * convert.inToPx : toPx(testElem, '1' + units[i]);
}

// remove the test element from the DOM and delete it
docElement.removeChild(testElem);
testElem = undefined;

// convert a value to pixels
function toPx(elem, value, prop, force) {
    // use width as the default property, or specify your own
    prop = prop || 'width';

    var style,
        inlineValue,
        ret,
        unit = (value.match(runit)||[])[2],
        conversion = unit === 'px' ? 1 : convert[unit + 'toPx'],
        rem = /r?em/i;

    if (conversion || rem.test(unit) && !force) {
        // calculate known conversions immediately
        // find the correct element for absolute units or rem or fontSize + em or em
        elem = conversion ? elem : unit === 'rem' ? docElement : prop === 'fontSize' ? elem.parentNode || elem : elem;

        // use the pre-calculated conversion or fontSize of the element for rem and em
        conversion = conversion || parseFloat(curCSS(elem, 'fontSize'));

        // multiply the value by the conversion
        ret = parseFloat(value) * conversion;
    } else {
        // begin "the awesome hack by Dean Edwards"
        // @see http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

        // remember the current style
        style = elem.style;
        inlineValue = style[prop];

        // set the style on the target element
        try {
            style[prop] = value;
        } catch(e) {
            // IE 8 and below throw an exception when setting unsupported units
            return 0;
        }

        // read the computed value
        // if style is nothing we probably set an unsupported unit
        ret = !style[prop] ? 0 : parseFloat(curCSS(elem, prop));

        // reset the style back to what it was or blank it out
        style[prop] = inlineValue !== undefined ? inlineValue : null;
    }

    // return a number
    return ret;
}

// return the computed value of a CSS property
function curCSS(elem, prop) {
    var value,
        pixel,
        unit,
        rvpos = /^top|bottom/,
        outerProp = ["paddingTop", "paddingBottom", "borderTop", "borderBottom"],
        innerHeight,
        parent,
        i = 4; // outerProp.length
    
    if (getComputedStyle) {
        // FireFox, Chrome/Safari, Opera and IE9+
        value = getComputedStyle(elem)[prop];
    } else if (pixel = elem.style['pixel' + prop.charAt(0).toUpperCase() + prop.slice(1)]) {
        // IE and Opera support pixel shortcuts for top, bottom, left, right, height, width
        // WebKit supports pixel shortcuts only when an absolute unit is used
        value = pixel + 'px';
    } else if (prop === 'fontSize') {
        // correct IE issues with font-size
        // @see http://bugs.jquery.com/ticket/760
        value = toPx(elem, '1em', 'left', 1) + 'px';
    } else {
        // IE 8 and below return the specified style
        value = elem.currentStyle[prop];
    }

    // check the unit
    unit = (value.match(runit)||[])[2];
    if (unit === '%' && computedValueBug) {
        // WebKit won't convert percentages for top, bottom, left, right, margin and text-indent
        if (rvpos.test(prop)) {
            // Top and bottom require measuring the innerHeight of the parent.
            innerHeight = (parent = elem.parentNode || elem).offsetHeight;
            while (i--) {
              innerHeight -= parseFloat(curCSS(parent, outerProp[i]));
            }
            value = parseFloat(value) / 100 * innerHeight + 'px';
        } else {
            // This fixes margin, left, right and text-indent
            // @see https://bugs.webkit.org/show_bug.cgi?id=29084
            // @see http://bugs.jquery.com/ticket/10639
            value = toPx(elem, value);
        }
    } else if ((value === 'auto' || (unit && unit !== 'px')) && getComputedStyle) {
        // WebKit and Opera will return auto in some cases
        // Firefox will pass back an unaltered value when it can't be set, like top on a static element
        value = 0;
    } else if (unit && unit !== 'px' && !getComputedStyle) {
        // IE 8 and below won't convert units for us
        // try to convert using a prop that will return pixels
        // this will be accurate for everything (except font-size and some percentages)
        value = toPx(elem, value) + 'px';
    }
    return value;
}

// expose the conversion function to the window object
window.Length = {
    toPx: toPx
};
}(this, this.document));

// *** gn *** //
var gn = {};

/** 
  * optimizedResize
  * https://developer.mozilla.org/en-US/docs/Web/Events/resize#requestAnimationFrame
  */

gn.optimizedResize = (function() {

  var callbacks = [],
  running = false;

  // fired on resize event
  function resize() {

    if (!running) {
      running = true;

      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(runCallbacks);
      } else {
        setTimeout(runCallbacks, 66);
      }
    }

  }

  // run the actual callbacks
  function runCallbacks() {

    callbacks.forEach(function(callback) {
      callback();
    });

    running = false;
  }

  // adds callback to loop
  function addCallback(callback) {

    if (callback) {
      callbacks.push(callback);
    }

  }

  return {
    // public method to add additional callback
    add: function(callback) {
      if (!callbacks.length) {
        window.addEventListener('resize', resize);
      }
      addCallback(callback);
    }
  };
}());

// start process
// optimizedResize.add(function() {
//   console.log('Resource conscious resize callback!')
// });

/* DOM ready */
gn.ready = function ( fn ) {

  // Sanity check
  if ( typeof fn !== 'function' ) return;

  // If document is already loaded, run method
  if ( document.readyState === 'complete'  ) {
    return fn();
  }

  // Otherwise, wait until document is loaded
  document.addEventListener( 'DOMContentLoaded', fn, false );

};

// ** extend ** //
gn.extend = function () {
  var obj, name, copy,
  target = arguments[0] || {},
  i = 1,
  length = arguments.length;

  for (; i < length; i++) {
    if ((obj = arguments[i]) !== null) {
      for (name in obj) {
        copy = obj[name];

        if (target === copy) {
          continue;
        } else if (copy !== undefined) {
          target[name] = copy;
        }
      }
    }
  }
  return target;
}

// *** isInViewport *** //
gn.isInViewport = function ( elem ) {
  var rect = elem.getBoundingClientRect();
  return (
    rect.bottom >= 0 &&
    rect.right >= 0 &&
    rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.left <= (window.innerWidth || document.documentElement.clientWidth)
    );
};

/* get supported property */
gn.getSupportedProp = function (proparray){
  var root = document.documentElement;
  for (var i=0; i<proparray.length; i++){
    if (proparray[i] in root.style){
      return proparray[i];
    }
  }
}
// var getTD = gn.getSupportedProp(['transitionDuration', 'WebkitTransitionDuration', 'MozTransitionDuration', 'OTransitionDuration']),
// getTransform = gn.getSupportedProp(['transform', 'WebkitTransform', 'MozTransform', 'OTransform']);

/* getOffsetLeft */
gn.getOffsetLeft = function (el) {
  var rect = el.getBoundingClientRect(),
      left = rect.left + document.body.scrollLeft;
  return Math.round(left);
};


/* getOffsetTop */
gn.getOffsetTop = function (el) {
  var rect = el.getBoundingClientRect(),
      top = rect.top + document.body.scrollTop;
  return Math.round(top);
};



/* get elements size */
// 1. outer size: content + padding + border + margin //
gn.getOuterWidth = function (el) {
  var pattern = /\d/, // check if value contains digital number
      width = el.offsetWidth,
      style = el.currentStyle || getComputedStyle(el),
      marginLeft = (pattern.exec(style.marginLeft) === null) ? '0px' : style.marginLeft,
      marginRight = (pattern.exec(style.marginRight) === null) ? '0px' : style.marginRight;

  width += parseInt(Length.toPx(el, marginLeft)) + parseInt(Length.toPx(el, marginRight));
  return width;
}

gn.getOuterHeight = function (el) {
  var pattern = /\d/, // check if value contains digital number
      height = el.offsetHeight,
      style = el.currentStyle || getComputedStyle(el),
      marginTop = (pattern.exec(style.marginTop) === null) ? '0px' : style.marginTop,
      marginBottom = (pattern.exec(style.marginBottom) === null) ? '0px' : style.marginBottom;

  height += parseInt(Length.toPx(el, marginTop)) + parseInt(Length.toPx(el, marginBottom));
  return height;
}

// 2. offset size: content + padding + border //
//    el.offsetWidth  
//    el.offsetHeight

// 3. client size: content + padding
//    el.clientWidth  
//    el.clientHeight

// *** indexOf *** //
gn.indexOf = function (array, item) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] === item)
      return i;
  }
  return -1;
}

// *** getClosest *** //
gn.getClosest = function (elem, selector) {

  var firstChar = selector.charAt(0);

  // Get closest match
  for ( ; elem && elem !== document; elem = elem.parentNode ) {

    // If selector is a class
    if ( firstChar === '.' ) {
      if ( elem.classList.contains( selector.substr(1) ) ) {
        return elem;
      }
    }

    // If selector is an ID
    if ( firstChar === '#' ) {
      if ( elem.id === selector.substr(1) ) {
        return elem;
      }
    } 

    // If selector is a data attribute
    if ( firstChar === '[' ) {
      if ( elem.hasAttribute( selector.substr(1, selector.length - 2) ) ) {
        return elem;
      }
    }

    // If selector is a tag
    if ( elem.tagName.toLowerCase() === selector ) {
      return elem;
    }

  }

  return false;

};

// var elem = document.querySelector('#some-element');
// var closest = getClosest(elem, '.some-class');
// var closestLink = getClosest(elem, 'a');
// var closestExcludingElement = getClosest(elem.parentNode, '.some-class');


// *** getParents *** //
gn.getParents = function (elem, selector) {

  var parents = [];
  if ( selector ) {
    var firstChar = selector.charAt(0);
  }

  // Get matches
  for ( ; elem && elem !== document; elem = elem.parentNode ) {
    if ( selector ) {

      // If selector is a class
      if ( firstChar === '.' ) {
        if ( elem.classList.contains( selector.substr(1) ) ) {
          parents.push( elem );
        }
      }

      // If selector is an ID
      if ( firstChar === '#' ) {
        if ( elem.id === selector.substr(1) ) {
          parents.push( elem );
        }
      }

      // If selector is a data attribute
      if ( firstChar === '[' ) {
        if ( elem.hasAttribute( selector.substr(1, selector.length - 1) ) ) {
          parents.push( elem );
        }
      }

      // If selector is a tag
      if ( elem.tagName.toLowerCase() === selector ) {
        parents.push( elem );
      }

    } else {
      parents.push( elem );
    }

  }

  // Return parents if any exist
  if ( parents.length === 0 ) {
    return null;
  } else {
    return parents;
  }

};

// var elem = document.querySelector('#some-element');
// var parents = getParents(elem, '.some-class');
// var allParents = getParents(elem.parentNode);


// *** getParentsUntil *** //
gn.getParentsUntil = function (elem, parent, selector) {

  var parents = [];
  if ( parent ) {
    var parentType = parent.charAt(0);
  }
  if ( selector ) {
    var selectorType = selector.charAt(0);
  }

    // Get matches
    for ( ; elem && elem !== document; elem = elem.parentNode ) {

        // Check if parent has been reached
        if ( parent ) {

        // If parent is a class
        if ( parentType === '.' ) {
          if ( elem.classList.contains( parent.substr(1) ) ) {
            break;
          }
        }

        // If parent is an ID
        if ( parentType === '#' ) {
          if ( elem.id === parent.substr(1) ) {
            break;
          }
        }

        // If parent is a data attribute
        if ( parentType === '[' ) {
          if ( elem.hasAttribute( parent.substr(1, parent.length - 1) ) ) {
            break;
          }
        }

        // If parent is a tag
        if ( elem.tagName.toLowerCase() === parent ) {
          break;
        }

      }

      if ( selector ) {

        // If selector is a class
        if ( selectorType === '.' ) {
          if ( elem.classList.contains( selector.substr(1) ) ) {
            parents.push( elem );
          }
        }

        // If selector is an ID
        if ( selectorType === '#' ) {
          if ( elem.id === selector.substr(1) ) {
            parents.push( elem );
          }
        }

        // If selector is a data attribute
        if ( selectorType === '[' ) {
          if ( elem.hasAttribute( selector.substr(1, selector.length - 1) ) ) {
            parents.push( elem );
          }
        }

        // If selector is a tag
        if ( elem.tagName.toLowerCase() === selector ) {
          parents.push( elem );
        }

      } else {
        parents.push( elem );
      }

    }

    // Return parents if any exist
    if ( parents.length === 0 ) {
      return null;
    } else {
      return parents;
    }

};

// Examples
// var elem = document.querySelector('#some-element');
// var parentsUntil = getParentsUntil(elem, '.some-class');
// var parentsUntilByFilter = getParentsUntil(elem, '.some-class', '[data-something]');
// var allParentsUntil = getParentsUntil(elem);
// var allParentsExcludingElem = getParentsUntil(elem.parentNode);



// *** getSiblings *** //
gn.getSiblings = function (elem) {
  var siblings = [];
  var sibling = elem.parentNode.firstChild;
  for ( ; sibling; sibling = sibling.nextSibling ) {
    if ( sibling.nodeType === 1 && sibling !== elem ) {
      siblings.push( sibling );
    }
  }
  return siblings;
};

// var elem = document.querySelector('#some-element');
// var siblings = getSiblings(elem);




/** isNodeList **/
gn.isNodeList = function (el) {
  // Only NodeList has the "item()" function
  return typeof el.item !== 'undefined'; 
};


/** createElement **/
gn.createElement = function(obj) {
  if (!obj || !obj.tagName) {
    throw { message : "Invalid argument" };
  }

  var el = document.createElement(obj.tagName);
  obj.id && (el.id = obj.id);
  obj.className && (el.className = obj.className);
  obj.html && (el.innerHTML = obj.html);
  
  if (typeof obj.attributes !== "undefined") {
    var attr = obj.attributes,
      prop;

    for (prop in attr) {
      if (attr.hasOwnProperty(prop)) {
        el.setAttribute(prop, attr[prop]);
      }
    }
  }

  if (typeof obj.children !== "undefined") {
    var child, i = 0;

    while (child = obj.children[i++]) {
      el.appendChild(createElement(child));
    }
  }

  return el;
};

// var el = gn.createElement({
//  tagName: 'div',
//  id: 'foo',
//  className: 'foo',
//  children: [{
//    tagName: 'div',
//    html: '<b>Hello, creatElement</b>',
//    attributes: {
//      'am-button': 'primary'
//    }
//  }]
// });

// *** append *** //
gn.append = function(els, data) {
  var els_new = (gn.isNodeList(els)) ? els : [els];

  if (typeof data.nodeType !== "undefined" && data.nodeType === 1) {
    for (var i = els_new.length; i--;) {
      els_new[i].appendChild(data);
    }
  } else if (typeof data === "string") {
    for (var i = els_new.length; i--;) {
      els_new[i].insertAdjacentHTML('beforeend', data);
    }
  } else if (gn.isNodeList(data)) {
    var fragment = document.createDocumentFragment();
    for (var i = data.length; i--;) {
      fragment.insertBefore(data[i], fragment.firstChild);
    }
    for (var j = els_new.length; j--;) {
      els_new[j].appendChild(fragment);
    }
  }
};



// *** prepend *** //
gn.prepend = function(els, data) {
  var els_new = (gn.isNodeList(els)) ? els : [els];

  if (typeof data.nodeType !== "undefined" && data.nodeType === 1) {
    for (var i = els_new.length; i--;) {
      els_new[i].insertBefore(data, els_new[i].firstChild);
    }
  } else if (typeof data === "string") {
    for (var i = els_new.length; i--;) {
      els_new[i].insertAdjacentHTML('afterbegin', data);
    }
  } else if (gn.isNodeList(data)) {
    var fragment = document.createDocumentFragment();
    for (var i = data.length; i--;) {
      fragment.insertBefore(data[i], fragment.firstChild);
    }
    for (var j = els_new.length; j--;) {
      els_new[j].insertBefore(fragment, els_new[j].firstChild);
    }
  }
};

/** wrap **/
gn.wrap = function (els, obj) {
    var elsNew = (gn.isNodeList(els)) ? els : [els];
  // Loops backwards to prevent having to clone the wrapper on the
  // first element (see `wrapper` below).
  for (var i = elsNew.length; i--;) {
      var wrapper = (i > 0) ? obj.cloneNode(true) : obj,
          el = elsNew[i];

      // Cache the current parent and sibling.
      var parent = el.parentNode,
          sibling = el.nextSibling;

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
};



/** wrapAll **/
gn.wrapAll = function (els, wrapper) {
  // Cache the current parent and sibling of the first element.
  var el = els.length ? els[0] : els,
      parent  = el.parentNode,
      sibling = el.nextSibling;

  // Wrap all elements (if applicable). Each element is
  // automatically removed from its current parent and from the elms
  // array.
  for (var i = 0; i < els.length; i++) {
    wrapper.appendChild(els[i]);
  }
  
  // If the first element had a sibling, insert the wrapper before the
  // sibling to maintain the HTML structure; otherwise, just append it
  // to the parent.
  if (sibling !== els[1]) {
    parent.insertBefore(wrapper, sibling);
  } else {
    parent.appendChild(wrapper);
  }
};



/** unwrap **/
gn.unwrap = function (els) {
  var elsNew = (gn.isNodeList(els)) ? els : [els];
  for (var i = elsNew.length; i--;) {
    var el = elsNew[i];

    // get the element's parent node
    var parent = el.parentNode;
    
    // move all children out of the element
    while (el.firstChild) { 
      parent.insertBefore(el.firstChild, el); 
    }
    
    // remove the empty element
    parent.removeChild(el);
  }
}

/**
  * go-native
  *
  * @author William Lin
  * @license The MIT License (MIT)
  * https://github.com/ganlanyuan/go-native
  */
  
// @codekit-prepend "../bower_components/fix-ie/src/remove.js";
// @codekit-prepend "../bower_components/fix-ie/src/token-list.js";
// @codekit-prepend "../bower_components/fix-ie/src/version-flags.js";
// @codekit-prepend "../bower_components/fix-ie/src/es5-methods.js";
// @codekit-prepend "../bower_components/requestAnimationFrame/requestAnimationFrame.js";
// @codekit-prepend "../bower_components/Units/Length.js";
// @codekit-prepend "components/gn.js";
// @codekit-prepend "components/optimizedResize.js";
// @codekit-prepend "components/DOM.ready.js";
// @codekit-prepend "components/extend.js";
// @codekit-prepend "components/isInViewport.js";
// @codekit-prepend "components/getSupportedProp.js";
// @codekit-prepend "components/getElementOffset.js";
// @codekit-prepend "components/getElementSize.js";
// @codekit-prepend "components/indexOf.js";
// @codekit-prepend "components/getClosest.js";
// @codekit-prepend "components/getParents.js";
// @codekit-prepend "components/getParentsUntil.js";
// @codekit-prepend "components/getSiblings.js";
// @codekit-prepend "components/isNodeList.js";
// @codekit-prepend "components/createElement.js";
// @codekit-prepend "components/append.js";
// @codekit-prepend "components/prepend.js";
// @codekit-prepend "components/wrap.js";
// @codekit-prepend "components/wrapAll.js";
// @codekit-prepend "components/unwrap.js";

/* not includeed */
// codekit-prepend "../bower_components/fix-ie/src/IE8-addEventListener.js";
// codekit-prepend "../bower_components/es5-shim/es5-shim.js";


