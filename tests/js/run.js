// import { tns } from '../../src/tiny-slider';

for (var i in options) {
  var item = options[i];
  item.container = '#' + i;
  item.swipeAngle = false;
  if (!item.speed) { item.speed = speed; }
  
  if (doc.querySelector(item.container)) {
    sliders[i] = tns(options[i]);

    // call test functions
    if (isTestPage && initFns[i]) { initFns[i](); }

    // insert code
    if (isDemoPage) {
      doc.querySelector('#' + i + '_wrapper').insertAdjacentHTML('beforeend', '<pre><code class="language-javascript">' + JSON.stringify(item, function (key, value) {
        if (typeof value === 'object') {
          if (value.id) {
            return "document.querySelector('#" + value.id + "')";
          }
        }
        return value;
      }, '  ') + '</code></pre>');
    }

  // test responsive pages
  } else if (i.indexOf('responsive') >= 0) {
    if (isTestPage && initFns[i]) { initFns[i](); }
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