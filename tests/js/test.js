if (!Object.keys) Object.keys = function(o) {
  if (o !== Object(o))
    throw new TypeError('Object.keys called on a non-object');
  var k=[],p;
  for (p in o) if (Object.prototype.hasOwnProperty.call(o,p)) k.push(p);
  return k;
}

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
  // var gap = (ua.indexOf('MSIE 8.0') > -1) ? 2 : 1;
  return Math.abs(a - b) <= 2;
}

function repeat(fn, count, timeout) {
  if (timeout) {
    for (var i = count; i--;) {
      setTimeout(function () {
        fn();
      }, i * timeout);
    }
  } else {
    for (var i = count; i--;) {
      fn();
    }
  }
}

function checkSlidesAttrs(id) {
  var info = sliders[id].getInfo(),
      slideItems = info.slideItems,
      index = info.index,
      items = info.items,
      firstVisible = slideItems[index],
      lastVisible = slideItems[index + items - 1],
      firstVisiblePrev = slideItems[index - 1],
      lastVisibleNext = slideItems[index + items],
      checkLastItem = (options[id]['axis'] === 'vertical') ? true : compare2Nums(slideItems[slideItems.length - 1].getBoundingClientRect().top, info.container.parentNode.getBoundingClientRect().top);

  return slideItems.length === info.slideCount * 5 &&
    containsClasses(firstVisible, ['tns-item']) &&
    firstVisible.id === id + '-item' + 0 &&
    firstVisible.getAttribute('aria-hidden') === 'false' &&
    !firstVisible.hasAttribute('tabindex') &&
    firstVisiblePrev.id === '' &&
    firstVisiblePrev.getAttribute('aria-hidden') === 'true' &&
    firstVisiblePrev.getAttribute('tabindex') === '-1' &&
    lastVisible.id === id + '-item' + (items - 1) &&
    lastVisible.getAttribute('aria-hidden') === 'false' &&
    !lastVisible.hasAttribute('tabindex') &&
    lastVisibleNext.getAttribute('aria-hidden') === 'true' &&
    lastVisibleNext.getAttribute('tabindex') === '-1' &&
    compare2Nums(firstVisible.clientWidth, windowWidth / items) &&
    checkLastItem;
}

function checkControlsAttrs(id) {
  var info = sliders[id].getInfo(),
      controlsContainer = info.controlsContainer,
      prevButton = info.prevButton,
      nextButton = info.nextButton,
      checkClass = options[id]['controlsContainer'] ? true : containsClasses(controlsContainer, 'tns-controls');
  return checkClass &&
    controlsContainer.getAttribute('aria-label') === 'Carousel Navigation' &&
    controlsContainer.getAttribute(tabindex) === '0' &&
    prevButton.getAttribute(tabindex) === '-1' &&
    prevButton.getAttribute('data-controls') === 'prev' &&
    prevButton.getAttribute('aria-controls') === id &&
    nextButton.getAttribute(tabindex) === '-1' &&
    nextButton.getAttribute('data-controls') === 'next' &&
    nextButton.getAttribute('aria-controls') === id;
}

function getAbsIndexAfterControlsClick(count, by, clicks) {
  return (count * multiplyer + by * clicks)%count;
}

