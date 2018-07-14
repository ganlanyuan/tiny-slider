// Element.previousElementSibling

(function () {
  "use strict";

  if (!("previousElementSibling" in document.documentElement)) {
    Object.defineProperty(Element.prototype, "previousElementSibling", {
      get: function(){
        var e = this.previousSibling;
        while(e && 1 !== e.nodeType) {
          e = e.previousSibling;
        }
        return e;
      }
    });
  }
})();