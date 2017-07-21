var resultsDiv = doc.querySelector('.test-results'),
    windowWidth = getWindowWidth(),
    multiplyer = 100,
    ua = navigator.userAgent,
    tabindex = (ua.indexOf('MSIE 9.0') > -1 || ua.indexOf('MSIE 8.0') > -1) ? 'tabIndex' : 'tabindex';

document.body.onkeydown = function (e) {
  e = e || window.event;
  if (e.ctrlKey === true && e.keyCode === 192) {
    if (document.body.getAttribute('data-fire-keyevent') !== 'true') {
      document.body.setAttribute('data-fire-keyevent', 'true');
    }
  }
};

fire(document.body, 'keydown', {'ctrlKey': true, 'keyCode': 192});

function addTitle(str) {
  var title = doc.createElement('div');
  title.className = 'title';
  title.textContent = str;
  resultsDiv.appendChild(title);
}

function addTest(str, postfix) {
  var test = doc.createElement('div');
  if (!postfix) { postfix = '-running'; }
  test.className = 'item' + postfix;
  test.textContent = str;
  resultsDiv.appendChild(test);
  return test;
}

function runTest(str, fn) {
  var test = addTest(str);
  test.className = (fn()) ? 'item-success' : 'item-fail';
}

function containsClasses(el, arr) {
  var len = arr.length,
      classes = el.className,
      assertion = true;

  for (var i = 0; i < len; i++) {
    if (classes.indexOf(arr[i]) < 0) { assertion = false; }
  }

  return assertion;
}

function getWindowWidth() {
  return (document.documentElement || document.body.parentNode || document.body).clientWidth;
}

function compare2Nums(a, b) {
  return Math.abs(a - b) < 1;
}

function repeat(fn, times) {
  for (var i = times; i--;) {
    fn();
  }
}

function getAbsIndexAfterControlsClick(count, by, clicks) {
  return (count * multiplyer + by * clicks)%count;
}

// [[[[[[[[]]]]]]]]
window.onload = function () {
  testBase();
  testNonLoop();
  testRewind();
  testGoto();
};

// window.onresize = function () {
//   resultsDiv.innerHTML = '';
//   testBase();
// };

