// @codekit-append "tiny-slider.js";

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


// *** gn *** //
var gn = (function (g) {

  // return gn
  return g;
})(window.gn || {});

// extend
// @require "/src/gn/gn.js"

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
};

// isInViewport
// @require "/src/gn/gn.js"

gn.isInViewport = function ( elem ) {
  var rect = elem.getBoundingClientRect();
  return (
    rect.bottom >= 0 &&
    rect.right >= 0 &&
    rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.left <= (window.innerWidth || document.documentElement.clientWidth)
    );
};

// indexOf
// @require "/src/gn/gn.js"

gn.indexOf = function (array, item) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] === item) { return i; }
  }
  return -1;
};

// get supported property
// @require "/src/gn/gn.js"

gn.getSupportedProp = function (proparray){
  var root = document.documentElement;
  for (var i=0; i<proparray.length; i++){
    if (proparray[i] in root.style){
      return proparray[i];
    }
  }
};

// var getTD = gn.getSupportedProp(['transitionDuration', 'WebkitTransitionDuration', 'MozTransitionDuration', 'OTransitionDuration']),
// getTransform = gn.getSupportedProp(['transform', 'WebkitTransform', 'MozTransform', 'OTransform']);

// isNodeList
// @require "/src/gn/gn.js"

gn.isNodeList = function (el) {
  // Only NodeList has the "item()" function
  return typeof el.item !== 'undefined'; 
};


// append
// @require "/src/gn/gn.js"
// @require "/src/gn/isNodeList.js"

gn.append = function(els, data) {
  var els_new = (gn.isNodeList(els)) ? els : [els], i;

  if (typeof data.nodeType !== "undefined" && data.nodeType === 1) {
    for (i = els_new.length; i--;) {
      els_new[i].appendChild(data);
    }
  } else if (typeof data === "string") {
    for (i = els_new.length; i--;) {
      els_new[i].insertAdjacentHTML('beforeend', data);
    }
  } else if (gn.isNodeList(data)) {
    var fragment = document.createDocumentFragment();
    for (i = data.length; i--;) {
      fragment.insertBefore(data[i], fragment.firstChild);
    }
    for (var j = els_new.length; j--;) {
      els_new[j].appendChild(fragment);
    }
  }
};



// wrap
// @require "/src/gn/gn.js"
// @require "/src/gn/isNodeList.js"

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



// @codekit-prepend "../bower_components/domtokenlist/src/token-list.js";

// @codekit-prepend "../bower_components/go-native/src/gn/base.js";
// @codekit-prepend "../bower_components/go-native/src/gn/extend.js";
// @codekit-prepend "../bower_components/go-native/src/gn/isInViewport.js";
// @codekit-prepend "../bower_components/go-native/src/gn/indexOf.js";
// @codekit-prepend "../bower_components/go-native/src/gn/getSupportedProp.js";

// @codekit-prepend "../bower_components/go-native/src/gn/isNodeList.js";
// @codekit-prepend "../bower_components/go-native/src/gn/append.js";
// @codekit-prepend "../bower_components/go-native/src/gn/wrap.js";

// @codekit-prepend "../bower_components/requestAnimationFrame/requestAnimationFrame.js";


/**
  * tiny-slider.native
  * @version 0.3.1
  * @author William Lin
  * @license The MIT License (MIT)
  * @github https://github.com/ganlanyuan/tiny-slider/
  */

