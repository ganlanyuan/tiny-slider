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

/**
  * tiny-slider
  * @version 0.3.1
  * @author William Lin
  * @license The MIT License (MIT)
  * @github https://github.com/ganlanyuan/tiny-slider/
  * 
  */

// @codekit-prepend "../bower_components/fix-ie/src/es5-arrays.js";
// @codekit-prepend "../bower_components/fix-ie/src/IE8-child-elements.js";
// @codekit-prepend "../bower_components/go-native/src/components/IE8-addEventListener.js";