function checkControlsClick(id, info, number, vertical) {
  var assertion = true,
      container = info.container,
      slideCount = info.slideCount,
      navItems = info.navItems,
      items = info.items,
      edge1 = 'left',
      edge2 = 'right';

  if (vertical) {
    edge1 = 'top';
    edge2 = 'bottom';
  }
      
  var wrapper = info.container.parentNode;
  function getAssertion (absIndex) {
    var visibleSlides = container.querySelectorAll("[aria-hidden='false']"),
        len = visibleSlides.length,
        first = visibleSlides[0],
        last = visibleSlides[len - 1],
        checkLastEdge = options[id]['fixedWidth'] ? true : compare2Nums(last.getBoundingClientRect()[edge2], wrapper.getBoundingClientRect()[edge2]);

    return len === items &&
      absIndex === (sliders[id].getInfo().index)%slideCount &&
      navItems[absIndex].getAttribute('aria-selected') === 'true' &&
      first.getAttribute('aria-hidden') === 'false' &&
      !first.hasAttribute(tabindex) &&
      last.getAttribute('aria-hidden') === 'false' &&
      !last.hasAttribute(tabindex) &&
      compare2Nums(first.getBoundingClientRect()[edge1], wrapper.getBoundingClientRect()[edge1]) &&
      checkLastEdge;
  }

  // click prev button n times
  if (assertion) {
    if (id === 'customize') {
      repeat(function () { simulateClick(info.prevButton); }, number);
    } else {
      repeat(function () { info.prevButton.click(); }, number);
    }
    var absIndex = getAbsIndexAfterControlsClick(info.slideCount, info.slideBy, -number);
    assertion = getAssertion(absIndex);
  }

  // click next button n times
  if (assertion) {
    if (id === 'customize') {
      repeat(function () { simulateClick(info.nextButton); }, number);
    } else {
      repeat(function () { info.nextButton.click(); }, number);
    }
    assertion = getAssertion(0);
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

function testAutoplayFn (id, testEl, timeout, equal) {
  var assertion = true,
      activeSlideIndex = sliders[id].getInfo().index;

  setTimeout(function () {
    assertion = activeSlideIndex === sliders[id].getInfo().index;
    if (equal) {
      testEl.className = (assertion) ? 'item-success' : 'item-fail';
    } else {
      testEl.className = (!assertion) ? 'item-success' : 'item-fail';
    }
  }, timeout);
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
  testAnimation1();
  testAnimation2();
  testLazyload();
  testCustomize();
  testAutoHeight();
  // testNested();
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
    return containsClasses(info.container.parentNode.parentNode, ['tns-outer']);
  });

  runTest('Inner wrapper: classes', function () {
    return containsClasses(info.container.parentNode, ['tns-inner', 'tns-ovh']);
  });

  runTest('Container: classes', function () {
    return containsClasses(info.container, ['base','tns-slider','tns-carousel','tns-horizontal']);
  });

  runTest('Slides: width, count, id, class, aria-hidden, tabindex', function () {
    return checkSlidesAttrs(id);
  });

  runTest('Slides: position', function () {
    return checkPositionEdgePadding(info, 0, 0);
  });

  runTest('Controls: class, aria-label, aria-controls, data-controls, tabindex', function () {
    return checkControlsAttrs(id);
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
    return checkControlsClick(id, info, 11);
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
      button = controls.querySelector('.button');

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
    return checkControlsClick(id, info, (info.slideCount * 3 + 2));
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
    return containsClasses(info.container.parentNode, ['tns-inner', 'tns-ovh']);
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
    return checkControlsClick(id, info, 11, 'top');
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
      info = slider.getInfo(),
      responsive = options[id]['responsive'],
      bps = Object.keys(responsive);

  addTitle(id);

  // var windowFeatures = 'menubar=yes, location=yes, resizable=yes, scrollbars=yes, status=yes, left=500, top=500 height=700, width=' + Number(bps[1]),
  //     newWindow = window.open(location.origin + '/tests/iframe.html', 'new_window', windowFeatures);
  var newWindow = document.createElement('iframe');
  newWindow.style.cssText = 'width: ' + Number(bps[1]) + 'px; height: 700px; border: 0;';
  newWindow.src = 'iframe.html';
  // newWindow.src = location.origin + '/tests/iframe.html';


  var init = addTest('Slides: init');
  var resize = addTest('Slides: resize');

  if (newWindow.addEventListener) {
    newWindow.addEventListener('load', responsiveTestsOnload, false);
  } else if (newWindow.readyState) {
    newWindow.onreadystatechange = function () {
      if (newWindow.readyState === 'complete') {
        responsiveTestsOnload();
      }
    }
  }

  document.body.appendChild(newWindow);

  function responsiveTestsOnload () {
    try {
      // var doc = newWindow.document,
      var doc = newWindow.contentDocument? newWindow.contentDocument: newWindow.contentWindow.document,
          nextButton = doc.querySelector('[data-controls="next"]');
      nextButton.click();

      var container = doc.querySelector('#' + id),
          wrapper = container.parentNode,
          visibleSlides = container.querySelectorAll('[aria-hidden="false"]'),
          len = visibleSlides.length;

      var assertion = len === responsive[bps[1]] &&
        compare2Nums(visibleSlides[0].getBoundingClientRect().left, wrapper.getBoundingClientRect().left) &&
        compare2Nums(visibleSlides[len - 1].getBoundingClientRect().right, wrapper.getBoundingClientRect().right);

      if (assertion) {
        init.className = 'item-success';

        // newWindow.resizeTo(Number(bps[2]), 700);
        newWindow.style.width = Number(bps[2]) + 'px';

        setTimeout(function () {
          visibleSlides = container.querySelectorAll('[aria-hidden="false"]');
          var len2 = visibleSlides.length;

          assertion = len2 === responsive[bps[2]] && 
            compare2Nums(visibleSlides[0].getBoundingClientRect().left, wrapper.getBoundingClientRect().left) &&
            compare2Nums(visibleSlides[len2 - 1].getBoundingClientRect().right, wrapper.getBoundingClientRect().right);
          resize.className = assertion ? 'item-success' : 'item-fail';

          // newWindow.close();
          document.body.removeChild(newWindow);
        }, 500);
      } else {
        init.className = resize.className = 'item-fail';
        // newWindow.close();
        document.body.removeChild(newWindow);
      }
    } catch (e) {
      init.className = 'item-notsure';
      resize.className = 'item-notsure';
    }
  }

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
    return checkControlsClick(id, info, 11);
  });
}

