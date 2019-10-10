import { isServer } from './isServer.js';

var win = !isServer ? window : null;

export var raf = !win ?  function(cb) { return cb(); } : win.requestAnimationFrame
  || win.webkitRequestAnimationFrame
  || win.mozRequestAnimationFrame
  || win.msRequestAnimationFrame
  || function(cb) { return setTimeout(cb, 16); };
