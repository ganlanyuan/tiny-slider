// extend
function extend() {
  var obj, name, copy,
  target = arguments[0] || {},
  i = 1,
  length = arguments.length;

  for (; i < length; i++) {
    if ((obj = arguments[i]) !== null) {
      for (name in obj) {
        copy = obj[name];

        if (target === copy) { 
          continue; 
        } else if (copy !== undefined) {
          target[name] = copy;
        }
      }
    }
  }
  return target;
}

function eventListen(t, fn, o) {
  o = o || window;
  var e = t+Math.round(Math.random()*99999999);
  if ( o.attachEvent ) {
    o['e'+e] = fn;
    o[e] = function(){
      o['e'+e]( window.event );
    };
    o.attachEvent( 'on'+t, o[e] );
  }else{
    o.addEventListener( t, fn, false );
  }
}

function addClass(el, name) {
  var name = ' ' + name;
  if(el.className.indexOf(name) === -1) {
    el.className += name;
  }
}

function removeClass(el, name) {
  var name = ' ' + name;
  if(el.className.indexOf(name) !== -1) {
    el.className = el.className.replace(name, '');
  }
}