function testArrowKeys () {
  var id = 'arrowKeys',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);
  runTest('Slides: keydown', function () {
    var assertion = true,
        container = info.container,
        slideBy = info.slideBy,
        index = slider.getInfo().index;

    fire(document, 'keydown', { 'keyCode': 39 });
    assertion = slider.getInfo().index === index + slideBy;
    
    fire(document, 'keydown', { 'keyCode': 39 });
    assertion = slider.getInfo().index === index + slideBy * 2;
    
    fire(document, 'keydown', { 'keyCode': 37 });
    assertion = slider.getInfo().index === index + slideBy;

    fire(document, 'keydown', { 'keyCode': 37 });
    assertion = slider.getInfo().index === index;

    return assertion;
  });
}

function testAutoplay () {
  var id = 'autoplay',
      slider = sliders[id],
      info = slider.getInfo(),
      ops = options[id];

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

  var timeout = 100;
  if (ops['autoplayTimeout']) { timeout += ops['autoplayTimeout']; }
  if (ops['speed']) { timeout += ops['speed']; }

  var test1 = addTest('Slide: autoplay');
  testAutoplayFn(id, test1, timeout, false);

  var test2 = addTest('Slide: autoplay pause');
  setTimeout(function () {
    var buttons = info.navContainer.children,
        autoplayButton = buttons[buttons.length - 1];
    autoplayButton.click();
    testAutoplayFn(id, test2, timeout, true);
  }, timeout);
}

function testAnimation1 () {
  var id = 'animation1',
      slider = sliders[id],
      info = slider.getInfo(),
      slideCountNew = info.slideCountNew,
      items = info.items,
      slideItems = info.slideItems,
      ops = options[id],
      animateIn = ops['animateIn'] ? ops['animateIn'] : 'tns-fadeIn',
      animateOut = ops['animateOut'] ? ops['animateOut'] : 'tns-fadeOut',
      animateNormal = 'tns-normal',
      speed = ops['speed'] ? ops['speed'] + 100 : 100;

  if (localStorage['tnsAnDu'] === 'false') {
    animateIn = 'tns-fadeIn';
    animateOut = 'tns-fadeOut';
  }

  addTitle(id);

  function checkAnimationClasses() {
    var assertion = true,
        index = slider.getInfo().index;

    for (var i = slideCountNew; i--;) {
      if (assertion) {
        assertion = (i >= index && i < index + items) ? containsClasses(slideItems[i], animateIn) : containsClasses(slideItems[i], animateNormal);
      }
    }

    return assertion;
  }

  runTest('Slides: classes on init', function () {
    return checkAnimationClasses();
  });

  var test = addTest('Slides: classes after click');
  info.nextButton.click();
  setTimeout(function () {
    test.className = (checkAnimationClasses()) ? 'item-success' : 'item-fail';
  }, speed);
}

function testAnimation2 () {
  var id = 'animation2',
      slider = sliders[id],
      info = slider.getInfo(),
      container = info.container,
      items = info.items,
      slideItems = info.slideItems,
      nextButton = info.nextButton;

  addTitle(id);

  var test = addTest('Slides: position after click');
  var count = info.slideCountNew + 1;
  repeat(function () {
    nextButton.click();
  }, count, 100);
  setTimeout(function () {
    var visibleSlides = container.querySelectorAll('[aria-hidden="false"]'),
        len = visibleSlides.length,
        rect = container.parentNode.getBoundingClientRect(),
        assertion = len === items &&
          compare2Nums(visibleSlides[0].getBoundingClientRect().left, rect.left) &&
          compare2Nums(visibleSlides[len - 1].getBoundingClientRect().right, rect.right);
    test.className = assertion ? 'item-success' : 'item-fail';
  }, count * 100);
}

