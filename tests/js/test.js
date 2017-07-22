var resultsDiv = doc.querySelector('.test-results'),
    windowWidth = getWindowWidth(),
    multiplyer = 100,
    edgePadding = 50,
    gutter = 10,
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

function checkControlsClick (slider, info, number, edge) {
  var assertion = true;
  edge = edge || 'left';
  var innerWrapperEdge = info.container.parentNode.getBoundingClientRect()[edge];

  // click prev button n times
  repeat(function () { info.prevButton.click(); }, number);
  if (assertion) {
    var absIndex = getAbsIndexAfterControlsClick(info.slideCount, info.slideBy, -number),
        current = info.container.querySelector("[aria-hidden='false']");
    assertion = 
      (slider.getInfo().index)%info.slideCount === absIndex &&
      info.navItems[absIndex].getAttribute('aria-selected') === 'true' &&
      compare2Nums(current.getBoundingClientRect()[edge], innerWrapperEdge) &&
      current.querySelector('a').textContent === absIndex.toString();
  }

  // click next button n times
  repeat(function () { info.nextButton.click(); }, number);
  if (assertion) {
    var absIndex = 0,
        current = info.container.querySelector("[aria-hidden='false']");
    assertion = 
      (slider.getInfo().index)%info.slideCount === absIndex &&
      info.navItems[absIndex].getAttribute('aria-selected') === 'true' &&
      compare2Nums(current.getBoundingClientRect()[edge], innerWrapperEdge) &&
      current.querySelector('a').textContent === absIndex.toString();
  }

  return assertion;
}

function checkPositionEdgePadding (info, padding, gap, vertical) {
  padding = padding || 0;
  vertical = vertical || false;
  var slideItems = info.slideItems,
      cloneCount = info.cloneCount,
      wrapper = info.container.parentNode,
      edge1 = (vertical) ? 'top' : 'left',
      edge2 = (vertical) ? 'bottom' : 'right',
      gutterAdjust = (vertical) ? 0 : (padding) ? gap : 0;

  if (!vertical) { wrapper = wrapper.parentNode; }
  return compare2Nums(slideItems[cloneCount].getBoundingClientRect()[edge1] - (padding + gap), wrapper.getBoundingClientRect()[edge1]) &&
    compare2Nums(slideItems[cloneCount + info.items - 1].getBoundingClientRect()[edge2] - gutterAdjust, wrapper.getBoundingClientRect()[edge2] - (padding + gap));
}

// [[[[[[[[]]]]]]]]
window.onload = function () {
  testBase();
  testGoto();
  testNonLoop();
  testRewind();
  testFixedWidth();
  testFixedWidthGutter();
  testFixedWidthEdgePadding();
  testFixedWidthEdgePaddingGutter();
  testVertical();
  testVerticalGutter();
  testVerticalEdgePadding();
  testVerticalEdgePaddingGutter();
  testResponsive();
  testMouseDrag();
  testGutter();
  testEdgePadding();
  testEdgePaddingGutter();
  testFewitems();
  testSlideByPage();
  testArrowKeys();
  testAutoplay();
  testAnimation();
  testLazyload();
  testCustomize();
  testAutoHeight();
  testNested();
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

  runTest('Slides: width, count, id, class, aria-hidden, tabindex', function () {
    var slideItems = info.slideItems,
        firstVisible = slideItems[info.cloneCount],
        lastVisible = slideItems[info.cloneCount + info.items - 1],
        firstVisiblePrev = slideItems[info.cloneCount - 1],
        lastVisibleNext = slideItems[info.cloneCount + info.items];

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
            compare2Nums(slideItems[slideItems.length - 1].getBoundingClientRect().top, info.container.getBoundingClientRect().top);
  });

  runTest('Slides: position', function () {
    return checkPositionEdgePadding(info, 0, 0);
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
    return checkControlsClick (slider, info, 11);
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
      info = slider.getInfo(),
      controls = document.querySelector('#goto_wrapper .goto-controls'),
      input = controls.querySelector('input'),
      button = controls.querySelector('button');

  addTitle(id);
  runTest('Random positive numbers', function () {
    var assertion = true,
        mul = 100;

    function checkGoto() {
      var number = Math.round(Math.random() * mul);
      input.value = number;
      button.click();
      while (number < 0) { number += info.slideCount; }
      if (assertion) {
        assertion = slider.getInfo().index%info.slideCount === number%info.slideCount;
      }
    }

    repeat(checkGoto, 3);

    mul = -100;
    repeat(checkGoto, 3);

    return assertion;
  });
}

function testFixedWidth() {
  var id = 'fixedWidth',
      fixedWidth = 300,
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);

  runTest('Slides: position', function () {
    var assertion = true,
        slideItems = info.slideItems,
        slideCount = info.slideCount,
        items = info.items;
    assertion = items === Math.floor(windowWidth / fixedWidth) &&
      compare2Nums(slideItems[slideCount*2].getBoundingClientRect().left, 0);
    return assertion;
  });

  runTest('Controls: click functions', function () {
    return checkControlsClick (slider, info, (info.slideCount * 3 + 2));
  });
}

function testFixedWidthGutter () {
  var id = 'fixedWidth-gutter',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);

  runTest('Slides: gutter', function () {
    var slideItems = info.slideItems;
    return compare2Nums(slideItems[0].clientWidth, 310);
  });
}

