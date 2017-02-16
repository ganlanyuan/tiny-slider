export function whichProperty(obj){
  var t, el = document.createElement('fakeelement');
  for(t in obj){
    if( el.style[t] !== undefined ){
      return [t, obj[t][0], obj[t][1]];
    }
  }

  return false; // explicit for ie9-
}