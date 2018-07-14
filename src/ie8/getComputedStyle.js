// getComputedStyle

(function(){
  "use strict";
  
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
})();