function testLazyload () {
  var id = 'lazyload',
      slider = sliders[id],
      info = slider.getInfo();

  var edgePadding = options[id]['edgePadding'],
      slideBy = options[id]['slideBy'],
      slideItems = info.slideItems,
      items = info.items,
      index = info.index,
      first = index,
      last = index + items - 1;

  if (edgePadding) {
    first -= 1;
    last += 1;  
  }

  addTitle(id);

  runTest('Slide: init', function () {
    var imgFirst = slideItems[first].querySelector('img'),
        imgLast = slideItems[last].querySelector('img'),
        imgPrev = slideItems[first - 1].querySelector('img'),
        imgNext = slideItems[last + 1].querySelector('img');

    return imgFirst.getAttribute('src') === imgFirst.getAttribute('data-src') &&
      imgLast.getAttribute('src') === imgLast.getAttribute('data-src') &&
      imgPrev.getAttribute('src') !== imgPrev.getAttribute('data-src') && 
      imgNext.getAttribute('src') !== imgNext.getAttribute('data-src') &&
      containsClasses(imgFirst, 'loaded') &&
      containsClasses(imgLast, 'loaded') &&
      !containsClasses(imgPrev, 'loaded') &&
      !containsClasses(imgNext, 'loaded'); 
  });

  runTest('Controls: click', function () {
    var assertion = true;

    info.nextButton.click();
    for (var i = last + 1; i < last + 1 + slideBy; i++) {
      if (assertion) {
        var img = slideItems[i].querySelector('img');
        assertion = img.getAttribute('src') === img.getAttribute('data-src') &&
          containsClasses(img, 'loaded');
      }
    }

    return assertion;
  });
}

function testCustomize () {
  var id = 'customize',
      slider = sliders[id],
      info = slider.getInfo(),
      ops = options[id];

  addTitle(id);

  runTest('Slides: width, count, id, class, aria-hidden, tabindex', function () {
    return checkSlidesAttrs(id);
  });

  runTest('Controls: aria-label, aria-controls, data-controls, tabindex', function () {
    return checkControlsAttrs(id);
  });

  runTest('Nav: aria-label, data-nav, tabindex, aria-selected, aria-controls', function () {
    var assertion = true,
        info = slider.getInfo(),
        slideCount = info.slideCount,
        absIndex = info.index%slideCount,
        navContainer = info.navContainer,
        navItems = info.navItems;

    assertion = navContainer.getAttribute('aria-label') === 'Carousel Pagination';

    while (absIndex < 0) { absIndex += slideCount; }
    for (var i = slideCount; i--;) {
      var arr = (i === absIndex) ? ['0', 'true'] : ['-1', 'false']; 
      nav = navItems[i];
      if (assertion) {
        assertion = 
          nav.getAttribute('data-nav') === i.toString() &&
          nav.getAttribute('aria-controls') === id + '-item' + i &&
          nav.getAttribute(tabindex) === arr[0] &&
          nav.getAttribute('aria-selected') === arr[1];
      }
    }
    return assertion;
  });

  if (ops['autoplay']) {
    var timeout = 100;
    if (ops['autoplayTimeout']) { timeout += ops['autoplayTimeout']; }
    if (ops['speed']) { timeout += ops['speed']; }

    var test1 = addTest('Slide: autoplay');
    testAutoplayFn(id, test1, timeout, false);

    var test2 = addTest('Slide: autoplay pause');
    setTimeout(function () {
      var autoplayButton = ops['autoplayButton'];
      autoplayButton.click();
      testAutoplayFn(id, test2, timeout, true);
    }, timeout);
  }

  runTest('Controls: click functions', function () {
    return checkControlsClick(id, info, 11);
  });
}

function testAutoHeight () {
  var id = 'autoHeight',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);
  runTest('Slide: init, click', function () {
    var assertion = true,
        wrapper = info.container.parentNode,
        slideItems = info.slideItems,
        nextButton = info.nextButton;

    assertion = compare2Nums(wrapper.clientHeight, slideItems[info.index].clientHeight);

    repeat(function () {
      nextButton.click();
      if (assertion) {
        assertion = compare2Nums(wrapper.clientHeight, slideItems[slider.getInfo().index].clientHeight);
      }
    }, 2);

    return assertion;
  });
}

function testNested () {
  var id = 'nested',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);
}

