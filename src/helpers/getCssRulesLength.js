// cross browsers addRule method
export var getCssRulesLength = (function () {
  var styleSheet = document.styleSheets[0];
  if(styleSheet.cssRules) {
    return function (sheet) { return sheet.cssRules.length; };
  } else {
    return function (sheet) { return sheet.rules.length; };
  }
})();