var tinySlider = (function () {
  'use strict';

  // get supported property
  var getTD = gn.getSupportedProp(['transitionDuration', 'WebkitTransitionDuration', 'MozTransitionDuration', 'OTransitionDuration']),
      getTransform = gn.getSupportedProp(['transform', 'WebkitTransform', 'MozTransform', 'OTransform']);

  function core (options) {
    options = gn.extend({
      container: document.querySelector('.slider'),
      items: 1,
      fixedWidth: false,
      maxContainerWidth: false,
      slideByPage: false,
      nav: true,
      navText: ['prev', 'next'],
      navContainer: false,
      dots: true,
      dotsContainer: false,
      arrowKeys: false,
      speed: 250,
      autoplay: false,
      autoplayTimeout: 5000,
      autoplayDirection: 'forward',
      autoText: ['start', 'stop'],
      autoContainer: false,
      loop: true,
      autoHeight: false,
      responsive: false,
      lazyload: false,
      touch: true,
    }, options || {});

    // === define and set variables ===
    var slideContainer = options.container,
        slideItems = slideContainer.children,
        slideCount = slideItems.length,
        slideCountUpdated = slideItems.length,
        fixedWidth = options.fixedWidth,
        nav = options.nav,
        navText = options.navText,
        navContainer = (!options.navContainer) ? false : options.navContainer,
        dots = options.dots,
        dotsContainer = (!options.dotsContainer) ? false : options.dotsContainer,
        arrowKeys = options.arrowKeys,
        speed = (!getTD) ? 0 : options.speed,
        autoplay = options.autoplay,
        autoplayTimeout = options.autoplayTimeout,
        autoplayDirection = (options.autoplayDirection === 'forward') ? 1 : -1,
        autoText = options.autoText,
        autoContainer = (!options.autoContainer) ? false : options.autoContainer,
        loop = (fixedWidth && !options.maxContainerWidth) ? false : options.loop,
        autoHeight = options.autoHeight,
        slideByPage = options.slideByPage,
        lazyload = options.lazyload,
        touch = options.touch,

        slideWidth,
        itemsMax,
        items,
        prevButton,
        nextButton,
        allDots,
        dotsCount,
        dotsCountVisible,
        index = 0,
        animating = false,
        scrolling = false,
        dotClicked = -1;

    if (autoplay) {
      var startButton,
          stopButton;
    }

    if (touch) {
      var startX = 0,
          startY = 0,
          translateX = 0,
          distX = 0,
          distY = 0,
          run = false,
          slideEventAdded = false;
    }

    // get items, itemsMax, slideWidth, dotsCountVisible
    var responsive = (fixedWidth) ? false : options.responsive,
        bpKeys = (typeof responsive !== 'object') ? false : Object.keys(responsive),
        bpVals = getMapValues(responsive);

    var getItems = (function () {
      if (!fixedWidth) {
        return function () {
          var itemsTem;
          var ww = document.documentElement.clientWidth;

          if (bpKeys.length !== undefined && bpVals !== undefined && bpKeys.length === bpVals.length) {
            if (ww < bpKeys[0]) {
              itemsTem = options.items;
            } else if (ww >= bpKeys[bpKeys.length - 1]) {
              itemsTem = bpVals[bpVals.length - 1];
            } else {
              for (var i = 0; i < bpKeys.length - 1; i++) {
                if (ww >= bpKeys[i] && ww <= bpKeys[i+1]) {
                  itemsTem = bpVals[i];
                }
              }
            }
          } else {
            itemsTem = options.items;
          }

          return Math.max(Math.min(slideCount, itemsTem), 1);
        };
      } else {
        return function () {
          return Math.max(Math.min(slideCount, Math.floor(slideContainer.parentNode.offsetWidth / fixedWidth)), 1);
        };
      }
    })();

    var getItemsMax = function () {
      var itemsMaxTem;

      if (!fixedWidth) {
        itemsMaxTem = (bpVals.length !== undefined) ? Math.max.apply(Math, bpVals) : options.items;
      } else {
        if (options.maxContainerWidth) {
          itemsMaxTem = Math.ceil(options.maxContainerWidth / fixedWidth);
        } else {
          itemsMaxTem = false;
        }
      }

      if (itemsMaxTem) {
        return Math.min(slideCount, itemsMaxTem);
      } else {
        return itemsMaxTem;
      }
    };

    var getSlideWidth = (function () {
      if (fixedWidth) {
        return function () { return fixedWidth; };
      } else {
        return function () { return slideContainer.parentNode.offsetWidth / items; };
      }
    })();

    var getDotsCount = (function () {
      if (dotsContainer) {
        return function () { return slideCount; };
      } else {
        return function () { return Math.ceil(slideCount / items); };
      }
    })();

    items = getItems();
    itemsMax = getItemsMax();
    slideWidth = getSlideWidth();
    dotsCountVisible = getDotsCount();

    // update layout:
    // update slide container width, margin-left
    // update slides' width
    function updateLayout() {
      slideContainer.style.width = slideWidth * slideCountUpdated + 'px';
      if (loop) {
        slideContainer.style.marginLeft = - (itemsMax * slideWidth) + 'px';
      }
      for (var b = slideCountUpdated; b--;) {
        slideItems[b].style.width = slideWidth + 'px';
      }
    }

    // update container height
    // 1. get the max-height of the current slides
    // 2. set transitionDuration to speed
    // 3. update container height to max-height
    // 4. set transitionDuration to 0s after transition is done
    function updateContainerHeight() {
      var current = (loop) ? index + itemsMax : index, 
          heights = [],
          maxHeight;

      for (var i = slideCountUpdated; i--;) {
        if (i >= current && i < current + items) {
          heights.push(slideItems[i].offsetHeight);
        }
      }

      maxHeight = Math.max.apply(null, heights);
      if (getTD) { slideContainer.style[getTD] = speed / 1000 + 's'; }
      slideContainer.style.height = maxHeight + 'px';
      animating = true;
      
      setTimeout(function () {
        if (getTD) { slideContainer.style[getTD] = '0s'; }
        animating = false;
      }, speed);
    }

    // set transition duration
    function setTransitionDuration(indexGap) {
      if (!getTD) { return; }
      slideContainer.style[getTD] = (speed * indexGap / 1000) + 's';
      animating = true;
    }

    // set snapInterval (for IE10)
    function setSnapInterval() {
      if (!navigator.msMaxTouchPoints) { return; }
      slideContainer.parentNode.style.msScrollSnapPointsX = 'snapInterval(0%, ' + slideWidth + ')';
    }

    // active slide
    // 1. add class '.tiny-visible' to visible slides
    // 2. add class '.tiny-current' to the first visible slide
    // 3. remove classes '.tiny-visible' and '.tiny-current' from other slides
    function activeSlide() {
      var current = (loop) ? index + itemsMax : index;

      for (var i = slideCountUpdated; i--;) {
        if (i < current || i >= current + items) {
          if (slideItems[i].getAttribute('tabindex') !== null) {
            slideItems[i].removeAttribute('tabindex');
          }
          if (slideItems[i].classList.contains('tiny-visible')) {
            slideItems[i].classList.remove('tiny-current', 'tiny-visible');
          }
        } else if (i === current) {
          slideItems[i].setAttribute('tabindex', -1);
          slideItems[i].classList.add('tiny-current', 'tiny-visible');
        } else {
          if (slideItems[i].getAttribute('tabindex') !== null) {
            slideItems[i].removeAttribute('tabindex');
          }
          if (!slideItems[i].classList.contains('tiny-visible')) {
            slideItems[i].classList.remove('tiny-current');
            slideItems[i].classList.add('tiny-visible');
          }
        }
      }
    }

    // non-loop:
    // add class 'disabled' to nav 
    // when reach the first/last slide
    function disableNav() {
      if (loop) { return; }

      if (slideCount <= items) {
        if (index !== 0) {
          index = 0;
          translate();
        }
        if (!prevButton.classList.contains('disabled')) {
          prevButton.disabled = true;
        }
        if (!nextButton.classList.contains('disabled')) {
          nextButton.disabled = true;
        }
      } else {
        if (index === 0) {
          prevButton.disabled = true;
        } else {
          prevButton.disabled = false;
        }
        if (index === slideCount - items) {
          nextButton.disabled = true;
        } else {
          nextButton.disabled = false;
        }
      }
    }

    // show or hide extra dots.
    // doesn't work on customized dots.
    function displayDots() {
      if (!dots || dotsContainer) { return; }

      for (var i = dotsCount; i--;) {
        var dotTem = allDots[i];

        if (i < dotsCountVisible) {
          if (dotTem.classList.contains('tiny-hide')) {
            dotTem.classList.remove('tiny-hide');
          }
        } else {
          if (!dotTem.classList.contains('tiny-hide')) {
            dotTem.classList.add('tiny-hide');
          }
        }
      }
    }

    // add class 'tiny-active' to active dot
    // remove this class from other dots
    function activeDot() {
      if (!dots) { return; }

      var dotCurrent;

      if (dotClicked === -1) {
        var absoluteIndex = (index < 0) ? index + slideCount : (index >= slideCount) ? index - slideCount : index;
        dotCurrent = (dotsContainer) ? absoluteIndex : Math.floor(absoluteIndex / items);

        // non-loop & reach the edge
        if (!loop && !dotsContainer) {
          var re=/^-?[0-9]+$/, integer = re.test(slideCount / items);
          if(!integer && index === slideCount - items) {
            dotCurrent += 1;
          }
        }
      } else {
        dotCurrent = dotClicked;
        dotClicked = -1;
      }

      for (var i = dotsCountVisible; i--;) {
        var dotTem = allDots[i];

        if (i === dotCurrent) {
          if (!dotTem.classList.contains('tiny-active')) {
            dotTem.classList.add('tiny-active');
          }
        } else {
          if (dotTem.classList.contains('tiny-active')) {
            dotTem.classList.remove('tiny-active');
          }
        }
      }
    }

    // make transfer after click/drag:
    // 1. change 'transform' property for mordern browsers
    // 2. change 'left' property for legacy browsers
    function translate() {
      var vw = slideContainer.parentNode.offsetWidth;

      translateX = - slideWidth * index;
      if (fixedWidth && !loop) {
        translateX = Math.max( translateX, - Math.abs(slideCount * slideWidth - vw) );
      }

      if (getTransform) {
        slideContainer.style[getTransform] = 'translate3d(' + translateX + 'px, 0, 0)';
      } else {
        slideContainer.style.left = translateX + 'px';
      }
    }

    // check index after click/drag:
    // if viewport reach the left/right edge of slide container or
    // there is not enough room for next transfer,
    // transfer slide container to a new location without animation
    function fallback() {
      if (!loop) { return; }

      var reachLeftEdge = (slideByPage) ? index < (items - itemsMax) : index <= - itemsMax,
          reachRightEdge = (slideByPage) ? index > (slideCount + itemsMax - items * 2 - 1) : index >= (slideCount + itemsMax - items);

      // fix fixed-width
      if (fixedWidth && itemsMax && !slideByPage) {
        reachRightEdge = index >= (slideCount + itemsMax - items - 1);
      }

      if (reachLeftEdge) { index += slideCount; }
      if (reachRightEdge) { index -= slideCount; }

      if (getTD) { slideContainer.style[getTD] = '0s'; }
      translate();
    }

    // All actions need to be done after a transfer:
    // 1. check index
    // 2. add classes to current/visible slide
    // 3. disable nav buttons when reach the first/last slide in non-loop slider
    // 4. update dots status
    // 5. lazyload images
    // 6. update container height
    function update() {
      fallback();
      activeSlide();
      disableNav();
      activeDot();
      lazyLoad();
      if (autoHeight) {
        updateContainerHeight();
      }

      animating = false;
    }

    // on nav click
    function onNavClick(dir) {
      if (!animating) {
        dir = (slideByPage) ? dir * items : dir;
        var indexGap = Math.abs(dir);

        index = (loop) ? (index + dir) : Math.max(0, Math.min((index + dir), slideCount - items));

        setTransitionDuration(indexGap);
        translate();

        setTimeout(function () {
          update();
        }, speed * indexGap);
      }
    }

    // 
    function fireDotClick() {
      return function () {
        var dotIndex = gn.indexOf(allDots, this);
        onDotClick(dotIndex);
      };
    }

    // on doc click
    function onDotClick(dotIndex) {
      if (!animating) {
        dotClicked = dotIndex;

        var indexTem, indexGap;
        indexTem = (dotsContainer) ? dotIndex : dotIndex * items;
        indexTem = (loop) ? indexTem : Math.min(indexTem, slideCount - items);
        indexGap = Math.abs(indexTem - index);
        index = indexTem;

        setTransitionDuration(indexGap);
        translate();

        setTimeout(function () { 
          update();
        }, speed * indexGap);
      }
    }

    // lazyload
    function lazyLoad() {
      if (!gn.isInViewport(slideContainer)) { return; }

      var imgs = slideContainer.querySelectorAll('.tiny-visible .tiny-lazy');
      if (imgs.length === 0) { return; }
      for (var i = 0, len = imgs.length; i < len; i++) {
        if (!imgs[i].classList.contains('loaded')) {
          imgs[i].src = imgs[i].getAttribute('data-src');
          imgs[i].classList.add('loaded');
        }
      }
    }

    function onPanStart() {
      return function (e) {
        var touchObj = e.changedTouches[0];
        startX = parseInt(touchObj.clientX);
        startY = parseInt(touchObj.clientY);
      };
    }

    function onPanMove() {
      return function (e) {
        var touchObj = e.changedTouches[0];
        distX = parseInt(touchObj.clientX) - startX;
        distY = parseInt(touchObj.clientY) - startY;

        var rotate = toDegree(Math.atan2(distY, distX)),
            panDir = getPanDir(rotate, 15);

        if (panDir === 'horizontal' && animating === false) { run = true; }
        if (run) {
          if (getTD) { slideContainer.style[getTD] = '0s'; }

          var min = (!loop) ? - (slideCount - items) * slideWidth : - (slideCount + itemsMax - items) * slideWidth,
              max = (!loop) ? 0 : itemsMax * slideWidth;

          if (!loop && fixedWidth) { min = - (slideCount * slideWidth - slideContainer.parentNode.offsetWidth); }

          translateX = - index * slideWidth + distX;
          translateX = Math.max(min, Math.min( translateX, max));

          if (getTransform) {
            slideContainer.style[getTransform] = 'translate3d(' + translateX + 'px, 0, 0)';
          } else {
            slideContainer.style.left = translateX + 'px';
          }

          e.preventDefault();
        }
      };
    }

    function onPanEnd() {
      return function (e) {
        var touchObj = e.changedTouches[0];
        distX = parseInt(touchObj.clientX) - startX;

        if (run && distX !== 0) {
          e.preventDefault();
          run = false;
          translateX = - index * slideWidth + distX;

          var indexTem,
              min = (!loop) ? 0 : -itemsMax,
              max = (!loop) ? slideCount - items : slideCount + itemsMax - items;

          indexTem = - (translateX / slideWidth);
          indexTem = (distX < 0) ? Math.ceil(indexTem) : Math.floor(indexTem);
          indexTem = Math.max(min, Math.min(indexTem, max));
          index = indexTem;

          setTransitionDuration(1);
          translate();

          setTimeout(function () {
            update();
          }, speed);
        }
      };
    }
    
    return {
      // initialize:
      // 1. add .tiny-content to container
      // 2. wrap container with .tiny-slider
      // 3. add dots and nav if needed, set allDots, prevButton, nextButton
      // 4. clone items for loop if needed, update childrenCount
      init: function () {
        slideContainer.classList.add('tiny-content');

        // wrap slider with ".tiny-slider"
        var sliderWrapper = document.createElement('div');
        sliderWrapper.className = 'tiny-slider';
        gn.wrap(slideContainer, sliderWrapper);

        // for IE10
        if (navigator.msMaxTouchPoints) {
          sliderWrapper.classList.add('ms-touch');

          sliderWrapper.addEventListener('scroll', function () {
            if (getTD) { slideContainer.style[getTD] = '0s'; }
            slideContainer.style.transform = 'translate3d(-' + - slideContainer.scrollLeft() + 'px,0,0)';
          });
        }

        // add dots
        if (dots) {
          if (dotsContainer) {
            allDots = dotsContainer.children;
            allDots[0].classList.add('tiny-active');
          } else {
            var dotHtml = '';
            for (var i = slideCount; i--;) {
              dotHtml += '<button class="tiny-dot" type="button"></button>';
            }
            dotHtml = '<div class="tiny-dots">' + dotHtml + '</div>';
            gn.append(sliderWrapper, dotHtml);

            allDots = sliderWrapper.querySelectorAll('.tiny-dot');
          }
          dotsCount = allDots.length;
        }

        // add nav
        if (nav) {
          if (navContainer) {
            prevButton = navContainer.firstElementChild;
            nextButton = navContainer.lastElementChild;
          } else {
            gn.append(sliderWrapper, '<div class="tiny-nav"><button class="tiny-prev" type="button">' + navText[0] + '</button><button class="tiny-next" type="button">' + navText[1] + '</button></div>');

            prevButton = sliderWrapper.querySelector('.tiny-prev');
            nextButton = sliderWrapper.querySelector('.tiny-next');
          }
        }

        // add auto
        if (autoplay) {
          if (autoContainer) {
            startButton = autoContainer.firstElementChild;
            stopButton = autoContainer.lastElementChild;
          } else {
            gn.append(sliderWrapper, '<div class="tiny-auto"><button class="tiny-start" type="button">' + autoText[0] + '</button><button class="tiny-stop" type="button">' + autoText[1] + '</button></div>');

            startButton = sliderWrapper.querySelector('.tiny-start');
            stopButton = sliderWrapper.querySelector('.tiny-stop');
          }
        }

        // clone items
        if (loop) {
          var fragmentBefore = document.createDocumentFragment(), 
              fragmentAfter = document.createDocumentFragment(); 

          for (var j = itemsMax; j--;) {
            var 
                cloneFirst = slideItems[j].cloneNode(true),
                cloneLast = slideItems[slideCount - 1 - j].cloneNode(true);

            fragmentBefore.insertBefore(cloneFirst, fragmentBefore.firstChild);
            fragmentAfter.appendChild(cloneLast);
          }

          slideContainer.appendChild(fragmentBefore);
          slideContainer.insertBefore(fragmentAfter, slideContainer.firstChild);

          slideCountUpdated = slideContainer.children.length;
          slideItems = slideContainer.children;
        }

        updateLayout();
        if (autoHeight) {
          updateContainerHeight();
        }
        setSnapInterval();
        translate();
        activeSlide();
        if (nav) {
          disableNav();
          nextButton.addEventListener('click', function () { onNavClick(1); });
          prevButton.addEventListener('click', function () { onNavClick(-1); });
        }

        displayDots();
        activeDot();
        if (dots) {
          for (var a = 0; a < dotsCount; a++) {
            allDots[a].addEventListener('click', fireDotClick(), false);
          }
        }

        if (lazyload) { lazyLoad(); }

        if (arrowKeys) {
          document.addEventListener('keydown', function (e) {
            e = e || window.event;
            if (e.keyCode === 37) {
              onNavClick(-1);
            } else if (e.keyCode === 39) {
              onNavClick(1);
            }
          });
        }

        if (autoplay) {
          var autoplayTimer;

          function startScroll() {
            autoplayTimer = setInterval(function () {
              onNavClick(autoplayDirection);
            }, autoplayTimeout);
          }
          startScroll();

          function stopScroll() {
            clearInterval(autoplayTimer);
          }

          startButton.addEventListener('click', startScroll, false );
          stopButton.addEventListener('click', stopScroll, false );

          if (nav) {
            prevButton.addEventListener('click', stopScroll, false );
            nextButton.addEventListener('click', stopScroll, false );
          }

          if (dots) {
            for (var a = 0; a < dotsCount; a++) {
              allDots[a].addEventListener('click', stopScroll, false);
            }
          }
        }

        if (touch) {
          if (!slideEventAdded && slideContainer.addEventListener) {
            slideContainer.addEventListener('touchstart', onPanStart(), false);
            slideContainer.addEventListener('touchmove', onPanMove(), false);
            slideContainer.addEventListener('touchend', onPanEnd(), false);
            slideContainer.addEventListener('touchcancel', onPanEnd(), false);

            slideEventAdded = true;
          }
        }

        // on window resize
        var resizeTimer;
        window.addEventListener('resize', function () {
          clearTimeout(resizeTimer);

          // update after resize done
          resizeTimer = setTimeout(function () {
            items = getItems();
            slideWidth = getSlideWidth();
            dotsCountVisible = getDotsCount();

            updateLayout();
            setSnapInterval();
            translate();
            displayDots();
            disableNav();
            activeDot();
            if (autoHeight) {
              updateContainerHeight();
            }
            if (lazyload) {
              lazyLoad();
            }
          }, 100);
        });

        // on window scroll
        var ticking = false;
        window.addEventListener('scroll', function () {
          if (!ticking) {
            window.requestAnimationFrame(function() {
              if (lazyload) { lazyLoad(); }
              ticking = false;
            });
          }
          ticking = true;
        });
      }
    };
  }


  // === Private helper functions === //
  function toDegree (angle) {
    return angle * (180 / Math.PI);
  }

  function getPanDir(angle, range) {
    if ( Math.abs(90 - Math.abs(angle)) >= (90 - range) ) {
      return 'horizontal';
    } else if ( Math.abs(90 - Math.abs(angle)) <= range ) {
      return 'vertical';
    } else {
      return false;
    }
  }

  function getMapValues (obj) {
    if (typeof(obj) === 'object') {
      var values = [],
          keys = Object.keys(obj);

      for (var i = 0, l = keys.length; i < l; i++) {
        var a = keys[i];
        values.push(obj[a]);
      }

      return values;
    } else {
      return false;
    }
  }

  return core;
})();

/**
  * tiny-slider
  * @version 0.3.1
  * @author William Lin
  * @license The MIT License (MIT)
  * @github https://github.com/ganlanyuan/tiny-slider/
  */

// @codekit-prepend "tiny-slider.helper.js";
// @codekit-prepend "tiny-slider.native.js";