function testFixedWidthEdgePadding () {
  var id = 'fixedWidth-edgePadding',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);
  runTest('Slides: edge padding', function () {
    var slideItems = info.slideItems,
        cloneCount = info.cloneCount,
        items = info.items;

    return compare2Nums(slideItems[cloneCount].getBoundingClientRect().left, windowWidth - slideItems[cloneCount + items - 1].getBoundingClientRect().right);
  });
}

function testFixedWidthEdgePaddingGutter () {
  var id = 'fixedWidth-edgePadding-gutter',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);
  runTest('Slides: edge padding', function () {
    var slideItems = info.slideItems,
        cloneCount = info.cloneCount,
        items = info.items;

    return compare2Nums(slideItems[cloneCount].getBoundingClientRect().left, windowWidth - slideItems[cloneCount + items - 1].getBoundingClientRect().right + 10);
  });
}

function testVertical () {
  var id = 'vertical',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);

  runTest('Inner wrapper: classes', function () {
    return containsClasses(info.container.parentNode, ['tns-inner', 'tns-hdy']);
  });

  runTest('Container: classes', function () {
    return containsClasses(info.container, ['tns-slider', 'tns-carousel', 'tns-vertical']);
  });

  runTest('Slides: width', function () {
    var slideItems = info.slideItems;

    return compare2Nums(slideItems[0].getBoundingClientRect().left, 0) &&
      compare2Nums(slideItems[0].getBoundingClientRect().right, windowWidth);
  });

  runTest('Slides: position', function () {
    return checkPositionEdgePadding(info, 0, 0, true);
  });

  runTest('slides: click functions', function () {
    return checkControlsClick (slider, info, 11, 'top');
  });
}

function testVerticalGutter() {
  var id = 'vertical-gutter',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);
  runTest('Slides: position, gutter', function () {
    var slideItems = info.slideItems,
        cloneCount = info.cloneCount,
        innerWrapper = info.container.parentNode;

    return compare2Nums(slideItems[cloneCount].getBoundingClientRect().top, innerWrapper.getBoundingClientRect().top) &&
      compare2Nums(slideItems[cloneCount].getBoundingClientRect().bottom, slideItems[cloneCount + 1].getBoundingClientRect().top - 10) &&
      compare2Nums(slideItems[cloneCount + info.items - 1].getBoundingClientRect().bottom, innerWrapper.getBoundingClientRect().bottom - 10);
  });
}

