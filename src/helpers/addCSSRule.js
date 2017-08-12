// cross browsers addRule method
export var addCSSRule = (function () {
  var styleSheet = document.styleSheets[0];
  if('insertRule' in styleSheet) {

    return function (sheet, selector, rules, index) {
      sheet.insertRule(selector + '{' + rules + '}', index);
    };
  } else if('addRule' in styleSheet) {

    return function (sheet, selector, rules, index) {
      sheet.addRule(selector, rules, index);
    };
  }
})();