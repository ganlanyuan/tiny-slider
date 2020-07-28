import { isNodeList } from "./isNodeList.js";

export function setAttrs(els, attrs) {
  els = (isNodeList(els) || els instanceof Array) ? els : [els];
  if (Object.prototype.toString.call(attrs) !== '[object Object]') { return; }

  for (var i = els.length; i--;) {
    for(var key in attrs) {
      // Create HTMLDOMElemnt from string value
      if(typeof els[i] === 'string') {
        let attr = els[i].substr(0, 1);
        let attrValue = els[i].substr(1);
        els[i] = document.createElement('div');
        
        if(attr === '#') {
          els[i].setAttribute('id', attrValue);
        } else {
          els[i].setAttribute('class', attrValue.slit('.').join(' '));
        }
      }
      
      els[i].setAttribute(key, attrs[key]);
    }
  }
}