function testVerticalEdgePadding () {
  var id = 'vertical-edgePadding',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);
  runTest('Slides: position, edge padding', function () {
    return checkPositionEdgePadding(info, edgePadding, 0, true);
  });
}

function testVerticalEdgePaddingGutter () {
  var id = 'vertical-edgePadding-gutter',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);
  runTest('Slides: position, edge padding', function () {
    return checkPositionEdgePadding(info, edgePadding, gutter, true);
  });}

function testResponsive() {
  var id = 'responsive',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);
}

function testMouseDrag() {
  var id = 'mouse-drag',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);
}

function testGutter() {
  var id = 'gutter',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);
  runTest('Slide: gutter', function () {
    var slideItems = info.slideItems,
        cloneCount = info.cloneCount;

    return compare2Nums(slideItems[cloneCount].getBoundingClientRect().right, slideItems[cloneCount + 1].getBoundingClientRect().left);
  });
}

function testEdgePadding() {
  var id = 'edgePadding',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);
  runTest('Slide: position', function () {
    return checkPositionEdgePadding(info, edgePadding, 0);
  });
}

function testEdgePaddingGutter() {
  var id = 'edgePadding-gutter',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);
  runTest('Slide: position', function () {
    return checkPositionEdgePadding(info, edgePadding, gutter);
  });
}

function testFewitems() {
  var id = 'few-items',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);
  runTest('Slide: count && controls: hidden && nav: hidden', function () {
    return compare2Nums(info.slideItems[info.slideCount * 3 - 1].getBoundingClientRect().right, windowWidth) &&
      info.controlsContainer.hasAttribute('hidden') &&
      info.navContainer.hasAttribute('hidden');
  });
}

function testSlideByPage () {
  var id = 'slide-by-page',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);
  runTest('Controls: click', function () {
    return checkControlsClick(slider, info, 11);
  });
}

function testArrowKeys () {
  var id = 'arrowKeys',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);
}

function testAutoplay () {
  var id = 'autoplay',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);

  runTest('autoplayButton: attrs, click', function () {
    var assertion = true,
        buttons = info.navContainer.children,
        autoplayButton = buttons[buttons.length - 1];

    assertion = autoplayButton.getAttribute('data-action') === 'stop' && 
      autoplayButton.textContent.indexOf('Stop Animation') > -1;

    autoplayButton.click();
    if (assertion) {
      assertion = autoplayButton.getAttribute('data-action') === 'start' &&
      autoplayButton.textContent.indexOf('Start Animation') > -1;
    }

    autoplayButton.click();
    if (assertion) {
      assertion = autoplayButton.getAttribute('data-action') === 'stop' &&
      autoplayButton.textContent.indexOf('Stop Animation') > -1;
    }

    return assertion;
  });

  function testAutoplayFn (el, condition) {
    var assertion = true,
        container = info.container,
        activeSlideIndex = container.querySelector('[aria-hidden="false"] a').textContent;

    setTimeout(function () {
      assertion = activeSlideIndex === container.querySelector('[aria-hidden="false"] a').textContent;
      if (condition) {
        el.className = (assertion) ? 'item-success' : 'item-fail';
      } else {
        el.className = (!assertion) ? 'item-success' : 'item-fail';
      }
    }, options[id]['autoplayTimeout'] + options[id]['speed'] + 100);
  };

  var test1 = addTest('Slide: autoplay');
  testAutoplayFn(test1, false);

  var test2 = addTest('Slide: autoplay pasue');
  setTimeout(function () {
    var buttons = info.navContainer.children,
        autoplayButton = buttons[buttons.length - 1];
    autoplayButton.click();
    testAutoplayFn(test2, true);
  }, options[id]['autoplayTimeout'] + options[id]['speed'] + 100);
}

function testAnimation () {
  var id = 'animation',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);
}

function testLazyload () {
  var id = 'lazyload',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);
}

function testCustomize () {
  var id = 'customize',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);
}

function testAutoHeight () {
  var id = 'autoHeight',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);
}

function testNested () {
  var id = 'nested',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);
}

