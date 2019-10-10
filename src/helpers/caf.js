
import { isServer } from './isServer.js';

var win = !isServer ? window : null;

export var caf = !win ? function(id) { return; } : win.cancelAnimationFrame
  || win.mozCancelAnimationFrame
  || function(id){ clearTimeout(id); };
