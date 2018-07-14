// Element.nextElementSibling

(function () {
  "use strict";

  if (!("nextElementSibling" in document.documentElement)) {
    Object.defineProperty(Element.prototype, "nextElementSibling", {
      get: function(){
        var e = this.nextSibling;
        while(e && 1 !== e.nodeType) {
          e = e.nextSibling;
        }
        return e;
      }
    });
  }
})();