// ### base
function testBase () {
  var id = 'base',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);

  runTest('Outer wrapper: classes', function () {
    return containsClasses(info.container.parentNode.parentNode, ['tns-hdx', 'tns-outer']);
  });

  runTest('Inner wrapper: classes', function () {
    return containsClasses(info.container.parentNode, ['tns-inner']);
  });

  runTest('Container: classes', function () {
    return containsClasses(info.container, ['base','tns-slider','tns-carousel','tns-horizontal']);
  });

  runTest('Slides: width, position, count, id, class, aria-hidden, tabindex', function () {
    var slideItems = info.slideItems,
        firstVisible = slideItems[info.slideCount * 2],
        lastVisible = slideItems[info.slideCount * 2 + info.items - 1],
        firstVisiblePrev = slideItems[info.slideCount * 2 - 1],
        lastVisibleNext = slideItems[info.slideCount * 2 + info.items];

    return slideItems.length === info.slideCount * 5 &&
            containsClasses(firstVisible, ['tns-item']) &&
            firstVisible.id === id + '-item' + 0 &&
            firstVisible.getAttribute('aria-hidden') === 'false' &&
            !firstVisible.hasAttribute('tabindex') &&
            firstVisiblePrev.id === '' &&
            firstVisiblePrev.getAttribute('aria-hidden') === 'true' &&
            firstVisiblePrev.getAttribute('tabindex') === '-1' &&
            lastVisible.id === id + '-item' + (info.items - 1) &&
            lastVisible.getAttribute('aria-hidden') === 'false' &&
            !lastVisible.hasAttribute('tabindex') &&
            lastVisibleNext.getAttribute('aria-hidden') === 'true' &&
            lastVisibleNext.getAttribute('tabindex') === '-1' &&
            compare2Nums(firstVisible.clientWidth, windowWidth / info.items) &&
            compare2Nums(firstVisible.getBoundingClientRect().left, 0) &&
            compare2Nums(lastVisible.getBoundingClientRect().right, windowWidth) &&
            compare2Nums(slideItems[slideItems.length - 1].getBoundingClientRect().top, info.container.getBoundingClientRect().top);
  });

  runTest('Controls: class, aria-label, aria-controls, data-controls, tabindex', function () {
    var controlsContainer = info.controlsContainer,
        prevButton = info.prevButton,
        nextButton = info.nextButton;
    return containsClasses(controlsContainer, 'tns-controls') &&
      controlsContainer.getAttribute('aria-label') === 'Carousel Navigation' &&
      controlsContainer.getAttribute(tabindex) === '0' &&
      prevButton.getAttribute(tabindex) === '-1' &&
      prevButton.getAttribute('data-controls') === 'prev' &&
      prevButton.getAttribute('aria-controls') === id &&
      nextButton.getAttribute(tabindex) === '-1' &&
      nextButton.getAttribute('data-controls') === 'next' &&
      nextButton.getAttribute('aria-controls') === id;
  });

  runTest('Nav items: data-nav, hidden', function () {
    var navItems = info.navItems,
        nav0 = navItems[0],
        nav1 = navItems[1];
    return nav0.getAttribute('data-nav') === '0' &&
      !nav0.hasAttribute('hidden') &&
      nav1.getAttribute('data-nav') === '1' &&
      nav1.hasAttribute('hidden');
  });

  runTest('Controls: click functions', function () {
    var assertion = true;

    // click prev button
    repeat(function () { info.prevButton.click(); }, 11);
    if (assertion) {
      var absIndex = getAbsIndexAfterControlsClick(info.slideCount, info.slideBy, -11),
          current = info.container.querySelector("[aria-hidden='false']");
      assertion = 
        (slider.getInfo().index)%info.slideCount === absIndex &&
        info.navItems[absIndex].getAttribute('aria-selected') === 'true' &&
        compare2Nums(current.getBoundingClientRect().left, 0) &&
        current.querySelector('a').textContent === absIndex.toString();
    }

    // click next button
    repeat(function () { info.nextButton.click(); }, 11);
    if (assertion) {
      var absIndex = 0,
          current = info.container.querySelector("[aria-hidden='false']");
      assertion = 
        (slider.getInfo().index)%info.slideCount === absIndex &&
        info.navItems[absIndex].getAttribute('aria-selected') === 'true' &&
        compare2Nums(current.getBoundingClientRect().left, 0) &&
        current.querySelector('a').textContent === absIndex.toString();
    }

    return assertion;
  });

  runTest('Nav: click functions', function () {
    var assertion = true,
        visibleNavIndexes = info.visibleNavIndexes,
        len = visibleNavIndexes.length;

    for (var i = len; i--;) {
      info.navItems[visibleNavIndexes[i]].click();
      var current = info.container.querySelector("[aria-hidden='false']");
      if (assertion) {
        assertion = 
          info.navItems[visibleNavIndexes[i]].getAttribute('aria-selected') === 'true' &&
          (slider.getInfo().index)%info.slideCount === visibleNavIndexes[i] &&
          compare2Nums(current.getBoundingClientRect().left, 0) &&
          current.querySelector('a').textContent === visibleNavIndexes[i].toString()
          ;
      }
    }

    return assertion;
  });

  // browser support fire keyevents
  if (document.body.getAttribute('data-fire-keyevent') === 'true') {

    runTest('Controls: keydown events', function () {
      var assertion = true;

      repeat(function () { fire(info.controlsContainer, 'keydown', {'keyCode': 37}); }, 3);
      if (assertion) {
        var absIndex = getAbsIndexAfterControlsClick(info.slideCount, info.slideBy, -3),
            current = info.container.querySelector("[aria-hidden='false']");
        assertion = 
          (slider.getInfo().index)%info.slideCount === absIndex &&
          info.navItems[absIndex].getAttribute('aria-selected') === 'true' &&
          compare2Nums(current.getBoundingClientRect().left, 0) &&
          current.querySelector('a').textContent === absIndex.toString();
      }

      repeat(function () { fire(info.controlsContainer, 'keydown', {'keyCode': 39}); }, 3);
      if (assertion) {
        var absIndex = 0,
            current = info.container.querySelector("[aria-hidden='false']");
        assertion = 
          (slider.getInfo().index)%info.slideCount === absIndex &&
          info.navItems[absIndex].getAttribute('aria-selected') === 'true' &&
          compare2Nums(current.getBoundingClientRect().left, 0) &&
          current.querySelector('a').textContent === absIndex.toString();
      }

      return assertion;
    });

    runTest('Nav: keydown events', function () {
      var assertion = true,
          info = slider.getInfo(),
          navItems = info.navItems,
          visibleNavIndexes = info.visibleNavIndexes;

      navItems[visibleNavIndexes[0]].focus();
      fire(navItems[visibleNavIndexes[0]], 'keydown', {'keyCode': 39});
      // the 2nd nav item get focused
      assertion = document.activeElement === navItems[visibleNavIndexes[1]];

      // press "Enter"
      fire(navItems[visibleNavIndexes[1]], 'keydown', {'keyCode': 13});
      var current = info.container.querySelector("[aria-hidden='false']");
      if (assertion) {
        assertion = 
          info.navItems[visibleNavIndexes[1]].getAttribute('aria-selected') === 'true' &&
          (slider.getInfo().index)%info.slideCount === visibleNavIndexes[1] &&
          compare2Nums(current.getBoundingClientRect().left, 0) &&
          current.querySelector('a').textContent === visibleNavIndexes[1].toString()
          ;
      }

      fire(navItems[visibleNavIndexes[1]], 'keydown', {'keyCode': 37});
      // the 1st nav item get focused
      assertion = document.activeElement === navItems[visibleNavIndexes[0]];

      fire(navItems[visibleNavIndexes[0]], 'keydown', {'keyCode': 40});
      // the 3nd nav item get focused
      assertion = document.activeElement === navItems[visibleNavIndexes[2]];

      // press "Space"
      fire(navItems[visibleNavIndexes[2]], 'keydown', {'keyCode': 32});
      var current = info.container.querySelector("[aria-hidden='false']");
      if (assertion) {
        assertion = 
          info.navItems[visibleNavIndexes[2]].getAttribute('aria-selected') === 'true' &&
          (slider.getInfo().index)%info.slideCount === visibleNavIndexes[2] &&
          compare2Nums(current.getBoundingClientRect().left, 0) &&
          current.querySelector('a').textContent === visibleNavIndexes[2].toString()
          ;
      }


      fire(navItems[visibleNavIndexes[2]], 'keydown', {'keyCode': 38});
      // the 1st nav item get focused
      assertion = document.activeElement === navItems[visibleNavIndexes[0]];

      // press "Enter"
      fire(navItems[visibleNavIndexes[0]], 'keydown', {'keyCode': 13});

      return assertion;
    });

  // browser not support fire keyevents
  // manual test needed
  } else {
    addTest('Controls: keydown events', '-notsure');
    addTest('Nav: keydown events', '-notsure');
  }
}

