// get css-calc 
// @return - null | calc | -webkit-calc | -moz-calc
// @usage - var calc = getCalc(); 
export function calc() {
  var doc = document, 
      body = doc.body,
      el = doc.createElement('div'), 
      result = null;
  body.appendChild(el);
  try {
    var vals = ['calc(10px)', '-moz-calc(10px)', '-webkit-calc(10px)'], val;
    for (var i = 0; i < 3; i++) {
      val = vals[i];
      el.style.width = val;
      if (el.offsetWidth === 10) { 
        result = val.replace('(10px)', ''); 
        break;
      }
    }
  } catch (e) {}
  body.removeChild(el);

  return result;
}