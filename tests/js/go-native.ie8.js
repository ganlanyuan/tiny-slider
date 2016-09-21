/**
* @preserve HTML5 Shiv 3.7.3 | @afarkas @jdalton @jon_neal @rem | MIT/GPL2 Licensed
*/
;(function(window, document) {
/*jshint evil:true */
  /** version */
  var version = '3.7.3';

  /** Preset options */
  var options = window.html5 || {};

  /** Used to skip problem elements */
  var reSkip = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i;

  /** Not all elements can be cloned in IE **/
  var saveClones = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i;

  /** Detect whether the browser supports default html5 styles */
  var supportsHtml5Styles;

  /** Name of the expando, to work with multiple documents or to re-shiv one document */
  var expando = '_html5shiv';

  /** The id for the the documents expando */
  var expanID = 0;

  /** Cached data for each document */
  var expandoData = {};

  /** Detect whether the browser supports unknown elements */
  var supportsUnknownElements;

  (function() {
    try {
        var a = document.createElement('a');
        a.innerHTML = '<xyz></xyz>';
        //if the hidden property is implemented we can assume, that the browser supports basic HTML5 Styles
        supportsHtml5Styles = ('hidden' in a);

        supportsUnknownElements = a.childNodes.length == 1 || (function() {
          // assign a false positive if unable to shiv
          (document.createElement)('a');
          var frag = document.createDocumentFragment();
          return (
            typeof frag.cloneNode == 'undefined' ||
            typeof frag.createDocumentFragment == 'undefined' ||
            typeof frag.createElement == 'undefined'
          );
        }());
    } catch(e) {
      // assign a false positive if detection fails => unable to shiv
      supportsHtml5Styles = true;
      supportsUnknownElements = true;
    }

  }());

  /*--------------------------------------------------------------------------*/

  /**
   * Creates a style sheet with the given CSS text and adds it to the document.
   * @private
   * @param {Document} ownerDocument The document.
   * @param {String} cssText The CSS text.
   * @returns {StyleSheet} The style element.
   */
  function addStyleSheet(ownerDocument, cssText) {
    var p = ownerDocument.createElement('p'),
        parent = ownerDocument.getElementsByTagName('head')[0] || ownerDocument.documentElement;

    p.innerHTML = 'x<style>' + cssText + '</style>';
    return parent.insertBefore(p.lastChild, parent.firstChild);
  }

  /**
   * Returns the value of `html5.elements` as an array.
   * @private
   * @returns {Array} An array of shived element node names.
   */
  function getElements() {
    var elements = html5.elements;
    return typeof elements == 'string' ? elements.split(' ') : elements;
  }

  /**
   * Extends the built-in list of html5 elements
   * @memberOf html5
   * @param {String|Array} newElements whitespace separated list or array of new element names to shiv
   * @param {Document} ownerDocument The context document.
   */
  function addElements(newElements, ownerDocument) {
    var elements = html5.elements;
    if(typeof elements != 'string'){
      elements = elements.join(' ');
    }
    if(typeof newElements != 'string'){
      newElements = newElements.join(' ');
    }
    html5.elements = elements +' '+ newElements;
    shivDocument(ownerDocument);
  }

   /**
   * Returns the data associated to the given document
   * @private
   * @param {Document} ownerDocument The document.
   * @returns {Object} An object of data.
   */
  function getExpandoData(ownerDocument) {
    var data = expandoData[ownerDocument[expando]];
    if (!data) {
        data = {};
        expanID++;
        ownerDocument[expando] = expanID;
        expandoData[expanID] = data;
    }
    return data;
  }

  /**
   * returns a shived element for the given nodeName and document
   * @memberOf html5
   * @param {String} nodeName name of the element
   * @param {Document|DocumentFragment} ownerDocument The context document.
   * @returns {Object} The shived element.
   */
  function createElement(nodeName, ownerDocument, data){
    if (!ownerDocument) {
        ownerDocument = document;
    }
    if(supportsUnknownElements){
        return ownerDocument.createElement(nodeName);
    }
    if (!data) {
        data = getExpandoData(ownerDocument);
    }
    var node;

    if (data.cache[nodeName]) {
        node = data.cache[nodeName].cloneNode();
    } else if (saveClones.test(nodeName)) {
        node = (data.cache[nodeName] = data.createElem(nodeName)).cloneNode();
    } else {
        node = data.createElem(nodeName);
    }

    // Avoid adding some elements to fragments in IE < 9 because
    // * Attributes like `name` or `type` cannot be set/changed once an element
    //   is inserted into a document/fragment
    // * Link elements with `src` attributes that are inaccessible, as with
    //   a 403 response, will cause the tab/window to crash
    // * Script elements appended to fragments will execute when their `src`
    //   or `text` property is set
    return node.canHaveChildren && !reSkip.test(nodeName) && !node.tagUrn ? data.frag.appendChild(node) : node;
  }

  /**
   * returns a shived DocumentFragment for the given document
   * @memberOf html5
   * @param {Document} ownerDocument The context document.
   * @returns {Object} The shived DocumentFragment.
   */
  function createDocumentFragment(ownerDocument, data){
    if (!ownerDocument) {
        ownerDocument = document;
    }
    if(supportsUnknownElements){
        return ownerDocument.createDocumentFragment();
    }
    data = data || getExpandoData(ownerDocument);
    var clone = data.frag.cloneNode(),
        i = 0,
        elems = getElements(),
        l = elems.length;
    for(;i<l;i++){
        clone.createElement(elems[i]);
    }
    return clone;
  }

  /**
   * Shivs the `createElement` and `createDocumentFragment` methods of the document.
   * @private
   * @param {Document|DocumentFragment} ownerDocument The document.
   * @param {Object} data of the document.
   */
  function shivMethods(ownerDocument, data) {
    if (!data.cache) {
        data.cache = {};
        data.createElem = ownerDocument.createElement;
        data.createFrag = ownerDocument.createDocumentFragment;
        data.frag = data.createFrag();
    }


    ownerDocument.createElement = function(nodeName) {
      //abort shiv
      if (!html5.shivMethods) {
          return data.createElem(nodeName);
      }
      return createElement(nodeName, ownerDocument, data);
    };

    ownerDocument.createDocumentFragment = Function('h,f', 'return function(){' +
      'var n=f.cloneNode(),c=n.createElement;' +
      'h.shivMethods&&(' +
        // unroll the `createElement` calls
        getElements().join().replace(/[\w\-:]+/g, function(nodeName) {
          data.createElem(nodeName);
          data.frag.createElement(nodeName);
          return 'c("' + nodeName + '")';
        }) +
      ');return n}'
    )(html5, data.frag);
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Shivs the given document.
   * @memberOf html5
   * @param {Document} ownerDocument The document to shiv.
   * @returns {Document} The shived document.
   */
  function shivDocument(ownerDocument) {
    if (!ownerDocument) {
        ownerDocument = document;
    }
    var data = getExpandoData(ownerDocument);

    if (html5.shivCSS && !supportsHtml5Styles && !data.hasCSS) {
      data.hasCSS = !!addStyleSheet(ownerDocument,
        // corrects block display not defined in IE6/7/8/9
        'article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}' +
        // adds styling not present in IE6/7/8/9
        'mark{background:#FF0;color:#000}' +
        // hides non-rendered elements
        'template{display:none}'
      );
    }
    if (!supportsUnknownElements) {
      shivMethods(ownerDocument, data);
    }
    return ownerDocument;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * The `html5` object is exposed so that more elements can be shived and
   * existing shiving can be detected on iframes.
   * @type Object
   * @example
   *
   * // options can be changed before the script is included
   * html5 = { 'elements': 'mark section', 'shivCSS': false, 'shivMethods': false };
   */
  var html5 = {

    /**
     * An array or space separated string of node names of the elements to shiv.
     * @memberOf html5
     * @type Array|String
     */
    'elements': options.elements || 'abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output picture progress section summary template time video',

    /**
     * current version of html5shiv
     */
    'version': version,

    /**
     * A flag to indicate that the HTML5 style sheet should be inserted.
     * @memberOf html5
     * @type Boolean
     */
    'shivCSS': (options.shivCSS !== false),

    /**
     * Is equal to true if a browser supports creating unknown/HTML5 elements
     * @memberOf html5
     * @type boolean
     */
    'supportsUnknownElements': supportsUnknownElements,

    /**
     * A flag to indicate that the document's `createElement` and `createDocumentFragment`
     * methods should be overwritten.
     * @memberOf html5
     * @type Boolean
     */
    'shivMethods': (options.shivMethods !== false),

    /**
     * A string to describe the type of `html5` object ("default" or "default print").
     * @memberOf html5
     * @type String
     */
    'type': 'default',

    // shivs the document according to the specified `html5` object options
    'shivDocument': shivDocument,

    //creates a shived element
    createElement: createElement,

    //creates a shived documentFragment
    createDocumentFragment: createDocumentFragment,

    //extends list of elements
    addElements: addElements
  };

  /*--------------------------------------------------------------------------*/

  // expose html5
  window.html5 = html5;

  // shiv the document
  shivDocument(document);

  if(typeof module == 'object' && module.exports){
    module.exports = html5;
  }

}(typeof window !== "undefined" ? window : this, document));


/**
 * Adds support to IE8 for the following properties:
 *
 *     Element.childElementCount
 *     Element.firstElementChild
 *     Element.lastElementChild
 *     Element.nextElementSibling
 *     Element.previousElementSibling
 */
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


/** window.pageXOffset / window.pageYOffset */
if(!("pageXOffset" in window)) (function(){
	var x = function(){ return (document.documentElement || document.body.parentNode || document.body).scrollLeft; };
	var y = function(){ return (document.documentElement || document.body.parentNode || document.body).scrollTop;  };
	Object.defineProperty(window, "pageXOffset", {get: x});
	Object.defineProperty(window, "pageYOffset", {get: y});
	Object.defineProperty(window, "scrollX",     {get: x});
	Object.defineProperty(window, "scrollY",     {get: y});
}());

/** window.innerWidth / window.innerHeight */
if(!("innerWidth" in window)){
	Object.defineProperty(window, "innerWidth",  {get: function(){ return (document.documentElement || document.body.parentNode || document.body).clientWidth; }});
	Object.defineProperty(window, "innerHeight", {get: function(){ return (document.documentElement || document.body.parentNode || document.body).clientHeight; }});
}

/** event.pageX / event.pageY */
if(!window.MouseEvent && !("pageX" in Event.prototype)){
	Object.defineProperty(Event.prototype, "pageX", {get: function(){ return this.clientX + window.pageXOffset; }});
	Object.defineProperty(Event.prototype, "pageY", {get: function(){ return this.clientY + window.pageYOffset; }});
}


(function(){
	"use strict";
	
	if(!("textContent" in Element.prototype)){
		var interfaces = "Element Text HTMLDocument HTMLCommentElement".split(" ");
		var haveText   = {3:1, 8:1, 4:1, 7:1};
		var haveNull   = {9:1, 10:1, 12:1};
		var srcTags    = {SCRIPT:1, STYLE:1};
		for(var I, i = 0; i < 4; ++i){
			I = window[interfaces[i]];
			I && Object.defineProperty(I.prototype, "textContent", {
				get: function(){ return getText(this); },
				set: function(input){
					var type = this.nodeType;
					
					/** Text nodes: set nodeValue */
					if(haveText[type])
						this.nodeValue = input;
					
					/** For everything that isn't a document, DOCTYPE or notation */
					else if(!haveNull[type]){
						var name = this.nodeName;
						
						/** IE8 throws a runtime error trying to set the innerHTML of a <style> element */
						if("STYLE" === name)
							this.styleSheet.cssText = input;
						
						/** Scripts have a similar issue */
						else if(srcTags[name])
							this.text = input;
						
						else this.innerText = input;
					}
				},
			});
		}
		
		
		function getText(node){
			var type = node.nodeType;
			
			/** Return `nodeValue` if input is a text node, comment, CDATA section, or processing instruction */
			if(haveText[type])
				return node.nodeValue;
			
			/** Return null for documents, DOCTYPE declarations, and notations */
			if(haveNull[type])
				return null;
			
			/** Use the innerHTML property of <script> and <style> tags */
			var name = node.nodeName;
			if(name && srcTags[name])
				return node.innerHTML;
			
			
			/** Everything else: Concatenate the textContent of each child node, except comments and processing instructions */
			var result   = "";
			var children = node.childNodes;
			for(var i = 0, l = children.length; i < l; ++i){
				var child = children[i];
				if(child.nodeType !== 7 && child.nodeType !== 8)
					result += child.textContent;
			}
			
			return result;
		}
	}	
}());


window.getComputedStyle = window.getComputedStyle || function(el){
	if(!el) return null;
	
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
	for(var i in style)
		output[i] = style[i];
	
	/** Fix some glitches */
	output.cssFloat = output.styleFloat;
	if("auto" === output.width)  output.width  = (box.right - box.left) + "px";
	if("auto" === output.height) output.height = (box.bottom - box.top) + "px";
	return output;
};


/**
 * Polyfills for Array methods defined in ECMA-262, 5th edition (ES5).
 *
 * All implementations taken from the Mozilla Developer Network, with
 * inline annotations removed and shit indentation corrected (dear world:
 * stop using 2-space tabs, SERIOUSLY.)
 */


/** Every */
if(!Array.prototype.every){
	
	Array.prototype.every = function(fn, thisArg){
		"use strict";
		var T, k;
		
		if(this == null)
			throw new TypeError("'this' is null or not defined");
		
		var O = Object(this);
		var l = O.length >>> 0;
		if("function" !== typeof fn)
			throw new TypeError();
		
		if(arguments.length > 1)
			T = thisArg;
		
		k = 0;
		while (k < l){
			var kValue;
			if(k in O){
				kValue = O[k];
				var testResult = fn.call(T, kValue, k, O);
				if(!testResult) return false;
			}
			k++;
		}
		return true;
	};
}




/** Filter */
if(!Array.prototype.filter){	
	Array.prototype.filter = function(fn){
		"use strict";
		
		if(this === void 0 || this === null)
			throw new TypeError();
		
		var t      = Object(this);
		var length = t.length >>> 0;
		if("function" !== typeof fn)
			throw new TypeError();
		
		var res = [];
		var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
		for(var val, i = 0; i < length; i++){
			if(i in t){
				if(fn.call(thisArg, val = t[i], i, t))
					res.push(val);
			}
		}
		
		return res;
	};
}



/** forEach */
if(!Array.prototype.forEach){

	Array.prototype.forEach = function(callback, thisArg){
		var T, k;
		
		if(this === null)
			throw new TypeError(" this is null or not defined");
		
		var O = Object(this);
		var l = O.length >>> 0;
		
		if("function" !== typeof callback)
			throw new TypeError(callback + " is not a function");
		
		if(arguments.length > 1)
			T = thisArg;
		
		k = 0;
		while(k < l){
			var kValue;
			if(k in O){
				kValue = O[k];
				callback.call(T, kValue, k, O);
			}
			k++;
		}
	};
}



/** indexOf */
if(!Array.prototype.indexOf){
	
	Array.prototype.indexOf = function(searchElement, fromIndex){
		var k;
		
		if(this == null)
			throw new TypeError('"this" is null or not defined');
		
		var o = Object(this);
		var l = o.length >>> 0;
		if(l === 0)
			return -1;
		
		var n = +fromIndex || 0;
		if(Math.abs(n) === Infinity)
			n = 0;
		
		if(n >= l)
			return -1;
		k = Math.max(n >= 0 ? n : l - Math.abs(n), 0);
		
		while(k < l){
			if(k in o && o[k] === searchElement)
				return k;
			k++;
		}
		return -1;
	};
}



/** lastIndexOf */
if(!Array.prototype.lastIndexOf){
	
	Array.prototype.lastIndexOf = function(searchElement){
		"use strict";
		
		if(this === void 0 || this === null)
			throw new TypeError();
		
		var n, k,
		t   = Object(this),
		len = t.length >>> 0;
		
		if(len === 0)
			return -1;
		
		n = len - 1;
		if(arguments.length > 1){
			n = Number(arguments[1]);
			if(n != n) n = 0;
			else if(n != 0 && n != (1 / 0) && n != -(1 / 0))
				n = (n > 0 || -1) * Math.floor(Math.abs(n));
		}
		
		for(k = n >= 0 ? Math.min(n, len - 1) : len - Math.abs(n); k >= 0; k--)
			if(k in t && t[k] === searchElement) return k;
		return -1;
	};
}



/** Map */
if(!Array.prototype.map){
	
	Array.prototype.map = function(fn, thisArg){
		var T, A, k;
		
		if(this == null)
			throw new TypeError('"this" is null or not defined');
		
		var O = Object(this);
		var l = O.length >>> 0;
		
		if("function" !== typeof fn)
			throw new TypeError(fn + " is not a function");
		
		if(arguments.length > 1)
			T = thisArg;
		
		A = new Array(l);
		k = 0;
		while (k < l){
			var kValue, mappedValue;
			if(k in O){
				kValue = O[k];
				mappedValue = fn.call(T, kValue, k, O);
				A[k] = mappedValue;
			}
			k++;
		}
		
		return A;
	};
}



/** Reduce */
if(!Array.prototype.reduce){
	Array.prototype.reduce = function(fn){
		"use strict";
		
		if(this == null)
			throw new TypeError("Array.prototype.reduce called on null or undefined");
		
		if("function" !== typeof fn)
			throw new TypeError(fn + " is not a function");
		
		var t = Object(this), len = t.length >>> 0, k = 0, value;
		if(2 === arguments.length)
			value = arguments[1];
		
		else{
			while(k < len && !(k in t)) k++;
			if(k >= len)
				throw new TypeError("Reduce of empty array with no initial value");
			value = t[k++];
		}
		
		for(; k < len; k++)
			if(k in t) value = fn(value, t[k], k, t);
		
		return value;
	};
}



/** reduceRight */
if(!Array.prototype.reduceRight){
	
	Array.prototype.reduceRight = function(fn){
		"use strict";
		
		if(null == this)
			throw new TypeError("Array.prototype.reduce called on null or undefined");
		
		if("function" !== typeof fn)
			throw new TypeError(fn + " is not a function");
		
		var t = Object(this), len = t.length >>> 0, k = len - 1, value;
		if(arguments.length >= 2)
			value = arguments[1];
		
		else{
			while(k >= 0 && !(k in t)) k--;
			if(k < 0)
				throw new TypeError("Reduce of empty array with no initial value");
			value = t[k--];
		}
		
		for(; k >= 0; k--)
			if(k in t) value = fn(value, t[k], k, t);
		return value;
	};
}



/** Some */
if(!Array.prototype.some){
	
	Array.prototype.some = function(fn){
		"use strict";
		
		if(this == null)
			throw new TypeError("Array.prototype.some called on null or undefined");
		
		if(typeof fn !== "function")
			throw new TypeError();
		
		var t = Object(this);
		var l = t.length >>> 0;
		var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
		for(var i = 0; i < l; i++)
			if(i in t && fn.call(thisArg, t[i], i, t)) return true;
		return false;
	};
}


/**
 * ES5 Function bind
 *
 *https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind#Compatibility
 *
 */
if (!Function.prototype.bind) {
  Function.prototype.bind = function(oThis) {
    if (typeof this !== 'function') {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
    }

    var aArgs   = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP    = function() {},
        fBound  = function() {
          return fToBind.apply(this instanceof fNOP
                 ? this
                 : oThis,
                 aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    if (this.prototype) {
      // Function.prototype doesn't have a prototype property
      fNOP.prototype = this.prototype; 
    }
    fBound.prototype = new fNOP();

    return fBound;
  };
}

/** 
  * Object.keys polyfill 
  * from Token Posts
  * http://tokenposts.blogspot.com.au/2012/04/javascript-objectkeys-browser.html
  */
if (!Object.keys) {
  Object.keys = function(o) {
    if (o !== Object(o)) { throw new TypeError('Object.keys called on a non-object'); }
    var k=[],p;
    for (p in o) {
      if (Object.prototype.hasOwnProperty.call(o,p)) { k.push(p); }
    }
    return k;
  };
}

/**
 * IE8 preventDefault
 *
 *https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener?redirectlocale=en-US&redirectslug=DOM%2FEventTarget.addEventListener#Compatibility
 *
 */
(function() {
  if (!Event.prototype.preventDefault) {
    Event.prototype.preventDefault=function() {
      this.returnValue=false;
    };
  }
})();

/**
 * IE8 stopPropagation
 *
 *https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener?redirectlocale=en-US&redirectslug=DOM%2FEventTarget.addEventListener#Compatibility
 *
 */
(function() {
  if (!Event.prototype.stopPropagation) {
    Event.prototype.stopPropagation=function() {
      this.cancelBubble=true;
    };
  }
})();

/**
 * IE8 
 * addEventListener
 * removeEventListener
 *
 *https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener?redirectlocale=en-US&redirectslug=DOM%2FEventTarget.addEventListener#Compatibility
 *
 */
(function() {
  if (!Element.prototype.addEventListener) {
    var eventListeners=[];
    
    var addEventListener=function(type,listener /*, useCapture (will be ignored) */) {
      var self=this;
      var wrapper=function(e) {
        e.target=e.srcElement;
        e.currentTarget=self;
        if (typeof listener.handleEvent != 'undefined') {
          listener.handleEvent(e);
        } else {
          listener.call(self,e);
        }
      };
      if (type=="DOMContentLoaded") {
        var wrapper2=function(e) {
          if (document.readyState=="complete") {
            wrapper(e);
          }
        };
        document.attachEvent("onreadystatechange",wrapper2);
        eventListeners.push({object:this,type:type,listener:listener,wrapper:wrapper2});
        
        if (document.readyState=="complete") {
          var e=new Event();
          e.srcElement=window;
          wrapper2(e);
        }
      } else {
        this.attachEvent("on"+type,wrapper);
        eventListeners.push({object:this,type:type,listener:listener,wrapper:wrapper});
      }
    };
    var removeEventListener=function(type,listener /*, useCapture (will be ignored) */) {
      var counter=0;
      while (counter<eventListeners.length) {
        var eventListener=eventListeners[counter];
        if (eventListener.object==this && eventListener.type==type && eventListener.listener==listener) {
          if (type=="DOMContentLoaded") {
            this.detachEvent("onreadystatechange",eventListener.wrapper);
          } else {
            this.detachEvent("on"+type,eventListener.wrapper);
          }
          eventListeners.splice(counter, 1);
          break;
        }
        ++counter;
      }
    };
    Element.prototype.addEventListener=addEventListener;
    Element.prototype.removeEventListener=removeEventListener;
    if (HTMLDocument) {
      HTMLDocument.prototype.addEventListener=addEventListener;
      HTMLDocument.prototype.removeEventListener=removeEventListener;
    }
    if (Window) {
      Window.prototype.addEventListener=addEventListener;
      Window.prototype.removeEventListener=removeEventListener;
    }
  }
})();

/*!
 * NWMatcher 1.2.3 - Fast CSS3 Selector Engine
 * Copyright (C) 2007-2010 Diego Perini
 * See http://nwbox.com/license
 */
(function(s){var ct='nwmatcher-1.2.3',i=s.document,n=i.documentElement,M=Array.prototype.slice,bn='',B='',bo='',bp='',U=false,N=false,bq=i,br=i,V='[.:#]?',bL='([~*^$|!]?={1})',x='[\\x20\\t\\n\\r\\f]*',bM='[\\x20]|[>+~][^>+~]',bN='[-+]?\\d*n?[-+]?\\d*',W='"[^"]*"'+"|'[^']*'",p='(?:[-\\w]|[^\\x00-\\xa0]|\\\\.)+',C='(?:-?[_a-zA-Z]{1}[-\\w]*|[^\\x00-\\xa0]+|\\\\.+)+',F=x+'('+p+':?'+p+')'+x+'(?:'+bL+x+'('+W+'|'+C+'))?'+x,X='((?:'+bN+'|'+W+'|'+V+'|'+p+'|\\['+F+'\\]|\\(.+\\)|'+x+'|,)+)',bO='.+',Y='(?=\s*[^>+~(){}<>])(\\*|(?:'+V+C+')|'+bM+'|\\['+F+'\\]|\\('+X+'\\)|\\{'+bO+'\\}|,)+',O=new RegExp(Y,'g'),bP=Y.replace(X,'.*'),P=new RegExp('^'+x+'|'+x+'$','g'),bQ=new RegExp('^((?!:not)('+V+'|'+C+'|\\([^()]*\\))+|\\['+F+'\\])$'),bR='\\([^()]+\\)|\\(.*\\)',bS='\\{[^{}]+\\}|\\{.*\\}',bT='\\[[^[\\]]*\\]|\\[.*\\]',Z='\\[.*\\]|\\(.*\\)|\\{.*\\}',ba=new RegExp('([^(,)\\\\\\[\\]]+|\\[(?:'+bT+'|'+W+'|[^\\[\\]]+)+\\]|'+bR+'|'+bS+'|\\\\.)+','g'),bU=new RegExp('(\\('+X+'\\)|\\['+F+'\\]|[^\x20>+~]|\\\\.)+','g'),bs=new RegExp('('+C+')'),cu=new RegExp('#('+C+')'),bt=/[\x20\t\n\r\f]+/g,bV=/^\s*[>+~]{1}/,bW=/[>+~]{1}\s*$/,y=(function(){var k=(s.open+'').replace(/open/g,'');return function(b,a){var c=b?b[a]:false,f=new RegExp(a,'g');return!!(c&&typeof c!='string'&&k===(c+'').replace(f,''))}})(),G=function(c){return typeof c.compatMode=='string'?c.compatMode.indexOf('CSS')<0:(function(){var b=c.createElement('div'),a=b.style&&(b.style.width=1)&&b.style.width!='1px';b=null;return!a})()},Q='xmlVersion'in i?function(b){return!!b.xmlVersion||(/xml$/).test(b.contentType)||!(/html/i).test(b.documentElement.nodeName)}:function(b){return b.firstChild.nodeType==7&&(/xml/i).test(b.firstChild.nodeName)||!(/html/i).test(b.documentElement.nodeName)},H=G(i),o=Q(i),bX=y(i,'hasFocus'),bb=y(i,'querySelector'),bY=y(i,'getElementById'),bZ=y(n,'getElementsByTagName'),bu=y(n,'getElementsByClassName'),ca=y(n,'getAttribute'),cb=y(n,'hasAttribute'),bc=(function(){var b=false,a=n.id;n.id='length';try{b=!!M.call(i.childNodes,0)[0]}catch(e){}n.id=a;return b})(),bv='nextElementSibling'in n&&'previousElementSibling'in n,cc=bY?(function(){var b=true,a='x'+String(+new Date),c=i.createElementNS?'a':'<a name="'+a+'">';(c=i.createElement(c)).name=a;n.insertBefore(c,n.firstChild);b=!!i.getElementById(a);n.removeChild(c);c=null;return b})():true,bw=bZ?(function(){var b,a=i.createElement('div');a.appendChild(i.createComment(''));b=a.getElementsByTagName('*')[0];a.removeChild(a.firstChild);a=null;return!!b})():true,bx=bu?(function(){var b,a=i.createElement('div'),c='\u53f0\u5317';a.appendChild(i.createElement('span')).setAttribute('class',c+'abc '+c);a.appendChild(i.createElement('span')).setAttribute('class','x');b=!a.getElementsByClassName(c)[0];a.lastChild.className=c;if(!b)b=a.getElementsByClassName(c).length!==2;a.removeChild(a.firstChild);a.removeChild(a.firstChild);a=null;return b})():true,cd=ca?(function(){var b,a;(a=i.createElement('input')).setAttribute('value','5');return b=a.defaultValue!=5})():true,by=cb?(function(){var b,a=i.createElement('option');a.setAttribute('selected','selected');b=!a.hasAttribute('selected');return b})():true,ce=bb?(function(){var b=[],a=i.createElement('div'),c;a.appendChild(i.createElement('p')).setAttribute('class','xXx');a.appendChild(i.createElement('p')).setAttribute('class','xxx');if(G(i)&&(a.querySelectorAll('[class~=xxx]').length!=2||a.querySelectorAll('.xXx').length!=2)){b.push('(?:\\[[\\x20\\t\\n\\r\\f]*class\\b|\\.'+C+')')}a.removeChild(a.firstChild);a.removeChild(a.firstChild);a.appendChild(i.createElement('p')).setAttribute('class','');try{a.querySelectorAll('[class^=""]').length===1&&b.push('\\[\\s*.*(?=\\^=|\\$=|\\*=).*]')}catch(e){}a.removeChild(a.firstChild);c=i.createElement('input');c.setAttribute('type','checkbox');c.setAttribute('checked','checked');a.appendChild(c);try{a.querySelectorAll(':checked').length!==1&&b.push(':checked')}catch(e){}a.removeChild(a.firstChild);(c=i.createElement('input')).setAttribute('type','hidden');a.appendChild(c);try{a.querySelectorAll(':enabled').length===1&&b.push(':enabled',':disabled')}catch(e){}a.removeChild(a.firstChild);a.appendChild(i.createElement('a')).setAttribute('href','x');a.querySelectorAll(':link').length!==1&&b.push(':link');a.removeChild(a.firstChild);if(by){b.push('\\[\\s*value','\\[\\s*ismap','\\[\\s*checked','\\[\\s*disabled','\\[\\s*multiple','\\[\\s*readonly','\\[\\s*selected')}a=null;return b.length?new RegExp(b.join('|')):{'test':function(){return false}}})():true,cf=new RegExp(!(bw&&bx)?'^(?:\\*|[.#]?-?[_a-zA-Z]{1}'+p+')$':'^#?-?[_a-zA-Z]{1}'+p+'$'),cg={'a':1,'A':1,'area':1,'AREA':1,'link':1,'LINK':1},ch={'9':1,'11':1},ci={checked:1,disabled:1,ismap:1,multiple:1,readonly:1,selected:1},R={value:'defaultValue',checked:'defaultChecked',selected:'defaultSelected'},bz={'class':'className','for':'htmlFor'},cj={'action':2,'cite':2,'codebase':2,'data':2,'href':2,'longdesc':2,'lowsrc':2,'src':2,'usemap':2},bA={'class':0,'accept':1,'accept-charset':1,'align':1,'alink':1,'axis':1,'bgcolor':1,'charset':1,'checked':1,'clear':1,'codetype':1,'color':1,'compact':1,'declare':1,'defer':1,'dir':1,'direction':1,'disabled':1,'enctype':1,'face':1,'frame':1,'hreflang':1,'http-equiv':1,'lang':1,'language':1,'link':1,'media':1,'method':1,'multiple':1,'nohref':1,'noresize':1,'noshade':1,'nowrap':1,'readonly':1,'rel':1,'rev':1,'rules':1,'scope':1,'scrolling':1,'selected':1,'shape':1,'target':1,'text':1,'type':1,'valign':1,'valuetype':1,'vlink':1},ck={'accept':1,'accept-charset':1,'alink':1,'axis':1,'bgcolor':1,'charset':1,'codetype':1,'color':1,'enctype':1,'face':1,'hreflang':1,'http-equiv':1,'lang':1,'language':1,'link':1,'media':1,'rel':1,'rev':1,'target':1,'text':1,'type':1,'vlink':1},z={},S={'=':"n=='%m'",'^=':"n.indexOf('%m')==0",'*=':"n.indexOf('%m')>-1",'|=':"(n+'-').indexOf('%m-')==0",'~=':"(' '+n+' ').indexOf(' %m ')>-1",'$=':"n.substr(n.length-'%m'.length)=='%m'"},D={ID:new RegExp('^#('+p+')|'+Z),TAG:new RegExp('^('+p+')|'+Z),CLASS:new RegExp('^\\.('+p+'$)|'+Z),NAME:/\[\s*name\s*=\s*((["']*)([^'"()]*?)\2)?\s*\]/},q={spseudos:/^\:(root|empty|nth)?-?(first|last|only)?-?(child)?-?(of-type)?(?:\(([^\x29]*)\))?(.*)/,dpseudos:/^\:([\w]+|[^\x00-\xa0]+)(?:\((["']*)(.*?(\(.*\))?[^'"()]*?)\2\))?(.*)/,attribute:new RegExp('^\\['+F+'\\](.*)'),children:/^[\x20\t\n\r\f]*\>[\x20\t\n\r\f]*(.*)/,adjacent:/^[\x20\t\n\r\f]*\+[\x20\t\n\r\f]*(.*)/,relative:/^[\x20\t\n\r\f]*\~[\x20\t\n\r\f]*(.*)/,ancestor:/^[\x20\t\n\r\f]+(.*)/,universal:/^\*(.*)/,id:new RegExp('^#('+p+')(.*)'),tagName:new RegExp('^('+p+')(.*)'),className:new RegExp('^\\.('+p+')(.*)')},bB={Structural:{'root':3,'empty':3,'nth-child':3,'nth-last-child':3,'nth-of-type':3,'nth-last-of-type':3,'first-child':3,'last-child':3,'only-child':3,'first-of-type':3,'last-of-type':3,'only-of-type':3},Others:{'link':3,'visited':3,'target':3,'lang':3,'not':3,'active':3,'focus':3,'hover':3,'checked':3,'disabled':3,'enabled':3}},cl=function(b,a){var c=-1,f;if(b.length===0&&Array.slice)return Array.slice(a);while((f=a[++c]))b[b.length]=f;return b},bC=function(b,a,c){var f=-1,k;while((k=a[++f]))c(b[b.length]=k);return b},bd=function(b,a){var c=-1,f=null;while((f=a[++c])){if(f.getAttribute('id')==b){break}}return f},I=!cc?function(b,a){a||(a=i);b=b.replace(/\\/g,'');if(o||a.nodeType!=9){return bd(b,a.getElementsByTagName('*'))}return a.getElementById(b)}:function(b,a){var c=null;a||(a=i);b=b.replace(/\\/g,'');if(o||a.nodeType!=9){return bd(b,a.getElementsByTagName('*'))}if((c=a.getElementById(b))&&c.name==b&&a.getElementsByName){return bd(b,a.getElementsByName(b))}return c},cm=function(b,a){var c=b=='*',f=a,k=[],j=f.firstChild;c||(b=b.toUpperCase());while((f=j)){if(f.tagName>'@'&&(c||f.tagName.toUpperCase()==b)){k[k.length]=f}if(j=f.firstChild||f.nextSibling)continue;while(!j&&(f=f.parentNode)&&f!=a){j=f.nextSibling}}return k},A=!bw&&bc?function(b,a){a||(a=i);return M.call(a.getElementsByTagName?a.getElementsByTagName(b):cm(b,a),0)}:function(b,a){var c=-1,f=[],k,j=(a||i).getElementsByTagName(b);if(b=='*'){var g=-1;while((k=j[++c])){if(k.nodeName>'@')f[++g]=k}}else{while((k=j[++c])){f[c]=k}}return f},bD=function(b,a){return be('[name="'+b.replace(/\\/g,'')+'"]',a||i)},J=!bx&&bc?function(b,a){return M.call((a||i).getElementsByClassName(b.replace(/\\/g,'')),0)}:function(b,a){a||(a=i);var c=-1,f=c,k=[],j,g=A('*',a),h=a.ownerDocument||a,d=G(h),m=Q(h),r=d?b.toLowerCase():b;b=' '+r.replace(/\\/g,'')+' ';while((j=g[++c])){r=m?j.getAttribute('class'):j.className;if(r&&r.length&&(' '+(d?r.toLowerCase():r).replace(bt,' ')+' ').indexOf(b)>-1){k[++f]=j}}return k},bE='compareDocumentPosition'in n?function(b,a){return(b.compareDocumentPosition(a)&16)==16}:'contains'in n?function(b,a){return b!==a&&b.contains(a)}:function(b,a){while((a=a.parentNode)){if(a===b)return true}return false},cn=function(b){var a=0,c,f=b[t]||(b[t]=++T);if(!K[f]){c={};b=b.firstChild;while(b){if(b.nodeName>'@'){c[b[t]||(b[t]=++T)]=++a}b=b.nextSibling}c.length=a;K[f]=c}return K[f]},co=function(b,a){var c=0,f,k=b[t]||(b[t]=++T);if(!w[k]||!w[k][a]){f={};b=b.firstChild;while(b){if(b.nodeName.toUpperCase()==a){f[b[t]||(b[t]=++T)]=++c}b=b.nextSibling}f.length=c;w[k]||(w[k]={});w[k][a]=f}return w[k]},bF=!cd?function(b,a){return b.getAttribute(a)||''}:function(b,a){a=a.toLowerCase();if(R[a]in b){return b[R[a]]||''}return(cj[a]?b.getAttribute(a,2)||'':ci[a]?b.getAttribute(a)?a:'':((b=b.getAttributeNode(a))&&b.value)||'')},bf=!by?function(b,a){return b.hasAttribute(a)}:function(b,a){a=a.toLowerCase();a=a in bz?bz[a]:a;if(R[a]in b){return!!b[R[a]]}b=b.getAttributeNode(a);return!!(b&&(b.specified||b.nodeValue))},cp=function(b){b=b.firstChild;while(b){if(b.nodeType==3||b.nodeName>'@')return false;b=b.nextSibling}return true},cq=function(b){return bf(b,'href')&&cg[b.nodeName]},cr=function(b,a){return E(b,'',a||false)},cs=function(b){for(var a in b){if(a=='VERBOSITY'){bG=!!b[a]}else if(a=='SIMPLENOT'){bH=!!b[a];bg={};bh={};bi={};bj={};bk=false;O=new RegExp(bP,'g')}else if(a=='SHORTCUTS'){bI=!!b[a]}else if(a=='USE_QSAPI'){bk=!!b[a]&&bb;O=new RegExp(Y,'g')}}},u=function(b){if(bG){if(typeof s.DOMException!=='undefined'){var a=new Error();a.name='SYNTAX_ERR';a.message='(Selectors) '+b;a.code=12;throw a;}else{throw new Error(12,'SYNTAX_ERR: (Selectors) '+b);}}else{var c=s.console;if(c&&c.log){c.log(b)}else{if(/exception/i.test(b)){s.status=b;s.defaultStatus=b}else{s.status+=b}}}},bH=true,bI=false,bG=true,bk=bb,bl='f&&f(c[k]);r[r.length]=c[k];continue main;',bJ=i.createElement('nAv').nodeName=='nAv'?'.toUpperCase()':'',E=function(b,a,c){var f=-1,k={},j,g;if((j=b.match(ba))){while((g=j[++f])){g=g.replace(P,'');if(!k[g]){k[g]=true;a+=f>0?(c?'e=c[k];':'e=k;'):'';a+=L(g,c?bl:'f&&f(k);return true;')}}}if(c){return new Function('c,s,r,d,h,g,f','var N,n,x=0,k=-1,e;main:while(e=c[++k]){'+a+'}return r;')}else{return new Function('e,s,r,d,h,g,f','var N,n,x=0,k=e;'+a+'return false;')}},L=function(b,a){var c,f,k,j,g,h,d,m,r,v,l;g=0;while(b){if((d=b.match(q.universal))){c=true}else if((d=b.match(q.id))){a='if('+(o?'s.getAttribute(e,"id")':'(e.submit?s.getAttribute(e,"id"):e.id)')+'=="'+d[1]+'"){'+a+'}'}else if((d=b.match(q.tagName))){a='if(e.nodeName'+(o?'=="'+d[1]+'"':bJ+'=="'+d[1].toUpperCase()+'"')+'){'+a+'}'}else if((d=b.match(q.className))){a='if((n='+(o?'s.getAttribute(e,"class")':'e.className')+')&&n.length&&(" "+'+(H?'n.toLowerCase()':'n')+'.replace('+bt+'," ")+" ").indexOf(" '+(H?d[1].toLowerCase():d[1])+' ")>-1){'+a+'}'}else if((d=b.match(q.attribute))){if(d[3])d[3]=d[3].replace(/^\x22|\x22$/g,'').replace(/^\x27|\x27$/g,'');h=d[1].split(':');h=h.length==2?h[1]:h[0]+'';if(d[2]&&!S[d[2]]){u('Unsupported operator in attribute selectors "'+b+'"');return''}if(d[2]&&d[3]&&(l=S[d[2]])){bA['class']=H?1:0;d[3]=d[3].replace(/\\([0-9a-f]{2,2})/,'\\x$1');v=(o?ck:bA)[h.toLowerCase()];l=l.replace(/\%m/g,v?d[3].toLowerCase():d[3])}else{v=false;l=d[2]=='='?'n==""':'false'}h='n=s.'+(d[2]?'get':'has')+'Attribute(e,"'+d[1]+'")'+(v?'.toLowerCase();':';');a=h+'if('+(d[2]?l:'n')+'){'+a+'}'}else if((d=b.match(q.adjacent))){g++;a=bv?'var N'+g+'=e;if(e&&(e=e.previousElementSibling)){'+a+'}e=N'+g+';':'var N'+g+'=e;while(e&&(e=e.previousSibling)){if(e.nodeName>"@"){'+a+'break;}}e=N'+g+';'}else if((d=b.match(q.relative))){g++;a=bv?('var N'+g+'=e;e=e.parentNode.firstElementChild;while(e&&e!=N'+g+'){'+a+'e=e.nextElementSibling}e=N'+g+';'):('var N'+g+'=e;e=e.parentNode.firstChild;while(e&&e!=N'+g+'){if(e.nodeName>"@"){'+a+'}e=e.nextSibling}e=N'+g+';');}else if((d=b.match(q.children))){g++;a='var N'+g+'=e;if(e&&e!==h&&e!==g&&(e=e.parentNode)){'+a+'}e=N'+g+';';}else if((d=b.match(q.ancestor))){g++;a='var N'+g+'=e;while(e&&e!==h&&e!==g&&(e=e.parentNode)){'+a+'}e=N'+g+';';}else if((d=b.match(q.spseudos))&&bB.Structural[b.match(bs)[0]]){switch(d[1]){case'root':a='if(e===h){'+a+'}';break;case'empty':a='if(s.isEmpty(e)){'+a+'}';break;default:if(d[1]&&d[5]){if(d[5]=='n'){a='if(e!==h){'+a+'}';break;}else if(d[5]=='even'){f=2;k=0;}else if(d[5]=='odd'){f=2;k=1;}else{k=((j=d[5].match(/(-?\d+)$/))?parseInt(j[1],10):0);f=((j=d[5].match(/(-?\d*)n/))?parseInt(j[1],10):0);if(j&&j[1]=='-')f=-1;}l=d[4]?'n[N]':'n';h=d[2]=='last'&&k>=0?l+'.length-('+(k-1)+')':k;l=l+'[e.'+t+']';v=k<1&&f>1?'('+l+'-('+h+'))%'+f+'==0':f>+1?(d[2]=='last')?'('+l+'-('+h+'))%'+f+'==0':l+'>='+h+'&&('+l+'-('+h+'))%'+f+'==0':f<-1?(d[2]=='last')?'('+l+'-('+h+'))%'+f+'==0':l+'<='+h+'&&('+l+'-('+h+'))%'+f+'==0':f===0?l+'=='+h:(d[2]=='last')?f==-1?l+'>='+h:l+'<='+h:f==-1?l+'<='+h:l+'>='+h;a=(d[4]?'N=e.nodeName'+bJ+';':'')+'if(e!==h){n=s.getIndexesBy'+(d[4]?'NodeName':'NodeType')+'(e.parentNode'+(d[4]?',N':'')+');if('+v+'){'+a+'}}';}else{f=d[2]=='first'?'previous':'next';j=d[2]=='only'?'previous':'next';k=d[2]=='first'||d[2]=='last';l=d[4]?'&&n.nodeName!=e.nodeName':'&&n.nodeName<"@"';a='if(e!==h){'+('n=e;while((n=n.'+f+'Sibling)'+l+');if(!n){'+(k?a:'n=e;while((n=n.'+j+'Sibling)'+l+');if(!n){'+a+'}')+'}')+'}';}break;}}else if((d=b.match(q.dpseudos))&&bB.Others[b.match(bs)[0]]){switch(d[1]){case'not':h=d[3].replace(P,'');if(bH&&!bQ.test(h)){u('Negation pseudo-class only accepts simple selectors "'+b+'"');return'';}else{if('compatMode'in i){a='N='+E(h,'',false)+'(e,s,r,d,h,g);if(!N){'+a+'}';}else{a='if(!s.match(e, "'+h.replace(/\x22/g,'\\"')+'",r)){'+a+'}';}}break;case'checked':a='if(((typeof e.form!=="undefined"&&(/radio|checkbox/i).test(e.type))||/option/i.test(e.nodeName))&&(e.checked||e.selected)){'+a+'}';break;case'enabled':a='if(((typeof e.form!=="undefined"&&!(/hidden/i).test(e.type))||s.isLink(e))&&!e.disabled){'+a+'}';break;case'disabled':a='if(((typeof e.form!=="undefined"&&!(/hidden/i).test(e.type))||s.isLink(e))&&e.disabled){'+a+'}';break;case'lang':v='';if(d[3])v=d[3].substr(0,2)+'-';a='do{(n=e.lang||"").toLowerCase();if((n==""&&h.lang=="'+d[3].toLowerCase()+'")||(n&&(n=="'+d[3].toLowerCase()+'"||n.substr(0,3)=="'+v.toLowerCase()+'"))){'+a+'break;}}while((e=e.parentNode)&&e!==g);';break;case'target':j=i.location?i.location.hash:'';if(j){a='if(e.id=="'+j.slice(1)+'"){'+a+'}';}break;case'link':a='if(s.isLink(e)&&!e.visited){'+a+'}';break;case'visited':a='if(s.isLink(e)&&e.visited){'+a+'}';break;case'active':if(o)break;a='if(e===d.activeElement){'+a+'}';break;case'hover':if(o)break;a='if(e===d.hoverElement){'+a+'}';break;case'focus':if(o)break;a=bX?'if(e===d.activeElement&&d.hasFocus()&&(e.type||e.href)){'+a+'}':'if(e===d.activeElement&&(e.type||e.href)){'+a+'}';break;default:break;}}else{h=false;r=true;for(h in z){if((d=b.match(z[h].Expression))){m=z[h].Callback(d,a);a=m.source;r=m.status;if(r)break;}}if(!r){u('Unknown pseudo-class selector "'+b+'"');return'';}if(!h){u('Unknown token in selector "'+b+'"');return'';}}if(!d){u('Invalid syntax in selector "'+b+'"');return'';}b=d&&d[d.length-1];}return a;},bm=function(b,a,c,f){var k,j,g;if(!b||b.nodeName<'A'||!a)return false;if(c&&c.nodeType==1){if(!bE(c,b))return false;}a=a.replace(P,'');c||(c=i);if(bq!=c){bq=c;n=(i=b.ownerDocument||b).documentElement;H=G(i);o=Q(i);}if(k=bo!=a){if((j=a.match(O))&&j[0]==a){bo=a;U=(j=a.match(ba)).length<2;}else{u('The string "'+a+'", is not a valid CSS selector');return false;}}if(o&&!(g=bj[a])){g=bj[a]=U?new Function('e,s,r,d,h,g,f','var N,n,x=0,k=e;'+L(a,'f&&f(k);return true;')+'return false;'):E(a,'',false);}else if(!(g=bi[a])){g=bi[a]=U?new Function('e,s,r,d,h,g,f','var N,n,x=0,k=e;'+L(a,'f&&f(k);return true;')+'return false;'):E(a,'',false);}K={};w={};return g(b,bK,[],i,n,c||i,f);},be=function(b,a,c){var f,k,j,g,h,d,m;if(arguments.length===0){u('Missing required selector parameters');return[];}else if(b===''){u('Empty selector string');return[];}else if(typeof b!='string'){return[];}b=b.replace(P,'');a||(a=i);if(bI){if(bV.test(b)){b=a.nodeType==9?'* '+b:a.id?'#'+a.id+' '+b:b;}if(bW.test(b)){b=b+' *';}}if(cf.test(b)){switch(b.charAt(0)){case'#':if((j=I(b.slice(1),a))){c&&c(j);return[j];}return[];case'.':g=J(b.slice(1),a);break;default:g=A(b,a);break;}return c?bC([],g,c):g;}if(bk&&!ce.test(b)&&ch[a.nodeType]){bn=null;try{g=a.querySelectorAll(b);}catch(e){bn=e;if(b==='')throw e;}if(g){switch(g.length){case 0:return[];case 1:j=g.item(0);c&&c(j);return[j];default:return c?bC([],g,c):bc?M.call(g):cl([],g);}}}if(br!=a){br=a;n=(i=a.ownerDocument||a).documentElement;H=G(i);o=Q(i);}if(k=bp!=b){if((h=b.match(O))&&h[0]==b){bp=b;N=(h=b.match(ba)).length<2;}else{u('The string "'+b+'", is not a valid CSS selector');return[];}}if(N&&a.nodeType!=11){if(k){h=b.match(bU);m=h[h.length-1];B=m.split(':not')[0];}if((h=B.match(D.ID))&&(m=h[1])){if((j=I(m,a))){if(bm(j,b)){c&&c(j);return[j];}}return[];}else if((h=b.match(D.ID))&&(m=h[1])){if((j=I(m,i))){if(/[>+~]/.test(b)){a=j.parentNode;}else{b=b.replace('#'+m,'*');a=j;}}else return[];}if(bu){if((h=B.match(D.CLASS))&&(m=h[1])){if((g=J(m,a)).length===0){return[];}}else if((h=B.match(D.TAG))&&(m=h[1])){if((g=A(m,a)).length===0){return[];}}}else{if((h=B.match(D.TAG))&&(m=h[1])){if((g=A(m,a)).length===0){return[];}}else if((h=B.match(D.CLASS))&&(m=h[1])){if((g=J(m,a)).length===0){return[];}}}}if(!g){g=A('*',a);}if(o&&!(d=bh[b])){d=bh[b]=N?new Function('c,s,r,d,h,g,f','var N,n,x=0,k=-1,e;main:while(e=c[++k]){'+L(b,bl)+'}return r;'):E(b,'',true);}else if(!(d=bg[b])){d=bg[b]=N?new Function('c,s,r,d,h,g,f','var N,n,x=0,k=-1,e;main:while(e=c[++k]){'+L(b,bl)+'}return r;'):E(b,'',true);}K={};w={};return d(g,bK,[],i,n,a,c);},T=1,t='uniqueID'in n?'uniqueID':'CSS_ID',K={},w={},bg={},bh={},bi={},bj={},bK={getIndexesByNodeType:cn,getIndexesByNodeName:co,getAttribute:bF,hasAttribute:bf,byClass:J,byName:bD,byTag:A,byId:I,isEmpty:cp,isLink:cq,select:be,match:bm};s.NW||(s.NW={});NW.Dom={byId:I,byTag:A,byName:bD,byClass:J,getAttribute:bF,hasAttribute:bf,match:bm,select:be,compile:cr,contains:bE,configure:cs,registerOperator:function(b,a){if(!S[b]){S[b]=a}},registerSelector:function(b,a,c){if(!z[b]){z[b]={};z[b].Expression=a;z[b].Callback=c}}}})(this);

/*
selectivizr v1.0.3b - (c) Keith Clark, freely distributable under the terms 
of the MIT license.

selectivizr.com
*/
/* 
  
Notes about this source
-----------------------

 * The #DEBUG_START and #DEBUG_END comments are used to mark blocks of code
   that will be removed prior to building a final release version (using a
   pre-compression script)
  
  
References:
-----------
 
 * CSS Syntax          : http://www.w3.org/TR/2003/WD-css3-syntax-20030813/#style
 * Selectors           : http://www.w3.org/TR/css3-selectors/#selectors
 * IE Compatability    : http://msdn.microsoft.com/en-us/library/cc351024(VS.85).aspx
 * W3C Selector Tests  : http://www.w3.org/Style/CSS/Test/CSS3/Selectors/current/html/tests/
 
*/

(function(win) {

	// Determine IE version and stop execution if browser isn't IE. This
	// handles the script being loaded by non IE browsers because the
	// developer didn't use conditional comments.
	var ieUserAgent = navigator.userAgent.match(/MSIE (\d+)/);
	if (!ieUserAgent) {
		return false;
	}

	// =========================== Init Objects ============================

	var doc = document;
	var root = doc.documentElement;
	var xhr = getXHRObject();
	var ieVersion = ieUserAgent[1];

	// If were not in standards mode, IE is too old / new or we can't create
	// an XMLHttpRequest object then we should get out now.
	if (doc.compatMode != 'CSS1Compat' || ieVersion<6 || ieVersion>8 || !xhr) {
		return;
	}
	
	
	// ========================= Common Objects ============================

	// Compatiable selector engines in order of CSS3 support. Note: '*' is
	// a placholder for the object key name. (basically, crude compression)
	var selectorEngines = {
		"NW"								: "*.Dom.select",
		"MooTools"							: "$$",
		"DOMAssistant"						: "*.$", 
		"Prototype"							: "$$",
		"YAHOO"								: "*.util.Selector.query",
		"Sizzle"							: "*", 
		"jQuery"							: "*",
		"dojo"								: "*.query"
	};

	var selectorMethod;
	var enabledWatchers 					= [];     // array of :enabled/:disabled elements to poll
	var domPatches							= [];
	var ie6PatchID 							= 0;      // used to solve ie6's multiple class bug
	var patchIE6MultipleClasses				= true;   // if true adds class bloat to ie6
	var namespace 							= "slvzr";

	// Stylesheet parsing regexp's
	var RE_COMMENT							= /(\/\*[^*]*\*+([^\/][^*]*\*+)*\/)\s*?/g;
	var RE_IMPORT							= /@import\s*(?:(?:(?:url\(\s*(['"]?)(.*)\1)\s*\))|(?:(['"])(.*)\3))\s*([^;]*);/g;
	var RE_ASSET_URL 						= /(behavior\s*?:\s*)?\burl\(\s*(["']?)(?!data:)([^"')]+)\2\s*\)/g;
	var RE_PSEUDO_STRUCTURAL				= /^:(empty|(first|last|only|nth(-last)?)-(child|of-type))$/;
	var RE_PSEUDO_ELEMENTS					= /:(:first-(?:line|letter))/g;
	var RE_SELECTOR_GROUP					= /((?:^|(?:\s*})+)(?:\s*@media[^{]+{)?)\s*([^\{]*?[\[:][^{]+)/g;
	var RE_SELECTOR_PARSE					= /([ +~>])|(:[a-z-]+(?:\(.*?\)+)?)|(\[.*?\])/g; 
	var RE_LIBRARY_INCOMPATIBLE_PSEUDOS		= /(:not\()?:(hover|enabled|disabled|focus|checked|target|active|visited|first-line|first-letter)\)?/g;
	var RE_PATCH_CLASS_NAME_REPLACE			= /[^\w-]/g;
	
	// HTML UI element regexp's
	var RE_INPUT_ELEMENTS					= /^(INPUT|SELECT|TEXTAREA|BUTTON)$/;
	var RE_INPUT_CHECKABLE_TYPES			= /^(checkbox|radio)$/;

	// Broken attribute selector implementations (IE7/8 native [^=""], [$=""] and [*=""])
	var BROKEN_ATTR_IMPLEMENTATIONS			= ieVersion>6 ? /[\$\^*]=(['"])\1/ : null;

	// Whitespace normalization regexp's
	var RE_TIDY_TRAILING_WHITESPACE			= /([(\[+~])\s+/g;
	var RE_TIDY_LEADING_WHITESPACE			= /\s+([)\]+~])/g;
	var RE_TIDY_CONSECUTIVE_WHITESPACE		= /\s+/g;
	var RE_TIDY_TRIM_WHITESPACE				= /^\s*((?:[\S\s]*\S)?)\s*$/;
	
	// String constants
	var EMPTY_STRING						= "";
	var SPACE_STRING						= " ";
	var PLACEHOLDER_STRING					= "$1";

	// =========================== Patching ================================

	// --[ patchStyleSheet() ]----------------------------------------------
	// Scans the passed cssText for selectors that require emulation and
	// creates one or more patches for each matched selector.
	function patchStyleSheet( cssText ) {
		return cssText.replace(RE_PSEUDO_ELEMENTS, PLACEHOLDER_STRING).
			replace(RE_SELECTOR_GROUP, function(m, prefix, selectorText) {	
    			var selectorGroups = selectorText.split(",");
    			for (var c = 0, cs = selectorGroups.length; c < cs; c++) {
    				var selector = normalizeSelectorWhitespace(selectorGroups[c]) + SPACE_STRING;
    				var patches = [];
    				selectorGroups[c] = selector.replace(RE_SELECTOR_PARSE, 
    					function(match, combinator, pseudo, attribute, index) {
    						if (combinator) {
    							if (patches.length>0) {
    								domPatches.push( { selector: selector.substring(0, index), patches: patches } )
    								patches = [];
    							}
    							return combinator;
    						}		
    						else {
    							var patch = (pseudo) ? patchPseudoClass( pseudo ) : patchAttribute( attribute );
    							if (patch) {
    								patches.push(patch);
    								return "." + patch.className;
    							}
    							return match;
    						}
    					}
    				);
    			}
    			return prefix + selectorGroups.join(",");
    		});
	};

	// --[ patchAttribute() ]-----------------------------------------------
	// returns a patch for an attribute selector.
	function patchAttribute( attr ) {
		return (!BROKEN_ATTR_IMPLEMENTATIONS || BROKEN_ATTR_IMPLEMENTATIONS.test(attr)) ? 
			{ className: createClassName(attr), applyClass: true } : null;
	};

	// --[ patchPseudoClass() ]---------------------------------------------
	// returns a patch for a pseudo-class
	function patchPseudoClass( pseudo ) {

		var applyClass = true;
		var className = createClassName(pseudo.slice(1));
		var isNegated = pseudo.substring(0, 5) == ":not(";
		var activateEventName;
		var deactivateEventName;

		// if negated, remove :not() 
		if (isNegated) {
			pseudo = pseudo.slice(5, -1);
		}
		
		// bracket contents are irrelevant - remove them
		var bracketIndex = pseudo.indexOf("(")
		if (bracketIndex > -1) {
			pseudo = pseudo.substring(0, bracketIndex);
		}		
		
		// check we're still dealing with a pseudo-class
		if (pseudo.charAt(0) == ":") {
			switch (pseudo.slice(1)) {

				case "root":
					applyClass = function(e) {
						return isNegated ? e != root : e == root;
					}
					break;

				case "target":
					// :target is only supported in IE8
					if (ieVersion == 8) {
						applyClass = function(e) {
							var handler = function() { 
								var hash = location.hash;
								var hashID = hash.slice(1);
								return isNegated ? (hash == EMPTY_STRING || e.id != hashID) : (hash != EMPTY_STRING && e.id == hashID);
							};
							addEvent( win, "hashchange", function() {
								toggleElementClass(e, className, handler());
							})
							return handler();
						}
						break;
					}
					return false;
				
				case "checked":
					applyClass = function(e) { 
						if (RE_INPUT_CHECKABLE_TYPES.test(e.type)) {
							addEvent( e, "propertychange", function() {
								if (event.propertyName == "checked") {
									toggleElementClass( e, className, e.checked !== isNegated );
								} 							
							})
						}
						return e.checked !== isNegated;
					}
					break;
					
				case "disabled":
					isNegated = !isNegated;

				case "enabled":
					applyClass = function(e) { 
						if (RE_INPUT_ELEMENTS.test(e.tagName)) {
							addEvent( e, "propertychange", function() {
								if (event.propertyName == "$disabled") {
									toggleElementClass( e, className, e.$disabled === isNegated );
								} 
							});
							enabledWatchers.push(e);
							e.$disabled = e.disabled;
							return e.disabled === isNegated;
						}
						return pseudo == ":enabled" ? isNegated : !isNegated;
					}
					break;
					
				case "focus":
					activateEventName = "focus";
					deactivateEventName = "blur";
								
				case "hover":
					if (!activateEventName) {
						activateEventName = "mouseenter";
						deactivateEventName = "mouseleave";
					}
					applyClass = function(e) {
						addEvent( e, isNegated ? deactivateEventName : activateEventName, function() {
							toggleElementClass( e, className, true );
						})
						addEvent( e, isNegated ? activateEventName : deactivateEventName, function() {
							toggleElementClass( e, className, false );
						})
						return isNegated;
					}
					break;
					
				// everything else
				default:
					// If we don't support this pseudo-class don't create 
					// a patch for it
					if (!RE_PSEUDO_STRUCTURAL.test(pseudo)) {
						return false;
					}
					break;
			}
		}
		return { className: className, applyClass: applyClass };
	};

	// --[ applyPatches() ]-------------------------------------------------
	function applyPatches() {
		var elms, selectorText, patches, domSelectorText;

		for (var c=0; c<domPatches.length; c++) {
			selectorText = domPatches[c].selector;
			patches = domPatches[c].patches;

			// Although some selector libraries can find :checked :enabled etc.
			// we need to find all elements that could have that state because
			// it can be changed by the user.
			domSelectorText = selectorText.replace(RE_LIBRARY_INCOMPATIBLE_PSEUDOS, EMPTY_STRING);

			// If the dom selector equates to an empty string or ends with
			// whitespace then we need to append a universal selector (*) to it.
			if (domSelectorText == EMPTY_STRING || domSelectorText.charAt(domSelectorText.length - 1) == SPACE_STRING) {
				domSelectorText += "*";
			}

			// Ensure we catch errors from the selector library
			try {
				elms = selectorMethod( domSelectorText );
			} catch (ex) {
				// #DEBUG_START
				log( "Selector '" + selectorText + "' threw exception '" + ex + "'" );
				// #DEBUG_END
			}


			if (elms) {
				for (var d = 0, dl = elms.length; d < dl; d++) {
					var elm = elms[d];
					var cssClasses = elm.className;
					for (var f = 0, fl = patches.length; f < fl; f++) {
						var patch = patches[f];
						if (!hasPatch(elm, patch)) {
							if (patch.applyClass && (patch.applyClass === true || patch.applyClass(elm) === true)) {
								cssClasses = toggleClass(cssClasses, patch.className, true );
							}
						}
					}
					elm.className = cssClasses;
				}
			}
		}
	};

	// --[ hasPatch() ]-----------------------------------------------------
	// checks for the exsistence of a patch on an element
	function hasPatch( elm, patch ) {
		return new RegExp("(^|\\s)" + patch.className + "(\\s|$)").test(elm.className);
	};
	
	
	// =========================== Utility =================================
	
	function createClassName( className ) {
		return namespace + "-" + ((ieVersion == 6 && patchIE6MultipleClasses) ?
			ie6PatchID++
		:
			className.replace(RE_PATCH_CLASS_NAME_REPLACE, function(a) { return a.charCodeAt(0) }));
	};

	// --[ log() ]----------------------------------------------------------
	// #DEBUG_START
	function log( message ) {
		if (win.console) {
			win.console.log(message);
		}
	};
	// #DEBUG_END

	// --[ trim() ]---------------------------------------------------------
	// removes leading, trailing whitespace from a string
	function trim( text ) {
		return text.replace(RE_TIDY_TRIM_WHITESPACE, PLACEHOLDER_STRING);
	};

	// --[ normalizeWhitespace() ]------------------------------------------
	// removes leading, trailing and consecutive whitespace from a string
	function normalizeWhitespace( text ) {
		return trim(text).replace(RE_TIDY_CONSECUTIVE_WHITESPACE, SPACE_STRING);
	};

	// --[ normalizeSelectorWhitespace() ]----------------------------------
	// tidies whitespace around selector brackets and combinators
	function normalizeSelectorWhitespace( selectorText ) {
		return normalizeWhitespace(selectorText.
			replace(RE_TIDY_TRAILING_WHITESPACE, PLACEHOLDER_STRING).
			replace(RE_TIDY_LEADING_WHITESPACE, PLACEHOLDER_STRING)
		);
	};

	// --[ toggleElementClass() ]-------------------------------------------
	// toggles a single className on an element
	function toggleElementClass( elm, className, on ) {
		var oldClassName = elm.className;
		var newClassName = toggleClass(oldClassName, className, on);
		if (newClassName != oldClassName) {
			elm.className = newClassName;
			elm.parentNode.className += EMPTY_STRING;
		}
	};

	// --[ toggleClass() ]--------------------------------------------------
	// adds / removes a className from a string of classNames. Used to 
	// manage multiple class changes without forcing a DOM redraw
	function toggleClass( classList, className, on ) {
		var re = RegExp("(^|\\s)" + className + "(\\s|$)");
		var classExists = re.test(classList);
		if (on) {
			return classExists ? classList : classList + SPACE_STRING + className;
		} else {
			return classExists ? trim(classList.replace(re, PLACEHOLDER_STRING)) : classList;
		}
	};
	
	// --[ addEvent() ]-----------------------------------------------------
	function addEvent(elm, eventName, eventHandler) {
		elm.attachEvent("on" + eventName, eventHandler);
	};

	// --[ getXHRObject() ]-------------------------------------------------
	function getXHRObject() {
		if (win.XMLHttpRequest) {
			return new XMLHttpRequest;
		}
		try	{ 
			return new ActiveXObject('Microsoft.XMLHTTP');
		} catch(e) { 
			return null;
		}
	};

	// --[ loadStyleSheet() ]-----------------------------------------------
	function loadStyleSheet( url ) {
		xhr.open("GET", url, false);
		xhr.send();
		return (xhr.status==200) ? xhr.responseText : EMPTY_STRING;	
	};
	
	// --[ resolveUrl() ]---------------------------------------------------
	// Converts a URL fragment to a fully qualified URL using the specified
	// context URL. Returns null if same-origin policy is broken
	function resolveUrl( url, contextUrl, ignoreSameOriginPolicy ) {

		function getProtocol( url ) {
			return url.substring(0, url.indexOf("//"));
		};

		function getProtocolAndHost( url ) {
			return url.substring(0, url.indexOf("/", 8));
		};

		if (!contextUrl) {
			contextUrl = baseUrl;
		}

		// protocol-relative path
		if (url.substring(0,2)=="//") {
			url = getProtocol(contextUrl) + url;
		}

		// absolute path
		if (/^https?:\/\//i.test(url)) {
			return !ignoreSameOriginPolicy && getProtocolAndHost(contextUrl) != getProtocolAndHost(url) ? null : url ;
		}

		// root-relative path
		if (url.charAt(0)=="/")	{
			return getProtocolAndHost(contextUrl) + url;
		}

		// relative path
		var contextUrlPath = contextUrl.split(/[?#]/)[0]; // ignore query string in the contextUrl	
		if (url.charAt(0) != "?" && contextUrlPath.charAt(contextUrlPath.length - 1) != "/") {
			contextUrlPath = contextUrlPath.substring(0, contextUrlPath.lastIndexOf("/") + 1);
		}

		return contextUrlPath + url;
	};
	
	// --[ parseStyleSheet() ]----------------------------------------------
	// Downloads the stylesheet specified by the URL, removes it's comments
	// and recursivly replaces @import rules with their contents, ultimately
	// returning the full cssText.
	function parseStyleSheet( url ) {
		if (url) {
			return loadStyleSheet(url).replace(RE_COMMENT, EMPTY_STRING).
			replace(RE_IMPORT, function( match, quoteChar, importUrl, quoteChar2, importUrl2, media ) {
				var cssText = parseStyleSheet(resolveUrl(importUrl || importUrl2, url));
				return (media) ? "@media " + media + " {" + cssText + "}" : cssText;
			}).
			replace(RE_ASSET_URL, function( match, isBehavior, quoteChar, assetUrl ) { 
				quoteChar = quoteChar || EMPTY_STRING;
				return isBehavior ? match : " url(" + quoteChar + resolveUrl(assetUrl, url, true) + quoteChar + ") "; 
			});
		}
		return EMPTY_STRING;
	};

	// --[ getStyleSheets() ]-----------------------------------------------
	function getStyleSheets() {
		var url, stylesheet;
		for (var c = 0; c < doc.styleSheets.length; c++) {
			stylesheet = doc.styleSheets[c];
			if (stylesheet.href != EMPTY_STRING) {
				url = resolveUrl(stylesheet.href);
				if (url) {
					stylesheet.cssText = stylesheet["rawCssText"] = patchStyleSheet( parseStyleSheet( url ) );
				}
			}
		}
	};

	// --[ init() ]---------------------------------------------------------
	function init() {
		applyPatches();

		// :enabled & :disabled polling script (since we can't hook 
		// onpropertychange event when an element is disabled) 
		if (enabledWatchers.length > 0) {
			setInterval( function() {
				for (var c = 0, cl = enabledWatchers.length; c < cl; c++) {
					var e = enabledWatchers[c];
					if (e.disabled !== e.$disabled) {
						if (e.disabled) {
							e.disabled = false;
							e.$disabled = true;
							e.disabled = true;
						}
						else {
							e.$disabled = e.disabled;
						}
					}
				}
			}, 250)
		}
	};

	// Determine the baseUrl and download the stylesheets
	var baseTags = doc.getElementsByTagName("BASE");
	var baseUrl = (baseTags.length > 0) ? baseTags[0].href : doc.location.href;
	getStyleSheets();

	// Bind selectivizr to the ContentLoaded event. 
	ContentLoaded(win, function() {
		// Determine the "best fit" selector engine
		for (var engine in selectorEngines) {
			var members, member, context = win;
			if (win[engine]) {
				members = selectorEngines[engine].replace("*", engine).split(".");
				while ((member = members.shift()) && (context = context[member])) {}
				if (typeof context == "function") {
					selectorMethod = context;
					init();
					return;
				}
			}
		}
	});
	

	
	/*!
	 * ContentLoaded.js by Diego Perini, modified for IE<9 only (to save space)
	 *
	 * Author: Diego Perini (diego.perini at gmail.com)
	 * Summary: cross-browser wrapper for DOMContentLoaded
	 * Updated: 20101020
	 * License: MIT
	 * Version: 1.2
	 *
	 * URL:
	 * http://javascript.nwbox.com/ContentLoaded/
	 * http://javascript.nwbox.com/ContentLoaded/MIT-LICENSE
	 *
	 */

	// @w window reference
	// @f function reference
	function ContentLoaded(win, fn) {

		var done = false, top = true,
		init = function(e) {
			if (e.type == "readystatechange" && doc.readyState != "complete") return;
			(e.type == "load" ? win : doc).detachEvent("on" + e.type, init, false);
			if (!done && (done = true)) fn.call(win, e.type || e);
		},
		poll = function() {
			try { root.doScroll("left"); } catch(e) { setTimeout(poll, 50); return; }
			init('poll');
		};

		if (doc.readyState == "complete") fn.call(win, EMPTY_STRING);
		else {
			if (doc.createEventObject && root.doScroll) {
				try { top = !win.frameElement; } catch(e) { }
				if (top) poll();
			}
			addEvent(doc,"readystatechange", init);
			addEvent(win,"load", init);
		}
	};
})(this);


/*! matchMedia() polyfill - Test a CSS media type/query in JS. Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight. Dual MIT/BSD license */

window.matchMedia || (window.matchMedia = function() {
    "use strict";

    // For browsers that support matchMedium api such as IE 9 and webkit
    var styleMedia = (window.styleMedia || window.media);

    // For those that don't support matchMedium
    if (!styleMedia) {
        var style       = document.createElement('style'),
            script      = document.getElementsByTagName('script')[0],
            info        = null;

        style.type  = 'text/css';
        style.id    = 'matchmediajs-test';

        script.parentNode.insertBefore(style, script);

        // 'style.currentStyle' is used by IE <= 8 and 'window.getComputedStyle' for all other browsers
        info = ('getComputedStyle' in window) && window.getComputedStyle(style, null) || style.currentStyle;

        styleMedia = {
            matchMedium: function(media) {
                var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';

                // 'style.styleSheet' is used by IE <= 8 and 'style.textContent' for all other browsers
                if (style.styleSheet) {
                    style.styleSheet.cssText = text;
                } else {
                    style.textContent = text;
                }

                // Test if media query is true or false
                return info.width === '1px';
            }
        };
    }

    return function(media) {
        return {
            matches: styleMedia.matchMedium(media || 'all'),
            media: media || 'all'
        };
    };
}());


/*! matchMedia() polyfill - Test a CSS media type/query in JS. Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas. Dual MIT/BSD license */
/*! NOTE: If you're already including a window.matchMedia polyfill via Modernizr or otherwise, you don't need this part */
(function(w) {
  "use strict";
  w.matchMedia = w.matchMedia || function(doc, undefined) {
    var bool, docElem = doc.documentElement, refNode = docElem.firstElementChild || docElem.firstChild, fakeBody = doc.createElement("body"), div = doc.createElement("div");
    div.id = "mq-test-1";
    div.style.cssText = "position:absolute;top:-100em";
    fakeBody.style.background = "none";
    fakeBody.appendChild(div);
    return function(q) {
      div.innerHTML = '&shy;<style media="' + q + '"> #mq-test-1 { width: 42px; }</style>';
      docElem.insertBefore(fakeBody, refNode);
      bool = div.offsetWidth === 42;
      docElem.removeChild(fakeBody);
      return {
        matches: bool,
        media: q
      };
    };
  }(w.document);
})(this);

/*! Respond.js v1.4.0: min/max-width media query polyfill. (c) Scott Jehl. MIT Lic. j.mp/respondjs  */
(function(w) {
  "use strict";
  var respond = {};
  w.respond = respond;
  respond.update = function() {};
  var requestQueue = [], xmlHttp = function() {
    var xmlhttpmethod = false;
    try {
      xmlhttpmethod = new w.XMLHttpRequest();
    } catch (e) {
      xmlhttpmethod = new w.ActiveXObject("Microsoft.XMLHTTP");
    }
    return function() {
      return xmlhttpmethod;
    };
  }(), ajax = function(url, callback) {
    var req = xmlHttp();
    if (!req) {
      return;
    }
    req.open("GET", url, true);
    req.onreadystatechange = function() {
      if (req.readyState !== 4 || req.status !== 200 && req.status !== 304) {
        return;
      }
      callback(req.responseText);
    };
    if (req.readyState === 4) {
      return;
    }
    req.send(null);
  };
  respond.ajax = ajax;
  respond.queue = requestQueue;
  respond.regex = {
    media: /@media[^\{]+\{([^\{\}]*\{[^\}\{]*\})+/gi,
    keyframes: /@(?:\-(?:o|moz|webkit)\-)?keyframes[^\{]+\{(?:[^\{\}]*\{[^\}\{]*\})+[^\}]*\}/gi,
    urls: /(url\()['"]?([^\/\)'"][^:\)'"]+)['"]?(\))/g,
    findStyles: /@media *([^\{]+)\{([\S\s]+?)$/,
    only: /(only\s+)?([a-zA-Z]+)\s?/,
    minw: /\([\s]*min\-width\s*:[\s]*([\s]*[0-9\.]+)(px|em)[\s]*\)/,
    maxw: /\([\s]*max\-width\s*:[\s]*([\s]*[0-9\.]+)(px|em)[\s]*\)/
  };
  respond.mediaQueriesSupported = w.matchMedia && w.matchMedia("only all") !== null && w.matchMedia("only all").matches;
  if (respond.mediaQueriesSupported) {
    return;
  }
  var doc = w.document, docElem = doc.documentElement, mediastyles = [], rules = [], appendedEls = [], parsedSheets = {}, resizeThrottle = 30, head = doc.getElementsByTagName("head")[0] || docElem, base = doc.getElementsByTagName("base")[0], links = head.getElementsByTagName("link"), lastCall, resizeDefer, eminpx, getEmValue = function() {
    var ret, div = doc.createElement("div"), body = doc.body, originalHTMLFontSize = docElem.style.fontSize, originalBodyFontSize = body && body.style.fontSize, fakeUsed = false;
    div.style.cssText = "position:absolute;font-size:1em;width:1em";
    if (!body) {
      body = fakeUsed = doc.createElement("body");
      body.style.background = "none";
    }
    docElem.style.fontSize = "100%";
    body.style.fontSize = "100%";
    body.appendChild(div);
    if (fakeUsed) {
      docElem.insertBefore(body, docElem.firstChild);
    }
    ret = div.offsetWidth;
    if (fakeUsed) {
      docElem.removeChild(body);
    } else {
      body.removeChild(div);
    }
    docElem.style.fontSize = originalHTMLFontSize;
    if (originalBodyFontSize) {
      body.style.fontSize = originalBodyFontSize;
    }
    ret = eminpx = parseFloat(ret);
    return ret;
  }, applyMedia = function(fromResize) {
    var name = "clientWidth", docElemProp = docElem[name], currWidth = doc.compatMode === "CSS1Compat" && docElemProp || doc.body[name] || docElemProp, styleBlocks = {}, lastLink = links[links.length - 1], now = new Date().getTime();
    if (fromResize && lastCall && now - lastCall < resizeThrottle) {
      w.clearTimeout(resizeDefer);
      resizeDefer = w.setTimeout(applyMedia, resizeThrottle);
      return;
    } else {
      lastCall = now;
    }
    for (var i in mediastyles) {
      if (mediastyles.hasOwnProperty(i)) {
        var thisstyle = mediastyles[i], min = thisstyle.minw, max = thisstyle.maxw, minnull = min === null, maxnull = max === null, em = "em";
        if (!!min) {
          min = parseFloat(min) * (min.indexOf(em) > -1 ? eminpx || getEmValue() : 1);
        }
        if (!!max) {
          max = parseFloat(max) * (max.indexOf(em) > -1 ? eminpx || getEmValue() : 1);
        }
        if (!thisstyle.hasquery || (!minnull || !maxnull) && (minnull || currWidth >= min) && (maxnull || currWidth <= max)) {
          if (!styleBlocks[thisstyle.media]) {
            styleBlocks[thisstyle.media] = [];
          }
          styleBlocks[thisstyle.media].push(rules[thisstyle.rules]);
        }
      }
    }
    for (var j in appendedEls) {
      if (appendedEls.hasOwnProperty(j)) {
        if (appendedEls[j] && appendedEls[j].parentNode === head) {
          head.removeChild(appendedEls[j]);
        }
      }
    }
    appendedEls.length = 0;
    for (var k in styleBlocks) {
      if (styleBlocks.hasOwnProperty(k)) {
        var ss = doc.createElement("style"), css = styleBlocks[k].join("\n");
        ss.type = "text/css";
        ss.media = k;
        head.insertBefore(ss, lastLink.nextSibling);
        if (ss.styleSheet) {
          ss.styleSheet.cssText = css;
        } else {
          ss.appendChild(doc.createTextNode(css));
        }
        appendedEls.push(ss);
      }
    }
  }, translate = function(styles, href, media) {
    var qs = styles.replace(respond.regex.keyframes, "").match(respond.regex.media), ql = qs && qs.length || 0;
    href = href.substring(0, href.lastIndexOf("/"));
    var repUrls = function(css) {
      return css.replace(respond.regex.urls, "$1" + href + "$2$3");
    }, useMedia = !ql && media;
    if (href.length) {
      href += "/";
    }
    if (useMedia) {
      ql = 1;
    }
    for (var i = 0; i < ql; i++) {
      var fullq, thisq, eachq, eql;
      if (useMedia) {
        fullq = media;
        rules.push(repUrls(styles));
      } else {
        fullq = qs[i].match(respond.regex.findStyles) && RegExp.$1;
        rules.push(RegExp.$2 && repUrls(RegExp.$2));
      }
      eachq = fullq.split(",");
      eql = eachq.length;
      for (var j = 0; j < eql; j++) {
        thisq = eachq[j];
        mediastyles.push({
          media: thisq.split("(")[0].match(respond.regex.only) && RegExp.$2 || "all",
          rules: rules.length - 1,
          hasquery: thisq.indexOf("(") > -1,
          minw: thisq.match(respond.regex.minw) && parseFloat(RegExp.$1) + (RegExp.$2 || ""),
          maxw: thisq.match(respond.regex.maxw) && parseFloat(RegExp.$1) + (RegExp.$2 || "")
        });
      }
    }
    applyMedia();
  }, makeRequests = function() {
    if (requestQueue.length) {
      var thisRequest = requestQueue.shift();
      ajax(thisRequest.href, function(styles) {
        translate(styles, thisRequest.href, thisRequest.media);
        parsedSheets[thisRequest.href] = true;
        w.setTimeout(function() {
          makeRequests();
        }, 0);
      });
    }
  }, ripCSS = function() {
    for (var i = 0; i < links.length; i++) {
      var sheet = links[i], href = sheet.href, media = sheet.media, isCSS = sheet.rel && sheet.rel.toLowerCase() === "stylesheet";
      if (!!href && isCSS && !parsedSheets[href]) {
        if (sheet.styleSheet && sheet.styleSheet.rawCssText) {
          translate(sheet.styleSheet.rawCssText, href, media);
          parsedSheets[href] = true;
        } else {
          if (!/^([a-zA-Z:]*\/\/)/.test(href) && !base || href.replace(RegExp.$1, "").split("/")[0] === w.location.host) {
            if (href.substring(0, 2) === "//") {
              href = w.location.protocol + href;
            }
            requestQueue.push({
              href: href,
              media: media
            });
          }
        }
      }
    }
    makeRequests();
  };
  ripCSS();
  respond.update = ripCSS;
  respond.getEmValue = getEmValue;
  function callMedia() {
    applyMedia(true);
  }
  if (w.addEventListener) {
    w.addEventListener("resize", callMedia, false);
  } else if (w.attachEvent) {
    w.attachEvent("onresize", callMedia);
  }
})(this);

/**
  * go-nativ.ie8
  *
  * @author William Lin
  * @license The MIT License (MIT)
  * https://github.com/ganlanyuan/go-native
  */
  
// @codekit-prepend "../bower_components/html5shiv/dist/html5shiv.js";
// @codekit-prepend "../bower_components/fix-ie/src/IE8-child-elements.js";
// @codekit-prepend "../bower_components/fix-ie/src/IE8-offsets.js";
// @codekit-prepend "../bower_components/fix-ie/src/text-content.js";
// @codekit-prepend "../bower_components/fix-ie/src/IE8-getComputedStyle.js";
// @codekit-prepend "../bower_components/fix-ie/src/es5-arrays.js";
// @codekit-prepend "components/es5-function.bind.js";
// @codekit-prepend "components/es5-object.keys.js";
// @codekit-prepend "components/IE8-preventDefault.js";
// @codekit-prepend "components/IE8-stopPropagation.js";
// @codekit-prepend "components/IE8-addEventListener.js";

/**
  * NWMatcher: https://github.com/dperini/nwmatcher
  * selectivizr: https://github.com/keithclark/selectivizr
  */
// @codekit-prepend "components/nwmatcher-1.2.3-min.js";
// @codekit-prepend "../bower_components/Selectivizr-bower/selectivizr.js";

/**
  * matchmedia: https://github.com/paulirish/matchMedia.js
  * respond: https://github.com/scottjehl/Respond
  */
// @codekit-prepend "../bower_components/matchMedia/matchMedia.js";
// @codekit-prepend "../bower_components/respond/dest/respond.src.js";

