// cross browsers addRule method
export function addCSSRule(sheet, selector, rules, index) {
  if("insertRule" in sheet) {
    sheet.insertRule(selector + "{" + rules + "}", index);
  } else if("addRule" in sheet) {
    sheet.addRule(selector, rules, index);
  }
}