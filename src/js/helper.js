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


if (!Object.keys) Object.keys = function(o) {
  if (o !== Object(o))
    throw new TypeError('Object.keys called on a non-object');
  var k=[],p;
  for (p in o) if (Object.prototype.hasOwnProperty.call(o,p)) k.push(p);
  return k;
}

function getMapValues (obj, keys) {
  var values = [];
  for (var i = 0; i < keys.length; i++) {
    var pro = keys[i];
    values.push(obj[pro]);
  }
  return values;
}

function getWindowWidth () {
  var d = document, w = window,
  winW = w.innerWidth || d.documentElement.clientWidth || d.body.clientWidth;
  return winW;  
}

function windowResize (fn) {
  if (typeof addEventListener !== "undefined") {
    window.addEventListener('resize', fn, false);
  } else if (typeof attachEvent !== "undefined") {
    window.attachEvent('onresize', fn);
  } else {
    window.onresize = fn;
  }
}

function getItem (keys, values, def) {
  var ww = getWindowWidth();
  
  if (keys.length !== undefined && values !== undefined && keys.length === values.length) {
    if (ww < keys[0]) {
      return def;
    } else if (ww >= keys[keys.length - 1]) {
      return values[values.length - 1];
    } else {
      for (var i = 0; i < keys.length - 1; i++) {
        if (ww >= keys[i] && ww <= keys[i+1]) {
          return values[i];
        }
      }
    }
  } else {
    throw new TypeError('Keys and values are not arrays or they have different length');
  };
}