// forEach

if (!Array.prototype.forEach) {
  Array.prototype.forEach =  function(block, thisObject) {
    var len = this.length >>> 0;
    for (var i = 0; i < len; i++) {
      if (i in this) {
        block.call(thisObject, this[i], i, this);
      }
    }
  };
}
