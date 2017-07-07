var tns = (function (){
// ChildNode.remove
(function () {
  "use strict";

  if(!("remove" in Element.prototype)){
    Element.prototype.remove = function(){
      if(this.parentNode) {
        this.parentNode.removeChild(this);
      }
    };
  }
})();

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

/** DOMTokenList polyfill */
(function(){
	"use strict";
	
	/*<*/
	var UNDEF,
	WIN   = window,
	DOC   = document,
	OBJ   = Object,
	NULL  = null,
	TRUE  = true,
	FALSE = false,
	/*>*/
	
	/** Munge the hell out of our string literals. Saves a tonne of space after compression. */
	SPACE           = " ",
	ELEMENT         = "Element",
	CREATE_ELEMENT  = "create"+ELEMENT,
	DOM_TOKEN_LIST  = "DOMTokenList",
	DEFINE_GETTER   = "__defineGetter__",
	DEFINE_PROPERTY = "defineProperty",
	CLASS_          = "class",
	LIST            = "List",
	CLASS_LIST      = CLASS_+LIST,
	REL             = "rel",
	REL_LIST        = REL+LIST,
	DIV             = "div",
	LENGTH          = "length",
	CONTAINS        = "contains",
	APPLY           = "apply",
	HTML_           = "HTML",
	METHODS         = ("item "+CONTAINS+" add remove toggle toString toLocaleString").split(SPACE),
	ADD             = METHODS[2],
	REMOVE          = METHODS[3],
	TOGGLE          = METHODS[4],
	PROTOTYPE       = "prototype",
	
	
	
	/** Ascertain browser support for Object.defineProperty */
	dpSupport       = DEFINE_PROPERTY in OBJ || DEFINE_GETTER in OBJ[ PROTOTYPE ] || NULL,
	
	
	/** Wrapper for Object.defineProperty that falls back to using the legacy __defineGetter__ method if available. */
	defineGetter    = function(object, name, fn, configurable){
		if(OBJ[ DEFINE_PROPERTY ])
			OBJ[ DEFINE_PROPERTY ](object, name, {
				configurable: FALSE === dpSupport ? TRUE : !!configurable,
				get:          fn
			});
		
		else object[ DEFINE_GETTER ](name, fn);
	},
	
	
	
	
	/** DOMTokenList interface replacement */
	DOMTokenList = function(el, prop){
		var THIS    = this,
		
		/** Private variables */
		tokens      = [],
		tokenMap    = {},
		length      = 0,
		maxLength   = 0,
		
		
		reindex     = function(){
			
			/** Define getter functions for array-like access to the tokenList's contents. */
			if(length >= maxLength)
				for(; maxLength < length; ++maxLength) (function(i){
					
					defineGetter(THIS, i, function(){
						preop();
						return tokens[i];
					}, FALSE);
					
				})(maxLength);
		},
		
		
		
		/** Helper function called at the start of each class method. Internal use only. */
		preop = function(){
			var error, i,
			args    = arguments,
			rSpace  = /\s+/;
			
			/** Validate the token/s passed to an instance method, if any. */
			if(args[ LENGTH ])
				for(i = 0; i < args[ LENGTH ]; ++i)
					if(rSpace.test(args[i])){
						error       = new SyntaxError('String "' + args[i] + '" ' + CONTAINS + ' an invalid character');
						error.code  = 5;
						error.name  = "InvalidCharacterError";
						throw error;
					}
			
			
			/** Split the new value apart by whitespace*/
			tokens = ("" + el[prop]).replace(/^\s+|\s+$/g, "").split(rSpace);
			
			/** Avoid treating blank strings as single-item token lists */
			if("" === tokens[0]) tokens = [];
			
			/** Repopulate the internal token lists */
			tokenMap = {};
			for(i = 0; i < tokens[ LENGTH ]; ++i)
				tokenMap[tokens[i]] = TRUE;
			length = tokens[ LENGTH ];
			reindex();
		};
		
		
		
		/** Populate our internal token list if the targeted attribute of the subject element isn't empty. */
		preop();
		
		
		
		/** Return the number of tokens in the underlying string. Read-only. */
		defineGetter(THIS, LENGTH, function(){
			preop();
			return length;
		});
		
		
		/** Override the default toString/toLocaleString methods to return a space-delimited list of tokens when typecast. */
		THIS[ METHODS[6] /** toLocaleString */ ] =
		THIS[ METHODS[5] /** toString       */ ] = function(){
			preop();
			return tokens.join(SPACE);
		};
		
		
		
		/** Return an item in the list by its index (or undefined if the number is greater than or equal to the length of the list) */
		THIS.item = function(idx){
			preop();
			return tokens[idx];
		};
		
		
		/** Return TRUE if the underlying string contains `token`; otherwise, FALSE. */
		THIS[ CONTAINS ] = function(token){
			preop();
			return !!tokenMap[token];
		};
		
		
		
		/** Add one or more tokens to the underlying string. */
		THIS[ADD] = function(){
			preop[APPLY](THIS, args = arguments);

			for(var args, token, i = 0, l = args[ LENGTH ]; i < l; ++i){
				token = args[i];
				if(!tokenMap[token]){
					tokens.push(token);
					tokenMap[token] = TRUE;
				}
			}
			
			/** Update the targeted attribute of the attached element if the token list's changed. */
			if(length  !== tokens[ LENGTH ]){
				length   = tokens[ LENGTH ] >>> 0;
				el[prop] = tokens.join(SPACE);
				reindex();
			}
		};
		
		
		
		/** Remove one or more tokens from the underlying string. */
		THIS[ REMOVE ] = function(){
			preop[APPLY](THIS, args = arguments);
			
			/** Build a hash of token names to compare against when recollecting our token list. */
			for(var args, ignore = {}, i = 0, t = []; i < args[ LENGTH ]; ++i){
				ignore[args[i]] = TRUE;
				delete tokenMap[args[i]];
			}
			
			/** Run through our tokens list and reassign only those that aren't defined in the hash declared above. */
			for(i = 0; i < tokens[ LENGTH ]; ++i)
				if(!ignore[tokens[i]]) t.push(tokens[i]);
			
			tokens   = t;
			length   = t[ LENGTH ] >>> 0;
			
			/** Update the targeted attribute of the attached element. */
			el[prop] = tokens.join(SPACE);
			reindex();
		};
		
		
		
		/** Add or remove a token depending on whether it's already contained within the token list. */
		THIS[TOGGLE] = function(token, force){
			preop[APPLY](THIS, [token]);
			
			/** Token state's being forced. */
			if(UNDEF !== force){
				if(force) { THIS[ADD](token);     return TRUE;  }
				else      { THIS[REMOVE](token);  return FALSE; }
			}
			
			/** Token already exists in tokenList. Remove it, and return FALSE. */
			if(tokenMap[token]){
				THIS[ REMOVE ](token);
				return FALSE;
			}
			
			/** Otherwise, add the token and return TRUE. */
			THIS[ADD](token);
			return TRUE;
		};
		
		
		/** Mark our newly-assigned methods as non-enumerable. */
		(function(o, defineProperty){
			if(defineProperty)
				for(var i = 0; i < 7; ++i)
					defineProperty(o, METHODS[i], {enumerable: FALSE});
		}(THIS, OBJ[ DEFINE_PROPERTY ]));
		
		return THIS;
	},
	
	
	
	/** Polyfills a property with a DOMTokenList */
	addProp = function(o, name, attr){
		
		defineGetter(o[PROTOTYPE], name, function(){
			var tokenList,
			THIS = this,
			
			/** Prevent this from firing twice for some reason. What the hell, IE. */
			gibberishProperty           = DEFINE_GETTER + DEFINE_PROPERTY + name;
			if(THIS[gibberishProperty]) return tokenList;
			THIS[gibberishProperty]     = TRUE;
			
			
			/**
			 * IE8 can't define properties on native JavaScript objects, so we'll use a dumb hack instead.
			 *
			 * What this is doing is creating a dummy element ("reflection") inside a detached phantom node ("mirror")
			 * that serves as the target of Object.defineProperty instead. While we could simply use the subject HTML
			 * element instead, this would conflict with element types which use indexed properties (such as forms and
			 * select lists).
			 */
			if(FALSE === dpSupport){
				
				var visage,
				mirror      = addProp.mirror = addProp.mirror || DOC[ CREATE_ELEMENT ](DIV),
				reflections = mirror.childNodes,
				
				/** Iterator variables */
				l = reflections[ LENGTH ],
				i = 0;
				
				for(; i < l; ++i)
					if(reflections[i]._R === THIS){
						visage = reflections[i];
						break;
					}
				
				/** Couldn't find an element's reflection inside the mirror. Materialise one. */
				visage || (visage = mirror.appendChild(DOC[ CREATE_ELEMENT ](DIV)));
				
				tokenList = DOMTokenList.call(visage, THIS, attr);
			}
			
			else tokenList = new DOMTokenList(THIS, attr);
			
			
			defineGetter(THIS, name, function(){ return tokenList; });
			delete THIS[gibberishProperty];
			
			return tokenList;
		}, TRUE);
	},

	/** Variables used for patching native methods that're partially implemented (IE doesn't support adding/removing multiple tokens, for instance). */
	testList,
	nativeAdd,
	nativeRemove;
	
	
	
	
	/** No discernible DOMTokenList support whatsoever. Time to remedy that. */
	if(!WIN[ DOM_TOKEN_LIST ]){
		
		/** Ensure the browser allows Object.defineProperty to be used on native JavaScript objects. */
		if(dpSupport)
			try{ defineGetter({}, "support"); }
			catch(e){ dpSupport = FALSE; }
		
		
		DOMTokenList.polyfill   = TRUE;
		WIN[ DOM_TOKEN_LIST ]   = DOMTokenList;
		
		addProp( WIN[ ELEMENT ], CLASS_LIST, CLASS_ + "Name");      /* Element.classList */
		addProp( WIN[ HTML_+ "Link"   + ELEMENT ], REL_LIST, REL);  /* HTMLLinkElement.relList */
		addProp( WIN[ HTML_+ "Anchor" + ELEMENT ], REL_LIST, REL);  /* HTMLAnchorElement.relList */
		addProp( WIN[ HTML_+ "Area"   + ELEMENT ], REL_LIST, REL);  /* HTMLAreaElement.relList */
	}
	
	
	/**
	 * Possible support, but let's check for bugs.
	 *
	 * Where arbitrary values are needed for performing a test, previous variables
	 * are recycled to save space in the minified file.
	 */
	else{
		testList = DOC[ CREATE_ELEMENT ](DIV)[CLASS_LIST];
		
		/** We'll replace a "string constant" to hold a reference to DOMTokenList.prototype (filesize optimisation, yaddah-yaddah...) */
		PROTOTYPE = WIN[DOM_TOKEN_LIST][PROTOTYPE];
		
		
		/** Check if we can pass multiple arguments to add/remove. To save space, we'll just recycle a previous array of strings. */
		testList[ADD][APPLY](testList, METHODS);
		if(2 > testList[LENGTH]){
			nativeAdd      = PROTOTYPE[ADD];
			nativeRemove   = PROTOTYPE[REMOVE];
			
			PROTOTYPE[ADD] = function(){
				for(var i = 0, args = arguments; i < args[LENGTH]; ++i)
					nativeAdd.call(this, args[i]);
			};
			
			PROTOTYPE[REMOVE] = function(){
				for(var i = 0, args = arguments; i < args[LENGTH]; ++i)
					nativeRemove.call(this, args[i]);
			};
		}
		
		
		/** Check if the "force" option of .toggle is supported. */
		if(testList[TOGGLE](LIST, FALSE))
			PROTOTYPE[TOGGLE] = function(token, force){
				var THIS = this;
				THIS[(force = UNDEF === force ? !THIS[CONTAINS](token) : force) ? ADD : REMOVE](token);
				return !!force;
			};
	}
}());

function extend() {
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

function indexOf(array, item) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] === item) { return i; }
  }
  return -1;
}