function testNonLoop() {
  var id = 'non-loop',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);

  runTest('Slide: count && Controls: disabled', function () {
    return info.slideItems.length === info.slideCount &&
      info.prevButton.hasAttribute('disabled');
  });

  runTest('Controls: click functions', function () {
    var assertion = true,
        prevButton = info.prevButton,
        nextButton = info.nextButton,
        navItems = info.navItems,
        slideItems = info.slideItems;

    // click next button once
    nextButton.click();
    assertion = !prevButton.hasAttribute('disabled');

    // click next button (slideCount - items) times
    repeat(function () { nextButton.click(); }, (info.slideCount - info.items - 1));
    var current = info.slideCount - info.items;
    if (assertion) {
      assertion = 
        nextButton.hasAttribute('disabled') &&
        navItems[current].getAttribute('aria-selected') === 'true' &&
        slideItems[current].getAttribute('aria-hidden') === 'false' &&
        compare2Nums(slideItems[current].getBoundingClientRect().left, 0);
    }

    // click next button once
    nextButton.click();
    if (assertion) {
      assertion = 
        navItems[current].getAttribute('aria-selected') === 'true' &&
        slideItems[current].getAttribute('aria-hidden') === 'false';
    }

    // click prev button once
    prevButton.click();
    if (assertion) {
      assertion = !nextButton.hasAttribute('disabled');
    }

    // click prev button (slideCount - items) times
    repeat(function () { prevButton.click(); }, (info.slideCount - info.items - 1));
    var current = 0;
    if (assertion) {
      assertion = 
        prevButton.hasAttribute('disabled') &&
        navItems[current].getAttribute('aria-selected') === 'true' &&
        slideItems[current].getAttribute('aria-hidden') === 'false' &&
        compare2Nums(slideItems[current].getBoundingClientRect().left, 0);
    }

    return assertion;
  });
}

function testRewind() {
  var id = 'rewind',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);

  runTest('Slide: count && Controls: disabled', function () {
    return info.slideItems.length === info.slideCount &&
      info.prevButton.hasAttribute('disabled');
  });

  runTest('Controls: click functions', function () {
    var assertion = true,
        prevButton = info.prevButton,
        nextButton = info.nextButton,
        navItems = info.navItems,
        slideItems = info.slideItems;

    // click next button once
    nextButton.click();
    assertion = !prevButton.hasAttribute('disabled');

    // click next button (slideCount - items) times
    repeat(function () { nextButton.click(); }, (info.slideCount - info.items - 1));
    var current = info.slideCount - info.items;
    if (assertion) {
      assertion = 
        !nextButton.hasAttribute('disabled') &&
        navItems[current].getAttribute('aria-selected') === 'true' &&
        slideItems[current].getAttribute('aria-hidden') === 'false' &&
        compare2Nums(slideItems[current].getBoundingClientRect().left, 0);
    }

    // click next button once
    nextButton.click();
    var current = 0;
    if (assertion) {
      assertion = 
        prevButton.hasAttribute('disabled') &&
        navItems[current].getAttribute('aria-selected') === 'true' &&
        slideItems[current].getAttribute('aria-hidden') === 'false' &&
        compare2Nums(slideItems[current].getBoundingClientRect().left, 0);
    }

    return assertion;
  });
}

function testGoto () {
  var id = 'goto',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);
}