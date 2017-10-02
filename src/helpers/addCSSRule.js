// cross browsers addRule method
export var addCSSRule = (function () {
  return function (sheet, selector, rules, index) {
      var styleSheet = document.styleSheets[0];
      if('insertRule' in styleSheet) {
          sheet.insertRule(selector + '{' + rules + '}', index);
      } else if('addRule' in styleSheet) {
          sheet.addRule(selector, rules, index);
      }
  }
})();