function isNodeList(el) {
  // Only NodeList has the "item()" function
  return typeof el.item !== "undefined"; 
}

function append(els, data) {
  var els_new = (isNodeList(els)) ? els : [els], i;

  if (typeof data.nodeType !== "undefined" && data.nodeType === 1) {
    for (i = els_new.length; i--;) {
      els_new[i].appendChild(data);
    }
  } else if (typeof data === "string") {
    for (i = els_new.length; i--;) {
      els_new[i].insertAdjacentHTML("beforeend", data);
    }
  } else if (isNodeList(data)) {
    var fragment = document.createDocumentFragment();
    for (i = data.length; i--;) {
      fragment.insertBefore(data[i], fragment.firstChild);
    }
    for (var j = els_new.length; j--;) {
      els_new[j].appendChild(fragment);
    }
  }
}

function wrap(els, obj) {
  var elsNew = (isNodeList(els)) ? els : [els];
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
}

function unwrap(els) {
  var elsNew = (isNodeList(els)) ? els : [els];
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

function getSessionStorage(key, value) {
  if (!sessionStorage.getItem(key)) {
    sessionStorage.setItem(key, value);
  }
  return sessionStorage.getItem(key);
}

function getSlideId() {
  if (window.tnsId === undefined) {
    window.tnsId = 1;
  } else {
    window.tnsId++;
  }
  return 'tns' + window.tnsId;
}

// get css-calc 
// @return - null | calc | -webkit-calc | -moz-calc
// @usage - var calc = getCalc(); 
function calc() {
  var doc = document, 
      body = doc.body,
      el = doc.createElement('div'), 
      result = null;
  body.appendChild(el);
  try {
    var vals = ['calc(10px)', '-moz-calc(10px)', '-webkit-calc(10px)'], val;
    for (var i = 0; i < 3; i++) {
      val = vals[i];
      el.style.width = val;
      if (el.offsetWidth === 10) { 
        result = val.replace('(10px)', ''); 
        break;
      }
    }
  } catch (e) {}
  body.removeChild(el);

  return result;
}

// get subpixel support value
// @return - boolean
function subpixelLayout() {
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

function mediaquerySupport () {
  var doc = document,
      body = doc.body,
      div = doc.createElement('div');

  div.className = 'tns-mq-test';
  body.appendChild(div);

  var position = (window.getComputedStyle) ? window.getComputedStyle(div).position : div.currentStyle['position'];
  body.removeChild(div);

  return position === "absolute";
}

// create and append style sheet
function createStyleSheet (media) {
  // Create the <style> tag
  var style = document.createElement("style");
  // style.setAttribute("type", "text/css");

  // Add a media (and/or media query) here if you'd like!
  // style.setAttribute("media", "screen")
  // style.setAttribute("media", "only screen and (max-width : 1024px)")
  if (media) { style.setAttribute("media", media); }

  // WebKit hack :(
  // style.appendChild(document.createTextNode(""));

  // Add the <style> element to the page
  document.querySelector('head').appendChild(style);

  return (style.sheet) ? style.sheet : style.styleSheet;
}

// cross browsers addRule method
function addCSSRule(sheet, selector, rules, index) {
  if("insertRule" in sheet) {
    sheet.insertRule(selector + "{" + rules + "}", index);
  } else if("addRule" in sheet) {
    sheet.addRule(selector, rules, index);
  }
}

function toDegree (y, x) {
  return Math.atan2(y, x) * (180 / Math.PI);
}

function getTouchDirection(angle, range) {
  if ( Math.abs(90 - Math.abs(angle)) >= (90 - range) ) {
    return 'horizontal';
  } else if ( Math.abs(90 - Math.abs(angle)) <= range ) {
    return 'vertical';
  } else {
    return false;
  }
}

function hasAttr(el, attr) {
  return el.hasAttribute(attr);
}

function getAttr(el, attr) {
  return el.getAttribute(attr);
}

function isNodeList$1(el) {
  // Only NodeList has the "item()" function
  return typeof el.item !== "undefined"; 
}

function setAttrs(els, attrs) {
  els = (isNodeList$1(els) || els instanceof Array) ? els : [els];
  if (Object.prototype.toString.call(attrs) !== '[object Object]') { return; }

  for (var i = els.length; i--;) {
    for(var key in attrs) {
      els[i].setAttribute(key, attrs[key]);
    }
  }
}

function removeAttrs(els, attrs) {
  els = (isNodeList$1(els) || els instanceof Array) ? els : [els];
  attrs = (attrs instanceof Array) ? attrs : [attrs];

  var attrLength = attrs.length;
  for (var i = els.length; i--;) {
    for (var j = attrLength; j--;) {
      els[i].removeAttribute(attrs[j]);
    }
  }
}

function removeEventsByClone(el) {
  var elClone = el.cloneNode(true), parent = el.parentNode;
  parent.insertBefore(elClone, el);
  el.remove();
  el = null;
}

function hideElement(el) {
  if (!hasAttr(el, 'hidden')) {
    setAttrs(el, {'hidden': ''});
  }
}

function showElement(el) {
  if (hasAttr(el, 'hidden')) {
    removeAttrs(el, 'hidden');
  }
}

// check if an image is loaded
// 1. See if "naturalWidth" and "naturalHeight" properties are available.
// 2. See if "complete" property is available.

function imageLoaded(img) {
  if (typeof img.complete === 'boolean') {
    return img.complete;
  } else if (typeof img.naturalWidth === 'number') {
    return img.naturalWidth !== 0;
  }
}

function whichProperty(props){
  var el = document.createElement('fakeelement'),
      len = props.length;
  for(var i = 0; i < props.length; i++){
    prop = props[i];
    if( el.style[prop] !== undefined ){ return prop; }
  }

  return false; // explicit for ie9-
}

// get transitionend, animationend based on transitionDuration
// @propin: string
// @propOut: string, first-letter uppercase
// Usage: getEndProperty('webkitTransitionDuration', 'Transition') => webkitTransitionEnd
function getEndProperty(propIn, propOut) {
  var endProp = false;
  if (/^webkit/.test(propIn)) {
    endProp = 'webkit' + propOut + 'End';
  } else if (/^o/.test(propIn)) {
    endProp = 'o' + propOut + 'End';
  } else if (propIn) {
    endProp = propOut.toLowerCase() + 'end';
  }
  return endProp;
}

// Test via a getter in the options object to see if the passive property is accessed
var supportsPassive = false;
try {
  var opts = Object.defineProperty({}, 'passive', {
    get: function() {
      supportsPassive = true;
    }
  });
  window.addEventListener("test", null, opts);
} catch (e) {}
var passiveOption = supportsPassive ? { passive: true } : false;

function addEvents(el, obj) {
  for (var prop in obj) {
    var option = (prop === 'touchstart' || prop === 'touchmove') ? passiveOption : false;
    el.addEventListener(prop, obj[prop], option);
  }
}

function removeEvents(el, obj) {
  for (var prop in obj) {
    var option = (prop === 'touchstart' || prop === 'touchmove') ? passiveOption : false;
    el.removeEventListener(prop, obj[prop], option);
  }
}

function Events() {
  return {
    topics: {},
    on: function (eventName, fn) {
      this.topics[eventName] = this.topics[eventName] || [];
      this.topics[eventName].push(fn);
    },
    off: function(eventName, fn) {
      if (this.topics[eventName]) {
        for (var i = 0; i < this.topics[eventName].length; i++) {
          if (this.topics[eventName][i] === fn) {
            this.topics[eventName].splice(i, 1);
            break;
          }
        }
      }
    },
    emit: function (eventName, data) {
      if (this.topics[eventName]) {
        this.topics[eventName].forEach(function(fn) {
          fn(data);
        });
      }
    }
  };
}

function jsTransform(element, attr, prefix, postfix, to, duration, callback) {
  var tick = Math.min(duration, 10),
      unit = (to.indexOf('%') >= 0) ? '%' : 'px',
      to = to.replace(unit, ''),
      from = Number(element.style[attr].replace(prefix, '').replace(postfix, '').replace(unit, '')),
      positionTick = (to - from) / duration * tick,
      running;

  setTimeout(moveElement, tick);
  function moveElement() {
    duration -= tick;
    from += positionTick;
    element.style[attr] = prefix + from + unit + postfix;
    if (duration > 0) { 
      setTimeout(moveElement, tick); 
    } else {
      callback();
    }
  }
}

// PRODUCTION

// from go-native
// helper functions
var doc = document;
var KEYS = {
      ENTER: 13,
      SPACE: 32,
      PAGEUP: 33,
      PAGEDOWN: 34,
      END: 35,
      HOME: 36,
      LEFT: 37,
      UP: 38,
      RIGHT: 39,
      DOWN: 40
    };
var CALC = getSessionStorage('tnsCalc', calc());
var SUBPIXEL = JSON.parse(getSessionStorage('tnsSubpixel', subpixelLayout()));
var CSSMQ = JSON.parse(getSessionStorage('tnsCSSMQ', mediaquerySupport()));
var TRANSFORM = getSessionStorage('tnsTransform', whichProperty([
      'transform', 
      'WebkitTransform', 
      'MozTransform', 
      'msTransform', 
      'OTransform'
    ]));
var TRANSITIONDURATION = getSessionStorage('tnsTransitionDuration', whichProperty([
      'transitionDuration', 
      'WebkitTransitionDuration', 
      'MozTransitionDuration', 
      'OTransitionDuration'
    ]));
var TRANSITIONDELAY = getSessionStorage('tnsTransitionDelay', whichProperty([
      'transitionDelay', 
      'WebkitTransitionDelay', 
      'MozTransitionDelay', 
      'OTransitionDelay'
    ]));
var ANIMATIONDURATION = getSessionStorage('tnsAnimationDuration', whichProperty([
      'animationDuration', 
      'WebkitAnimationDuration', 
      'MozAnimationDuration', 
      'OAnimationDuration'
    ]));
var ANIMATIONDELAY = getSessionStorage('tnsAnimationDelay', whichProperty([
      'animationDelay', 
      'WebkitAnimationDelay', 
      'MozAnimationDelay', 
      'OAnimationDelay'
    ]));
var TRANSITIONEND = getSessionStorage('tnsTransitionEnd', getEndProperty(TRANSITIONDURATION, 'Transition'));
var ANIMATIONEND = getSessionStorage('tnsAnimationEnd', getEndProperty(ANIMATIONDURATION, 'Animation'));

var tns = function(options) {
  options = extend({
    container: doc.querySelector('.slider'),
    mode: 'carousel',
    axis: 'horizontal',
    items: 1,
    gutter: 0,
    edgePadding: 0,
    fixedWidth: false,
    slideBy: 1,
    controls: true,
    controlsText: ['prev', 'next'],
    controlsContainer: false,
    nav: true,
    navContainer: false,
    arrowKeys: false,
    speed: 300,
    autoplay: false,
    autoplayTimeout: 5000,
    autoplayDirection: 'forward',
    autoplayText: ['start', 'stop'],
    autoplayHoverPause: false,
    autoplayButton: false,
    autoplayResetOnVisibility: true,
    animateIn: 'tns-fadeIn',
    animateOut: 'tns-fadeOut',
    animateNormal: 'tns-normal',
    animateDelay: false,
    loop: true,
    rewind: false,
    autoHeight: false,
    responsive: false,
    lazyload: false,
    touch: true,
    mouseDrag: false,
    nested: false,
    onInit: false
  }, options || {});
  // make sure slide container exists
  if (typeof options.container !== 'object' || options.container === null) { return; }

  // === define and set variables ===
  if (options.mode === 'gallery') {
    options.axis = 'horizontal';
    options.edgePadding = false;
    options.loop = true;
    options.autoHeight = true;
    options.slideBy = 'page';

    var animateIn = 'tns-fadeIn',
        animateOut = 'tns-fadeOut',
        animateNormal = 'tns-normal',
        animateDelay = false;

    if (ANIMATIONDURATION) {
      animateIn = options.animateIn;
      animateOut = options.animateOut;
      animateNormal = options.animateNormal;
      animateDelay = options.animateDelay;
    }
  }

  var carousel = (options.mode === 'carousel') ? true : false,
      horizontal = (options.axis === 'horizontal') ? true : false,
      wrapper = doc.createElement('div'),
      contentWrapper = doc.createElement('div'),
      container = options.container,
      slideItems = container.children,
      slideCount = slideItems.length,
      items = options.items,
      slideBy = (options.slideBy === 'page') ? items : options.slideBy,
      nested = options.nested,
      gutter = options.gutter,
      edgePadding = options.edgePadding,
      fixedWidth = options.fixedWidth,
      arrowKeys = options.arrowKeys,
      speed = options.speed,
      rewind = options.rewind,
      loop = (options.rewind)? false : options.loop,
      autoHeight = options.autoHeight,
      responsive = (fixedWidth) ? false : options.responsive,
      breakpoints = (responsive) ? Object.keys(responsive).sort(function (a, b) { return a - b; }) : false,
      sheet = createStyleSheet(),
      lazyload = options.lazyload,
      slideId = container.id || getSlideId(),
      slideOffsetTops, // collection of slide offset tops
      slideItemsOut = [],
      cloneCount = (loop) ? slideCount * 2 : (edgePadding) ? 1 : 0,
      slideCountNew = (!carousel) ? slideCount + cloneCount : slideCount + cloneCount * 2,
      hasRightDeadZone = (fixedWidth && !loop && !edgePadding)? true : false,
      checkIndexBeforeTransform = (!carousel || !loop)? true : false,
      // transform
      transformAttr = (horizontal)? 'left' : 'top',
      transformPrefix = '',
      transformPostfix = '',
      // index
      index = (!carousel) ? 0 : cloneCount,
      indexCached = index,
      indexAdjust = (edgePadding) ? 1 : 0,
      indexMin = indexAdjust,
      indexMax = slideCountNew - items - indexAdjust,
      // resize
      vw,
      resizeTimer,
      touchedOrDraged,
      running = false,
      onInit = options.onInit,
      events = new Events();

  // controls
  if (options.controls) {
    var controls = options.controls,
        controlsText = options.controlsText,
        controlsContainer = (!options.controlsContainer) ? false : options.controlsContainer,
        prevButton,
        nextButton;
  }

  // nav
  if (options.nav) {
    var nav = options.nav,
        navContainer = options.navContainer || false,
        navItems,
        navCountVisible = (options.navContainer) ? slideCount : Math.ceil(slideCount / items),
        navCountVisibleCached = slideCount,
        visibleNavIndexes = [],
        visibleNavIndexesCached = visibleNavIndexes,
        navClicked = -1,
        navCurrent = 0,
        navCurrentCached = 0;
  }

  // autoplay
  if (options.autoplay) {
    var autoplay = options.autoplay,
        autoplayTimeout = options.autoplayTimeout,
        autoplayDirection = (options.autoplayDirection === 'forward') ? 1 : -1,
        autoplayText = options.autoplayText,
        autoplayHoverPause = options.autoplayHoverPause,
        autoplayTimer,
        autoplayButton = options.autoplayButton,
        animating = false,
        autoplayHoverStopped = false,
        autoplayHtmlString = '<span hidden>Stop Animation</span>',
        autoplayResetOnVisibility = options.autoplayResetOnVisibility,
        autoplayResetVisibilityState = false;
  }

  // touch
  if (options.touch) {
    var touch = options.touch,
        startX = null,
        startY = null,
        translateInit,
        disX,
        disY;
  }

  //mouse
  if (options.mouseDrag) {
    var mouseDrag = options.mouseDrag,
        mousePressed = false,
        isDragEvent = false;
  }

  if (TRANSFORM) {
    transformAttr = TRANSFORM;
    transformPrefix = 'translate';
    transformPrefix += (horizontal)? 'X(' : 'Y(';
    transformPostfix = ')';
  }

  // === COMMON FUNCTIONS === //
  var getItems = (function () {
    if (fixedWidth) {
      return function () { return Math.max(1, Math.min(slideCount, Math.floor(vw / fixedWidth))); };
    } else {
      return function () {
        var itemsTem;
        if (!vw) { vw = getViewWidth(); }
        breakpoints.forEach(function (key) {
          if (vw >= key) { itemsTem = responsive[key]; }
        });
        return Math.max(1, Math.min(slideCount, itemsTem));
      };
    }
  })();

  var getViewWidth = (function () {
    // horizontal carousel: fluid width && edge padding
    //  => inner wrapper view width
    if (horizontal && !fixedWidth && edgePadding) { 
      return function () { return wrapper.clientWidth - (edgePadding + gutter) * 2; };
    // horizontal carousel: fixed width || fluid width but no edge padding
    // vertical carousel
    //  => wrapper view width
    } else {
      return function () { return wrapper.clientWidth; };
    }
  })();

  // compare slide count & items
  // (items) => nav, controls, autoplay
  function checkSlideCount() {
    // a. slide count < items
    //  => disable nav, controls, autoplay
    if (slideCount <= items) { 
      arrowKeys = false;

      var indexTem;
      index = (!carousel) ? 0 : cloneCount;
      if (index !== indexTem) { events.emit('indexChanged', info()); }

      if (navContainer) { hideElement(navContainer); }
      if (controlsContainer) { hideElement(controlsContainer); }
      if (autoplayButton) { hideElement(autoplayButton); }
    // b. slide count > items
    //  => enable nav, controls, autoplay
    } else {
      arrowKeys = options.arrowKeys;
      if (nav) { showElement(navContainer); }
      if (controls) { showElement(controlsContainer); }
      if (autoplay) { showElement(autoplayButton); }
    }
  }

  events.on('itemsChanged', function () {
    indexMax = slideCountNew - items - indexAdjust;
    if (options.slideBy === 'page') { slideBy = items; }
    if (nav && !options.navContainer) { navCountVisible = Math.ceil(slideCount / items); }
  });

  (function sliderInit() {
    // First thing first, wrap container with "wrapper > contentWrapper",
    // to get the correct view width
    wrap(container, contentWrapper);
    wrap(contentWrapper, wrapper);
    vw = getViewWidth();

    var dataTns = (horizontal)? 'tns-outer tns-hdx' : 'tns-outer';
    wrapper.className = dataTns;

    dataTns = (!horizontal) ? 'tns-inner tns-hdy' : 'tns-inner';
    contentWrapper.className = dataTns;

    // set container properties
    if (container.id === '') { container.id = slideId; }
    dataTns = ' tns-slider tns-' + options.mode + ' tns-' + options.axis;
    dataTns += (SUBPIXEL) ? ' tns-subpixel' : ' tns-no-subpixel';
    dataTns += (CALC) ? ' tns-calc' : ' tns-no-calc';
    if (carousel && autoHeight) { dataTns += ' tns-hdy'; }
    container.className += dataTns;

    // set edge padding on content wrapper
    if (edgePadding) {
      if (fixedWidth) {
        updateFixedWidthEdgePadding();
      } else {
        var gap1 = edgePadding + gutter,
            gap2 = edgePadding;

        contentWrapper.style.cssText += (horizontal) ?
            'margin: 0 ' + gap2 + 'px 0 ' + gap1 + 'px' :
            'padding: ' + gap1 + 'px 0 ' + gap2 + 'px 0';
      }
    }

    // slideItems: add id, class, properties
    for (var x = 0; x < slideCount; x++) {
      var item = slideItems[x];
      item.id = slideId + '-item' + x;
      if (!carousel && animateNormal) { item.classList.add(animateNormal); }
      setAttrs(item, {
        'aria-hidden': 'true',
        'tabindex': '-1'
      });
      if (!SUBPIXEL && horizontal) {
        var marginLeft = (CALC) ? CALC + '(' + i * 100 + '% / ' + slideCountNew + ')' : i * 100 / slideCountNew + "%";
        slideItems[i].style.marginLeft = marginLeft;
      }

    }

    // clone slides
    if (loop || edgePadding) {
      var fragmentBefore = doc.createDocumentFragment(), 
          fragmentAfter = doc.createDocumentFragment();

      for (var j = cloneCount; j--;) {
        var num = j%slideCount,
            cloneFirst = slideItems[num].cloneNode(true);
        removeAttrs(cloneFirst, 'id');
        fragmentAfter.insertBefore(cloneFirst, fragmentAfter.firstChild);

        if (carousel) {
          var cloneLast = slideItems[slideCount - 1 - num].cloneNode(true);
          removeAttrs(cloneLast, 'id');
          fragmentBefore.appendChild(cloneLast);
        }
      }

      container.insertBefore(fragmentBefore, container.firstChild);
      container.appendChild(fragmentAfter);
      slideItems = container.children;
    }

    // activate slides
    for (var i = index; i < index + items; i++) {
      var item = slideItems[i];
      setAttrs(item, {'aria-hidden': 'false'});
      removeAttrs(item, ['tabindex']);
      if (!carousel) { 
        var leftVal = (CALC)? 
            CALC + '(' + (i - index) * 100 + '% / ' + items + ')' : 
            (i - index) * 100 / items + '%';
        item.style.left = leftVal; 
        item.classList.remove(animateNormal);
        item.classList.add(animateIn);
      }
    }

    // update the items
    if (responsive || fixedWidth) { 
      items = getItems();
      events.emit('itemsChanged');
    }

    // default styles
    // == horizontal slider ==
    if (horizontal) {
      var stringContainerWidth = stringSlideWidth = 'width: ',
          stringContainerFontSize = stringSlideFontSize = stringSlideGutter = '';

      // get container-width, container-translate and slide-width
      if (!carousel) {
        stringContainerWidth += 'auto';
        if (CALC) {
          stringSlideWidth += CALC + '(100% / ' + options.items + ')';
        } else {
          stringSlideWidth += 100 / options.items + '%';
        }
      } else {
        if (fixedWidth) {
            stringContainerWidth += (fixedWidth + gutter) * slideCountNew + 'px';
            stringSlideWidth += fixedWidth + 'px';
        } else {
          if (CSSMQ) {
            stringContainerWidth += (CALC) ? 
                CALC + '(' + slideCountNew * 100 + '% / ' + options.items + ')' : 
                slideCountNew * 100 / options.items + '%';
          } else {
            updateContainerWidthNonMediaquery();
          }

          stringSlideWidth += (CALC) ? 
              CALC + '(100% / ' + slideCountNew + ')' : 
              100 / slideCountNew + '%';
        }
      }
      stringContainerWidth += ';';
      stringSlideWidth += ';';

      // get font-size string, add class, add margin-left
      if (carousel && SUBPIXEL) {
        var cssFontSize = window.getComputedStyle(slideItems[0]).fontSize;
        // em, rem to px (for IE8-)
        if (cssFontSize.indexOf('em') !== -1) { cssFontSize = Number(cssFontSize.replace(/r?em/, '')) * 16 + 'px'; }

        stringContainerFontSize = ' font-size: 0;';
        stringSlideFontSize = ' font-size: ' + cssFontSize + ';';
      }

      // set gutter
      if (gutter) {
        if (!edgePadding) { contentWrapper.style.marginRight = - gutter + 'px';}
        var gutterProperty = (fixedWidth) ? 'margin' : 'padding';
        stringSlideGutter = gutterProperty + '-right: ' + gutter + 'px;';
      }

      addCSSRule(sheet, '#' + slideId, stringContainerWidth + stringContainerFontSize, 0);
      addCSSRule(sheet, '#' + slideId + '> div, #' + slideId + '> li',  stringSlideWidth + stringSlideGutter + stringSlideFontSize, 1);

      // media queries
      if (responsive && CSSMQ) {
        var bpLen = breakpoints.length;
        for (var i = 0; i < bpLen; i++) {
          var bp = breakpoints[i],
              itemsTem = responsive[bp],
              str = (CALC) ? CALC + '(100% * ' + slideCountNew + ' / ' + itemsTem + ')' : 100 * slideCountNew / itemsTem + '%';

          sheet.insertRule('@media (min-width: ' + bp / 16 + 'em) { #' + slideId + '{ width: ' + str + ' }}', sheet.cssRules.length);
        }
      }

    // vertical slider
    } else {
      // set slide gutter
      if (gutter) {
        if (!edgePadding) { contentWrapper.style.marginBottom = - gutter + 'px';}
        addCSSRule(sheet, '#' + slideId + '> div, #' + slideId + '> li', 'margin-bottom: ' + gutter + 'px;', 0);
      }

      getSlideOffsetTops();
      updateContentWrapperHeight();
    }

    // set container transform property
    if (carousel) {
      doContainerTransform();
    }


    // == msInit ==
    // for IE10
    if (navigator.msMaxTouchPoints) {
      wrapper.classList.add('ms-touch');
      addEvents(wrapper, {'scroll': ie10Scroll});
      setSnapInterval();
    }


    // == controlsInit ==
    if (controls) {
      if (options.controlsContainer) {
        prevButton = controlsContainer.children[0];
        nextButton = controlsContainer.children[1];
        setAttrs(controlsContainer, {
          'aria-label': 'Carousel Navigation',
          'tabindex': '0'
        });
        setAttrs(prevButton, {'data-controls' : 'prev'});
        setAttrs(nextButton, {'data-controls' : 'next'});
        setAttrs(controlsContainer.children, {
          'aria-controls': slideId,
          'tabindex': '-1',
        });
      } else {
        append(wrapper, '<div class="tns-controls" aria-label="Carousel Navigation" tabindex="0"><button data-controls="prev" tabindex="-1" aria-controls="' + slideId +'" type="button">' + controlsText[0] + '</button><button data-controls="next" tabindex="-1" aria-controls="' + slideId +'" type="button">' + controlsText[1] + '</button></div>');

        [].forEach.call(wrapper.children, function (el) {
          if (el.classList.contains('tns-controls')) { controlsContainer = el; }
        });
        prevButton = controlsContainer.children[0];
        nextButton = controlsContainer.children[1];
      }

      if (!loop) { prevButton.disabled = true; }
    }


    // == navInit ==
    if (nav) {
      // customized nav
      // will not hide the navs in case they're thumbnails
      if (options.navContainer) {
        setAttrs(navContainer, {'aria-label': 'Carousel Pagination'});
        navItems = navContainer.children;
        [].forEach.call(navItems, function (item, index) {
          setAttrs(item, {
            'data-nav': index,
            'tabindex': '-1',
            'aria-selected': 'false',
            'aria-controls': slideId + '-item' + index,
          });
        });

      // generated nav 
      } else {
        var navHtml = '';
        for (var i = 0; i < slideCount; i++) {
          // hide nav items by default
          navHtml += '<button data-nav="' + i +'" tabindex="-1" aria-selected="false" aria-controls="' + slideId + '-item' + i +'" hidden type="button"></button>';
        }
        navHtml = '<div class="tns-nav" aria-label="Carousel Pagination">' + navHtml + '</div>';
        append(wrapper, navHtml);

        [].forEach.call(wrapper.children, function (el) {
          if (el.classList.contains('tns-nav')) { navContainer = el; }
        });
        navItems = navContainer.children;

        updateNavVisibility();
      }

      setAttrs(navItems[0], {'tabindex': '0', 'aria-selected': 'true'});
    }


    // == autoplayInit ==
    if (autoplay) {
      if (autoplayButton) {
        setAttrs(autoplayButton, {'data-action': 'stop'});
      } else {
        if (!navContainer) {
          append(wrapper, '<div class="tns-nav" aria-label="Carousel Pagination"></div>');
          navContainer = wrapper.querySelector('.tns-nav');
        }

        append(navContainer, '<button data-action="stop" type="button">' + autoplayHtmlString + autoplayText[0] + '</button>');
        autoplayButton = navContainer.querySelector('[data-action]');
      }

      // start autoplay
      startAction();
    }


    // == addSliderEvents ==
    if (carousel) {
      if (TRANSITIONEND) {
        var eve = {};
        eve[TRANSITIONEND] = onTransitionEnd;
        addEvents(container, eve);
      }
      if (touch) {
        addEvents(container, {
          'touchstart': onTouchOrMouseStart,
          'touchmove': onTouchOrMouseMove,
          'touchend': onTouchOrMouseEnd,
          'touchcancel': onTouchOrMouseEnd
        });
      }
      if (mouseDrag) {
        addEvents(container, {
          'mousedown': onTouchOrMouseStart,
          'mousemove': onTouchOrMouseMove,
          'mouseup': onTouchOrMouseEnd,
          'mouseleave': onTouchOrMouseEnd
        });
      }
    }

    if (nav) {
      for (var y = 0; y < slideCount; y++) {
        addEvents(navItems[y],{
          'click': onNavClick,
          'keydown': onNavKeydown
        });
      }
    }

    if (controls) {
      addEvents(controlsContainer, {'keydown': onControlKeydown});
      addEvents(prevButton,{'click': onPrevClick});
      addEvents(nextButton,{'click': onNextClick});
    }

    if (autoplay) {
      addEvents(autoplayButton, {'click': toggleAnimation});
      if (autoplayHoverPause) {
        addEvents(container, {'mouseover': function () {
          if (animating) { 
            stopAction(); 
            autoplayHoverStopped = true;
          }
        }});
        addEvents(container, {'mouseout': function () {
          if (!animating && autoplayHoverStopped) { 
            startAction(); 
            autoplayHoverStopped = false;
          }
        }});
      }

      if (autoplayResetOnVisibility) {
        addEvents(document, {'visibilitychange': onVisibilityChange});
      }
    }

    if (arrowKeys) {
      addEvents(document, {'keydown': onDocumentKeydown});
    }

    if (nested === 'inner') {
      events.on('outerResized', function () {
        resizeTasks();
        events.emit('innerLoaded', info());
      });
    } else {
      addEvents(window, {'resize': onResize});
      if (nested === 'outer') {
        events.on('innerLoaded', runAutoHeight);
      }
    }

    checkSlideCount();

    lazyLoad();
    runAutoHeight();

    if (typeof onInit === 'function') {
      onInit(info());
    }

    if (nested === 'inner') { 
      events.emit('innerLoaded', info()); 
    }
  })();





// === ON RESIZE ===
  function onResize(e) {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (vw !== getViewWidth()) {
        resizeTasks();
        if (nested === 'outer') { 
          events.emit('outerResized', info(e)); 
        }
      }
    }, 100); // update after stop resizing for 100 ms
  }

  function resizeTasks() {
    var indexTem = index, itemsTem = items;
    if (responsive || fixedWidth) { items = getItems(); }

    // things always do 
    // regardless of items changing
    if (!horizontal) {
      getSlideOffsetTops();
      updateContentWrapperHeight();
      doContainerTransform();
    }
    if (fixedWidth && edgePadding) { updateFixedWidthEdgePadding(); }
    runAutoHeight(); 
    
    // things do only when items changed
    if (responsive && items !== itemsTem) {
      events.emit('itemsChanged');
      checkSlideCount();
      checkIndex();

      // update container width on non-mediaquery browser
      if (!fixedWidth && !CSSMQ) {
        updateContainerWidthNonMediaquery();
      }

      doTransform(0); 
      updateSlideStatus();
      lazyLoad(); 
      updateNavVisibility();
      updateNavStatus();

      if (index !== indexTem) { 
        events.emit('indexChanged', info());
        updateControlsStatus();
      }
      if (navigator.msMaxTouchPoints) { setSnapInterval(); }
    }
  }





  // === INITIALIZATION FUNCTIONS === //
  function updateContainerWidthNonMediaquery () {
    container.style.width = slideCountNew * 100 / items + '%';
  }

  // (slideBy, indexMin, indexMax) => index
  var checkIndex = (function () {
    if (loop) {
      return function () {
        var leftEdge = indexMin, rightEdge = indexMax;
        if (carousel) {
          leftEdge += slideBy;
          rightEdge -= slideBy;
        }

        if (fixedWidth && vw%(fixedWidth + gutter) !== 0) { rightEdge -= 1; }

        if (index > rightEdge) {
          while(index >= leftEdge + slideCount) { index -= slideCount; }
        } else if(index < leftEdge) {
          while(index <= rightEdge - slideCount) { index += slideCount; }
        }
      };
    } else {
      return function () {
        index = Math.max(indexMin, Math.min(indexMax, index));
      };
    }
  })();

  // lazyload
  function lazyLoad() {
    if (lazyload) {
      var i = index, 
          len = index + items;
          
      if (edgePadding) {
        i -=1;
        len +=1;
      }

      for(; i < len; i++) {
        [].forEach.call(slideItems[i].querySelectorAll('.tns-lazy-img'), function (img) {
          // stop propagationl transitionend event to container
          var eve = {};
          eve[TRANSITIONEND] = function (e) { e.stopPropagation(); };
          addEvents(img, eve);

          if (!img.classList.contains('loaded')) {
            img.src = getAttr(img, 'data-src');
            img.classList.add('loaded');
          }
        });
      }
    }
  }

  // check if all visible images are loaded
  // and update container height if it's done
  function runAutoHeight() {
    if (autoHeight) {
      // get all images inside visible slide items
      var images = [];

      for (var i = index; i < index + items; i++) {
        [].forEach.call(slideItems[i].querySelectorAll('img'), function (img) {
          images.push(img);
        });
      }

      if (images.length === 0) {
        updateContainerHeight(); 
      } else {
        checkImagesLoaded(images);
      }
    }
  }

  function checkImagesLoaded(images) {
    images.forEach(function (img, index) {
      if (imageLoaded(img)) { images.splice(index, 1); }
    });

    if (images.length === 0) {
      updateContainerHeight();
    } else {
      setTimeout(function () { 
        checkImagesLoaded(images); 
      }, 16);
    }
  } 


  // (vw) => edgePadding
  function getFixedWidthEdgePadding() {
    if (!vw) { vw = getViewWidth(); }
    return (vw%(fixedWidth + gutter) + gutter) / 2;
  }

  // update container height
  // 1. get the max-height of the visible slides
  // 2. set transitionDuration to speed
  // 3. update container height to max-height
  // 4. set transitionDuration to 0s after transition done
  function updateContainerHeight() {
    var heights = [], maxHeight;
    for (var i = index; i < index + items; i++) {
      heights.push(slideItems[i].offsetHeight);
    }
    maxHeight = Math.max.apply(null, heights);

    if (container.style.height !== maxHeight) {
      if (TRANSITIONDURATION) { setDurations(speed); }
      container.style.height = maxHeight + 'px';
    }
  }

  // get the distance from the top edge of the first slide to each slide
  // (init) => slideOffsetTops
  function getSlideOffsetTops() {
    slideOffsetTops = [0];
    var topFirst = slideItems[0].getBoundingClientRect().top, attr;
    for (var i = 1; i < slideCountNew; i++) {
      attr = slideItems[i].getBoundingClientRect().top;
      slideOffsetTops.push(attr - topFirst);
    }
  }

  // set snapInterval (for IE10)
  function setSnapInterval() {
    wrapper.style.msScrollSnapPointsX = 'snapInterval(0%, ' + (100 / items) + '%)';
  }

  // update slide
  function updateSlideStatus() {
    var h1, h2, v1, v2;
    if (index !== indexCached) {
      if (index > indexCached) {
        h1 = indexCached;
        h2 = Math.min(indexCached + items, index);
        v1 = Math.max(indexCached + items, index);
        v2 = index + items;
      } else {
        h1 = Math.max(index + items, indexCached);
        h2 = indexCached + items;
        v1 = index;
        v2 = Math.min(index + items, indexCached);
      }
    }

    if (slideBy%1 !== 0) {
      h1 = Math.round(h1);
      h2 = Math.round(h2);
      v1 = Math.round(v1);
      v2 = Math.round(v2);
    }

    for (var i = h1; i < h2; i++) {
      setAttrs(slideItems[i], {
        'aria-hidden': 'true',
        'tabindex': '-1'
      });
    }
    for (var j = v1; j < v2; j++) {
      setAttrs(slideItems[j], {'aria-hidden': 'false'});
      removeAttrs(slideItems[j], ['tabindex']);
    }
  }

  // set tabindex & aria-selected on Nav
  function updateNavStatus() {
    // get current nav
    if (nav) {
      navCurrent = (navClicked !== -1) ? navClicked : (!loop && edgePadding) ? (index - 1)%slideCount : index%slideCount;
      navClicked = -1;

      if (navCurrent !== navCurrentCached) {
        setAttrs(navItems[navCurrentCached], {
          'tabindex': '-1',
          'aria-selected': 'false'
        });

        setAttrs(navItems[navCurrent], {
          'tabindex': '0',
          'aria-selected': 'true'
        });
        navCurrentCached = navCurrent;
      }
    }
  }

  // set 'disabled' to true on controls when reach the edge
  function updateControlsStatus() {
    if (controls && !loop) {
      var disable = [], active = [];
      if (index === indexMin) {
        disable.push(prevButton);
        active.push(nextButton);
        changeFocus(prevButton, nextButton);
      } else if (!rewind && index === indexMax) {
        disable.push(nextButton);
        active.push(prevButton);
        changeFocus(nextButton, prevButton);
      } else {
        active.push(prevButton, nextButton);
      }

      if (disable.length > 0) {
        disable.forEach(function (button) {
          if (!button.disabled) {
            button.disabled = true;
          }
        });
      }

      if (active.length > 0) {
        active.forEach(function (button) {
          if (button.disabled) {
            button.disabled = false;
          }
        });
      }
    }
  }

  // set duration
  function setDurations (duration, target) {
    duration = (!duration)? '' : duration / 1000 + 's';
    target = target || container;
    target.style[TRANSITIONDURATION] = duration;

    if (!carousel) {
      target.style[ANIMATIONDURATION] = duration;
    }
    if (!horizontal) {
      contentWrapper.style[TRANSITIONDURATION] = duration;
    }
  }

  function getContainerTransformValue() {
    var containerTransformValue;
    if (!horizontal) {
      containerTransformValue = - slideOffsetTops[index] + 'px';
    } else {
      if (fixedWidth) {
        containerTransformValue = - (fixedWidth + gutter) * index + 'px';
      } else {
        var denominator = (TRANSFORM) ? slideCountNew : items;
        containerTransformValue = - index * 100 / denominator + '%';
      }
    }

    return containerTransformValue;
  }

  function doContainerTransform(val) {
    if (!val) { val = getContainerTransformValue(); }
    container.style[transformAttr] = transformPrefix + val + transformPostfix;
  }

  // make transfer after click/drag:
  // 1. change 'transform' property for mordern browsers
  // 2. change 'left' property for legacy browsers
  var transformCore = (function () {
    // carousel
    if (carousel) {
      return function (duration, distance) {
        if (!distance) { distance = getContainerTransformValue(); }
        // constrain the distance when non-loop no-edgePadding fixedWidth reaches the right edge
        if (hasRightDeadZone && index === indexMax) {
          var containerRightEdge = (TRANSFORM) ? 
              - ((slideCountNew - items) / slideCountNew) * 100 : 
              - (slideCountNew / items - 1) * 100; 
          distance = Math.max(Number(distance.replace('%', '')), containerRightEdge) + '%';
        }

        if (TRANSITIONDURATION || !duration) {
          doContainerTransform(distance);
        } else {
          jsTransform(container, transformAttr, transformPrefix, transformPostfix, distance, speed, onTransitionEnd);
        }

        if (!horizontal) { updateContentWrapperHeight(); }
      };

    // gallery
    } else {
      return function () {
        slideItemsOut = [];

        var eve = {};
        eve[TRANSITIONEND] = eve[ANIMATIONEND] = onTransitionEnd;
        removeEvents(slideItems[indexCached], eve);
        addEvents(slideItems[index], eve);

        (function () {
          for (var i = indexCached, l = indexCached + items; i < l; i++) {
            var item = slideItems[i];
            if (TRANSITIONDURATION) { setDurations(speed, item); }
            if (animateDelay && TRANSITIONDELAY) {
              var d = animateDelay * (i - indexCached) / 1000; 
              item.style[TRANSITIONDELAY] = d + 's'; 
              item.style[ANIMATIONDELAY] = d + 's'; 
            }
            item.classList.remove(animateIn);
            item.classList.add(animateOut);
            slideItemsOut.push(item);
          }
        })();

        (function () {
          for (var i = index, l = index + items; i < l; i++) {
            var item = slideItems[i];
            if (TRANSITIONDURATION) { setDurations(speed, item); }
            if (animateDelay && TRANSITIONDELAY) {
              var d = animateDelay * (i - index) / 1000; 
              item.style[TRANSITIONDELAY] = d + 's'; 
              item.style[ANIMATIONDELAY] = d + 's'; 
            }
            item.classList.remove(animateNormal);
            item.classList.add(animateIn);

            var leftVal = (CALC)? 
                CALC + '(' + (i - index) * 100 + '% / ' + items + ')' : 
                (i - index) * 100 / items + '%';
            if (i > index) { item.style.left = leftVal; }
          }
        })();

        if (!TRANSITIONEND) {
          setTimeout(onTransitionEnd, speed);
        }
      };
    }
  })();

  function doTransform (duration, distance) {
    if (duration === undefined) { duration = speed; }
    if (TRANSITIONDURATION) { setDurations(duration); }
    transformCore(duration, distance);
  }

  function render() {
    running = true;
    if (checkIndexBeforeTransform) { checkIndex(); }

    // events
    if (index%slideCount !== indexCached%slideCount) { events.emit('indexChanged', info()); }
    events.emit('transitionStart', info());

    doTransform();
  }

  // AFTER TRANSFORM
  // Things need to be done after a transfer:
  // 1. check index
  // 2. add classes to visible slide
  // 3. disable controls buttons when reach the first/last slide in non-loop slider
  // 4. update nav status
  // 5. lazyload images
  // 6. update container height
  function onTransitionEnd(event) {
    events.emit('transitionEnd', info(event));

    if (!carousel && slideItemsOut.length > 0) {
      for (var i = 0; i < items; i++) {
        var item = slideItemsOut[i];
        if (TRANSITIONDURATION) { setDurations(0, item); }
        if (animateDelay && TRANSITIONDELAY) { 
          item.style[TRANSITIONDELAY] = item.style[ANIMATIONDELAY] = '';
        }
        item.classList.remove(animateOut);
        item.classList.add(animateNormal);
        item.style.left = '';
      }
    }

    /*
     * Transfer prefixed properties to the same format
     * CSS: -Webkit-Transform => webkittransform
     * JS: WebkitTransform => webkittransform
     * @param {string} str - property
     *
     */
    function strTrans(str) {
      return str.toLowerCase().replace(/-/g, '');
    }

    /* update slides, nav, controls after checking ...
     * => legacy browsers who don't support 'event' 
     *    have to check event first, otherwise event.target will cause an error 
     * => or 'gallery' mode: 
     *   + event target is slide item
     * => or 'carousel' mode: 
     *   + event target is container, 
     *   + event.property is the same with transform attribute
     */
    if (!event || 
        !carousel && event.target.parentNode === container || 
        event.target === container && strTrans(event.propertyName) === strTrans(transformAttr)) {

      if (!checkIndexBeforeTransform) { 
        var indexTem = index;
        checkIndex();
        if (index !== indexTem) { 
          doTransform(0); 
          events.emit('indexChanged', info());
        }
      } 

      updateSlideStatus();

      // non-loop: always update nav visibility
      // loop: update nav visibility when visibleNavIndexes doesn't contain current index
      if (nav && !loop || 
          nav && loop && visibleNavIndexes.indexOf(index%slideCount) === -1) { 
        updateNavVisibility(); 
      }
      updateNavStatus();
      updateControlsStatus();
      lazyLoad();
      runAutoHeight();

      if (nested === 'inner') { 
        events.emit('innerLoaded', info()); 
      } 
      running = false;
      indexCached = index;
    }

  }

  // # ACTIONS
  function goTo (targetIndex) {
    if (!running) {

      var absIndex = index%slideCount, indexGap;
      if (absIndex < 0) { absIndex += slideCount; }

      switch(targetIndex) {
        case 'next':
          indexGap = 1;
          break;
        case 'prev':
          indexGap = -1;
          break;
        case 'first':
          indexGap = - absIndex;
          break;
        case 'last':
          indexGap = (slideCount - 1) - absIndex;
          break;
        default:
          if (typeof targetIndex === 'number') {
            // go to the 3rd item => item which index is 2
            // targetIndex -1 to correct the index
            var absTargetIndex = (targetIndex - 1)%slideCount;
            if (absTargetIndex < 0) { absTargetIndex += slideCount; }
            if (!loop && edgePadding) { absTargetIndex += 1; }
            indexGap = absTargetIndex - absIndex;
          }
      }

      index += indexGap;
      // check index before compare with indexCached
      if (checkIndexBeforeTransform) { checkIndex(); }

      // if index is changed, start rendering
      if (index%slideCount !== indexCached%slideCount) {
        render();
      }

    }
  }

  // on controls click
  function onControlClick(dir) {
    if (!running) {
      index = index + dir * slideBy;

      render();
    }
  }

  function onPrevClick() {
    onControlClick(-1);
  }

  function onNextClick() {
    // goes to the first if reach the end in rewind mode
    // other wise go to the next
    if(rewind && index === indexMax){
      goTo(0);
    }else{
      onControlClick(1);
    }
  }

  // on nav click
  function onNavClick(e) {
    if (!running) {
      var clickTarget = e.target || e.srcElement,
          navIndex;

      // find the clicked nav item
      while (indexOf(navItems, clickTarget) === -1) {
        clickTarget = clickTarget.parentNode;
      }
      navIndex = navClicked = indexOf(navItems, clickTarget);

      // +1 because in goTo function 
      // it will be -1
      goTo(navIndex + 1);
    }
  }

  function startAction() {
    resetActionTimer();
    setAttrs(autoplayButton, {'data-action': 'stop'});
    autoplayButton.innerHTML = autoplayHtmlString + autoplayText[1];

    animating = true;
  }

  function stopAction() {
    pauseActionTimer();
    setAttrs(autoplayButton, {'data-action': 'start'});
    autoplayButton.innerHTML = autoplayHtmlString.replace('Stop', 'Start') + autoplayText[0];

    animating = false;
  }

  function pauseActionTimer() {
    animating = 'paused';
    clearInterval(autoplayTimer);
  }

  function resetActionTimer() {
    if (animating === true) { return; }
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(function () {
      onControlClick(autoplayDirection);
    }, autoplayTimeout);
  }

  function toggleAnimation() {
    if (animating) {
      stopAction();
    } else {
      startAction();
    }
  }

  function onVisibilityChange() {
    if (autoplayResetVisibilityState != doc.hidden && animating !== false) {
      doc.hidden ? pauseActionTimer() : resetActionTimer();
    }
    autoplayResetVisibilityState = doc.hidden;
  }

  // keydown events on document 
  function onDocumentKeydown(e) {
    e = e || window.event;
    switch(e.keyCode) {
      case KEYS.LEFT:
        onPrevClick();
        break;
      case KEYS.RIGHT:
        onNextClick();
    }
  }

  // change focus
  function changeFocus(blur, focus) {
    if (typeof blur === 'object' && 
        typeof focus === 'object' && 
        blur === doc.activeElement) {
      blur.blur();
      focus.focus();
    }
  }

  // on key control
  function onControlKeydown(e) {
    e = e || window.event;
    var code = e.keyCode,
        curElement = doc.activeElement;

    switch (code) {
      case KEYS.LEFT:
      case KEYS.UP:
      case KEYS.PAGEUP:
          if (!prevButton.disabled) {
            onPrevClick();
          }
          break;
      case KEYS.RIGHT:
      case KEYS.DOWN:
      case KEYS.PAGEDOWN:
          if (!nextButton.disabled) {
            onNextClick();
          }
          break;
      case KEYS.HOME:
        goTo(0);
        break;
      case KEYS.END:
        goTo(slideCount - 1);
        break;
    }
  }

  // on key nav
  function onNavKeydown(e) {
    e = e || window.event;
    var code = e.keyCode,
        curElement = doc.activeElement,
        dataSlide = getAttr(curElement, 'data-nav');

    switch(code) {
      case KEYS.LEFT:
      case KEYS.PAGEUP:
        if (dataSlide > 0) { changeFocus(curElement, curElement.previousElementSibling); }
        break;
      case KEYS.UP:
      case KEYS.HOME:
        if (dataSlide !== 0) { changeFocus(curElement, navItems[0]); }
        break;
      case KEYS.RIGHT:
      case KEYS.PAGEDOWN:
        if (dataSlide < navCountVisible - 1) { changeFocus(curElement, curElement.nextElementSibling); }
        break;
      case KEYS.DOWN:
      case KEYS.END:
        if (dataSlide < navCountVisible - 1) { changeFocus(curElement, navItems[navCountVisible - 1]); }
        break;
      case KEYS.ENTER:
      case KEYS.SPACE:
        onNavClick(e);
        break;
    }
  }

  // IE10 scroll function
  function ie10Scroll() {
    doTransform(0, container.scrollLeft());
    indexCached = index;
  }

  function getTarget(e) {
    return e.target || e.srcElement;
  }

  function isLinkElement(el) {
    return el.tagName.toLowerCase() === 'a';
  }

  function preventDefaultBehavior(e) {
      if (e.preventDefault) {
        e.preventDefault();
      } else {
        e.returnValue = false;
      }
  }

  function onTouchOrMouseStart(e) {
    e = e || window.event;
    if (isLinkElement(getTarget(e)) && e.type !== 'touchstart') { preventDefaultBehavior(e); }

    var ev = (e.type === 'touchstart') ? e.changedTouches[0] : e;
    startX = parseInt(ev.clientX);
    startY = parseInt(ev.clientY);
    translateInit = Number(container.style[transformAttr].replace(transformPrefix, '').replace(transformPostfix, '').replace(/(px|%)/g, ''));

    if (e.type === 'touchstart') {
      events.emit('touchStart', info(e));
    } else {
      events.emit('dragStart', info(e));
      mousePressed = true;
    }
  }

  function onTouchOrMouseMove(e) {
    e = e || window.event;

    // "mousemove" event after "mousedown" indecate it's "drag", not "click"
    // set isDragEvent to true
    if (mousePressed && e.type === 'mousemove' && !isDragEvent) {
      isDragEvent = true;
    }
    
    // make sure touch started or mouse draged
    if (startX !== null) {
      if (isLinkElement(getTarget(e)) && e.type !== 'touchmove') { preventDefaultBehavior(e); }

      var ev = (e.type === 'touchmove') ? e.changedTouches[0] : e;
      disX = parseInt(ev.clientX) - startX;
      disY = parseInt(ev.clientY) - startY;

      if (getTouchDirection(toDegree(disY, disX), 15) === axis) { 
        touchedOrDraged = true;

        if (e.type === 'touchmove') {
          events.emit('touchMove', info(e));
        } else {
          events.emit('dragMove', info(e));
        }

        var x = translateInit;
        if (horizontal) {
          var percentageX = (TRANSFORM) ? disX * items * 100 / (vw * slideCountNew): disX * 100 / vw;
          x += percentageX;
          x += '%';
        } else {
          x += disY;
          x += 'px';
        }

        if (TRANSFORM) { setDurations(0); }
        container.style[transformAttr] = transformPrefix + x + transformPostfix;
      }
    }
  }

  function onTouchOrMouseEnd(e) {
    e = e || window.event;

    // reset mousePressed
    if (mousePressed) { mousePressed = false; }

    if (touchedOrDraged) {
      touchedOrDraged = false;

      var ev = (e.type.indexOf('touch') === 0) ? e.changedTouches[0] : e;
      disX = parseInt(ev.clientX) - startX;
      disY = parseInt(ev.clientY) - startY;

      // reset startX, startY
      startX = startY = null;

      if (horizontal) {
        var indexMoved = - disX * items / vw;
        indexMoved = (disX > 0) ? Math.floor(indexMoved) : Math.ceil(indexMoved);
        index += indexMoved;
      } else {
        var moved = - (translateInit + disY);
        if (moved <= 0) {
          index = indexMin;
        } else if (moved >= slideOffsetTops[slideOffsetTops.length - 1]) {
          index = indexMax;
        } else {
          var i = 0;
          do {
            i++;
            index = (disY < 0) ? i + 1 : i;
          } while (i < slideCountNew && moved >= slideOffsetTops[i + 1]);
        }
      }
      
      if (e.type.indexOf('touch') === 0) {
        events.emit('touchEnd', info(e));
      } else {
        events.emit('dragEnd', info(e));
      }

      render();
    }

    // drag vs click?
    if (isDragEvent) { 
      // reset isDragEvent
      isDragEvent = false;

      // prevent "click"
      var target = getTarget(e);
      if (isLinkElement(target)) {
        addEvents(target, {'click': function preventClick(e) {
          preventDefaultBehavior(e);
          removeEvents(target, {'click': preventClick});
        }}); 
      }
    } 
  }

  // === RESIZE FUNCTIONS === //
  // (vw) => fixedWidth_contentWrapper.edgePadding
  function updateFixedWidthEdgePadding() {
    contentWrapper.style.cssText += 'margin: 0px ' + getFixedWidthEdgePadding() + 'px';
  }

  // (slideOffsetTops, index, items) => vertical_conentWrapper.height
  function updateContentWrapperHeight() {
    contentWrapper.style.height = slideOffsetTops[index + items] - slideOffsetTops[index] + 'px';
  }

  /*
   * get nav item indexes per items
   * add 1 more if the nav items cann't cover all slides
   * [0, 1, 2, 3, 4] / 3 => [0, 3]
   */
  function getVisibleNavIndex() {
    // reset visibleNavIndexes
    visibleNavIndexes = [];

    var temIndex = (!loop && edgePadding) ? (index - 1) : index;
    var absIndexMin = temIndex%slideCount%items;
    while (absIndexMin < slideCount) {
      if (!loop && absIndexMin + items > slideCount) { absIndexMin = slideCount - items; }
      visibleNavIndexes.push(absIndexMin);
      absIndexMin += items;
    }

    // nav count * items < slide count means
    // some slides can not be displayed only by nav clicking
    if (loop && visibleNavIndexes.length * items < slideCount ||
        !loop && visibleNavIndexes[0] > 0) {
      visibleNavIndexes.unshift(0);
    }
  }
  
  /*
   * 1. update visible nav items list
   * 2. add "hidden" attributes to previous visible nav items
   * 3. remove "hidden" attrubutes to new visible nav items
   */
  function updateNavVisibility() {
    if (nav && !options.navContainer) {
      // update visible nav indexes
      getVisibleNavIndex();

      if (visibleNavIndexes !== visibleNavIndexesCached) {
        // add 'hidden' attribute to previous visible navs
        if (visibleNavIndexesCached.length > 0) {
          visibleNavIndexesCached.forEach(function (ind) {
            setAttrs(navItems[ind], {'hidden': ''});
          });
        }

        // remove 'hidden' attribute from visible navs
        if (visibleNavIndexes.length > 0) {
          visibleNavIndexes.forEach(function (ind) {
            removeAttrs(navItems[ind], 'hidden');
          });
        }

        // cache visible nav indexes
        visibleNavIndexesCached = visibleNavIndexes;
      }
    }
  }

  function info(e) {
    return {
      container: container,
      slideItems: slideItems,
      navItems: navItems,
      prevButton: prevButton,
      nextButton: nextButton,
      items: items,
      index: index,
      indexCached: indexCached,
      navCurrent: navCurrent,
      navCurrentCached: navCurrentCached,
      slideCount: slideCount,
      cloneCount: cloneCount,
      slideCountNew: slideCountNew,
      event: e || {},
    };
  }

  return {
    getInfo: info,
    events: events,
    goTo: goTo,

    destroy: function () {
      // wrapper
      unwrap(wrapper);
      unwrap(contentWrapper);
      wrapper = contentWrapper = null;

      // container
      removeAttrs(container, ['id', 'style']);

      // cloned items
      if (loop) {
        for (var j = cloneCount; j--;) {
          slideItems[0].remove();
          slideItems[slideItems.length - 1].remove();
        }
      }

      // Slide Items
      removeAttrs(slideItems, ['id', 'style', 'aria-hidden', 'tabindex']);
      slideId = slideCount = null;

      // controls
      if (controls) {
        if (options.controlsContainer) {
          removeAttrs(controlsContainer, ['aria-label', 'tabindex']);
          removeAttrs(controlsContainer.children, ['aria-controls', 'tabindex']);
          removeEventsByClone(controlsContainer);
        } else {
          controlsContainer.remove();
          controlsContainer = prevButton = nextButton = null;
        }
      }

      // nav
      if (nav) {
        if (!options.navContainer) {
          navContainer.remove();
          navContainer = null;
        } else {
          removeAttrs(navContainer, ['aria-label']);
          removeAttrs(navItems, ['aria-selected', 'aria-controls', 'tabindex']);
          removeEventsByClone(navContainer);
        }
        navItems = null;
      }

      // auto
      if (autoplay) {
        if (!options.navContainer && navContainer !== null) {
          navContainer.remove();
          navContainer = null;
        } else {
          removeEventsByClone(autoplayButton);
        }
        removeEvents(document, {'visibilitychange': onVisibilityChange});
      }

      // remove slider container events at the end
      // because this will make container = null
      removeEventsByClone(container);

      // remove arrowKeys eventlistener
      if (arrowKeys) {
        removeEvents(document, {'keydown': onDocumentKeydown});
      }

      // remove window event listeners
      removeEvents(window, {'resize': onResize});
    },

    // $ Private methods, for test only
    // hasAttr: hasAttr, 
    // getAttr: getAttr, 
    // setAttrs: setAttrs, 
    // removeAttrs: removeAttrs, 
    // removeEventsByClone: removeEventsByClone, 
    // getSlideId: getSlideId, 
    // toDegree: toDegree, 
    // getTouchDirection: getTouchDirection, 
    // hideElement: hideElement, 
    // showElement: showElement,
  };
};

return tns;
})();