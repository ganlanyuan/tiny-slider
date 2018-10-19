// import { tns } from '../../src/tiny-slider.js';

for (var i in options) {
  var item = options[i];
  item.container = '#' + i;
  item.swipeAngle = false;
  if (!item.speed) { item.speed = speed; }
  
  if (doc.querySelector(item.container)) {
    sliders[i] = tns(options[i]);

    // call test functions
    if (initFns[i]) { initFns[i](); }

  // test responsive pages
  } else if (doc.body.className.indexOf('frame') >= 0) {
    if (i.indexOf('responsive') >= 0) {
      if (initFns[i]) { initFns[i](); }
    }
  }
}

// goto
if (doc.querySelector('#base_wrapper')) {
  var goto = doc.querySelector('#base_wrapper .goto-controls'),
      gotoBtn = goto.querySelector('.button'),
      gotoInput = goto.querySelector('input');

  gotoBtn.onclick = function (event) {
    var index = gotoInput.value;
    sliders['base'].goTo(index);
  };
}