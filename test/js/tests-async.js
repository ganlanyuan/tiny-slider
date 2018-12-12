var body = doc.body,
    resultsDiv = doc.querySelector('.test-results'),
    windowWidth = getWindowWidth(),
    multiplyer = 100,
    edgePadding = 50,
    gutter = 10,
    ua = navigator.userAgent,
    tabindex = (ua.indexOf('MSIE 9.0') > -1 || ua.indexOf('MSIE 8.0') > -1) ? 'tabIndex' : 'tabindex',
    canFireKeydown,
    navActiveClass = 'tns-nav-active';

function getWindowWidth () {
  return (doc.documentElement || doc.body.parentNode || doc.body).clientWidth;
}

doc.onkeydown = function(e) {
  e = e || window.event;
  if (e.ctrlKey === true && e.keyCode === 192) {
    if (body.getAttribute('data-fire-keyevent') !== 'true') {
      body.setAttribute('data-fire-keyevent', 'true');
    }
  }
};

fire(doc, 'keydown', {'ctrlKey': true, 'keyCode': 192});
canFireKeydown = (body.getAttribute('data-fire-keyevent') === 'true') ? true : false;






















// ### base
async function testBase () {
  var id = 'base',
      slider = sliders[id],
      info = slider.getInfo(),
      items = info.items,
      container = info.container,
      innerWrapper = container.parentNode,
      slideItems = info.slideItems,
      navItems = info.navItems,
      pages = info.pages,
      slideCount = info.slideCount,
      cloneCount = info.cloneCount,
      assertion;

  addTitle(id);

  runTest('Outer wrapper: classes', function() {
    return containsClasses(innerWrapper.parentNode.parentNode, ['tns-outer']);
  });

  runTest('Middle wrapper: classes', function() {
    return containsClasses(innerWrapper.parentNode, ['tns-ovh']);
  });

  runTest('Inner wrapper: classes', function() {
    return containsClasses(innerWrapper, ['tns-inner']);
  });

  runTest('Container: classes', function() {
    return containsClasses(container, ['base','tns-slider','tns-carousel','tns-horizontal']);
  });

  runTest('Slides: width, count, id, class, aria-hidden, tabindex', function() {
    return checkSlidesAttrs(id);
  });

  runTest('Slides: position', function() {
    return checkPositionEdgePadding(id);
  });

  runTest('Controls: class, aria-label, aria-controls, data-controls, tabindex', function() {
    return checkControlsAttrs(id);
  });

  runTest('Nav items: data-nav, hidden', function() {
    var navVisible = navItems[0],
        navHidden = navItems[3];

    return navVisible.getAttribute('data-nav') === '0' &&
      navVisible.style.display !== 'none' &&
      navHidden.getAttribute('data-nav') === '3' &&
      navHidden.style.display === 'none';
  });

  var controlsClick = addTest('Controls: click functions'),
      navClick = addTest('Nav: click functions'),
      controlsKeydown = addTest('Controls: keydown events'),
      navKeydown = addTest('Nav: keydown events'),
      testGoto = addTest('Goto: Random numbers');

  // controls click
  await checkControlsClick(controlsClick, id, 11);

  // nav click
  for (var i = pages; i--;) {
    navItems[i].click();

    var current = slider.getInfo().index,
        currentSlide = slideItems[current];

    if (assertion !== false) {
      assertion = 
        navItems[i].className.indexOf(navActiveClass) >= 0 &&
        getAbsIndex(current, 0, info) === i * items &&
        compare2Nums(currentSlide.getBoundingClientRect().left, 0) &&
        !currentSlide.hasAttribute('aria-hidden');
    }
  }

  updateTest(navClick, assertion);

  // keydown events
  if (canFireKeydown) {

    // controls keydown
    await repeat(function() {
      // fire keydown events on left arrow
      fire(info.controlsContainer, 'keydown', {'keyCode': 37}); 
    }, 3);

    var prev = info.index,
        current = slider.getInfo().index,
        absIndex = getAbsIndex(prev, -3, info),
        currentSlide = slideItems[current];
        
    assertion = 
      current === absIndex + cloneCount &&
      navItems[Math.floor(absIndex/items)].className.indexOf(navActiveClass) >= 0 &&
      compare2Nums(currentSlide.getBoundingClientRect().left, innerWrapper.getBoundingClientRect().left);

    if (assertion) {
      // fire keydown events on right arrow
      await repeat(function() { 
        fire(info.controlsContainer, 'keydown', {'keyCode': 39});
      }, 3);

      current = slider.getInfo().index;
      absIndex = 0;
      currentSlide = slideItems[current];
          
      assertion = 
        current === absIndex + cloneCount &&
        navItems[Math.floor(absIndex/items)].className.indexOf(navActiveClass) >= 0 &&
        compare2Nums(currentSlide.getBoundingClientRect().left, innerWrapper.getBoundingClientRect().left);
    }

    updateTest(controlsKeydown, assertion);

    // nav keydown
    var navContainer = info.navContainer,
        wrapperLeft = innerWrapper.getBoundingClientRect().left;
    // focus on the 1st nav item
    navItems[0].focus();
    // fire keydown event on right arrow
    // the 2nd nav item get focused
    fire(navContainer, 'keydown', {'keyCode': 39});
    assertion = document.activeElement === navItems[1];
    // press "Enter"
    fire(navContainer, 'keydown', {'keyCode': 13});
    var current = slider.getInfo().index,
        currentSlide = slideItems[current];
    if (assertion) {
      assertion = 
        getAbsIndex(current, 0, info) === 1 &&
        navItems[1].className.indexOf(navActiveClass) >= 0 &&
        compare2Nums(currentSlide.getBoundingClientRect().left, wrapperLeft);
    }
    // fire keydown event on left arrow
    // the 1st nav item get focused
    fire(navContainer, 'keydown', {'keyCode': 37});
    if (assertion) {
      assertion = document.activeElement === navItems[0];
    }
    // press "Enter"
    fire(navContainer, 'keydown', {'keyCode': 13});
    var current = slider.getInfo().index,
        currentSlide = slideItems[current];

    if (assertion) {
      assertion = 
        getAbsIndex(current, 0, info) === 0 &&
        navItems[0].className.indexOf(navActiveClass) >= 0 &&
        compare2Nums(currentSlide.getBoundingClientRect().left, wrapperLeft);
    }
    // fire keydown event on right arrow 2 times
    // the 3nd nav item get focused
    fire(navContainer, 'keydown', {'keyCode': 39});
    fire(navContainer, 'keydown', {'keyCode': 39});
    if (assertion) {
      assertion = document.activeElement === navItems[2];
    }
    // press "Space"
    fire(navContainer, 'keydown', {'keyCode': 32});
    var current = slider.getInfo().index,
        currentSlide = slideItems[current];

    if (assertion) {
      assertion = 
        getAbsIndex(current, 0, info) === 2 &&
        navItems[2].className.indexOf(navActiveClass) >= 0 &&
        compare2Nums(currentSlide.getBoundingClientRect().left, wrapperLeft);
    }

    updateTest(navKeydown, assertion);
  } else {
    updateTest(controlsKeydown, '?');
    updateTest(navKeydown, '?');
  }

  // go to
  var controls = document.querySelector('#base_wrapper .goto-controls'),
      input = controls.querySelector('input'),
      button = controls.querySelector('.button'),
      mul = 10;

  function checkGoto () {
    var number = Math.round(Math.random() * mul);
    input.value = number;
    button.click();

    number = Math.max(0, Math.min(slideCount - 1, number));

    if (assertion) {
      var ind = slider.getInfo().index - cloneCount;
      while (ind < 0) { ind += slideCount; }
      assertion = ind%slideCount === number;
    }
  }

  await repeat(checkGoto, 3);
  mul = -10;
  await repeat(checkGoto, 3);

  updateTest(testGoto, assertion);
  assignDone(id);
}






















// ### startIndex
async function testStartIndex () {
  var arr = ['carousel-loop', 'carousel-non-loop', 'gallery-loop', 'gallery-non-loop'],
      testid = 'start-index';

  addTitle(testid);

  function getStartIndex (clc, slc, it, opt) {
    var ind = opt['startIndex'];
    ind = ind ? Math.max(0, Math.min(opt.loop !== false ? slc - 1 : slc - it, ind)) : 0;
    return opt.mode !== 'gallery' ? ind + clc : ind;
  }

  function startIndexFn (id) {
    var info = sliders[id].getInfo(),
        slideItems = info.slideItems,
        items = info.items,
        slideCount = info.slideCount,
        cloneCount = info.cloneCount;
    // console.log(slideItems[getStartIndex(cloneCount, slideCount, items, options[id])].getBoundingClientRect().left);
    return Math.abs(slideItems[getStartIndex(cloneCount, slideCount, items, options[id])].getBoundingClientRect().left) < 1;
  }

  arr.forEach(function(item) {
    runTest(item, function() { return startIndexFn('start-index-' + item); });
  });

  assignDone(testid);
}

























async function testNonLoop () {
  var id = 'non-loop',
      slider = sliders[id],
      info = slider.getInfo(),
      slideCount = info.slideCount,
      items = info.items;

  addTitle(id);

  runTest('Slide: count && Controls: disabled', function() {
    return info.slideItems.length === info.slideCount &&
      info.prevButton.hasAttribute('disabled');
  });

  var test = addTest('Controls: click functions');
  var assertion,
      prevButton = info.prevButton,
      nextButton = info.nextButton,
      navItems = info.navItems,
      slideItems = info.slideItems,
      current;

  nextButton.click();
  assertion = !prevButton.hasAttribute('disabled');

  // click next button (slideCount - items) times
  await repeat(function() { nextButton.click(); }, (slideCount - items - 1));
  current = slideCount - items;
  if (assertion) {
    assertion = 
      nextButton.hasAttribute('disabled') &&
      navItems[Math.floor(current/items)].className.indexOf(navActiveClass) >= 0 &&
      !slideItems[current].hasAttribute('aria-hidden') &&
      compare2Nums(slideItems[current].getBoundingClientRect().left, 0);
  }

  // click next button once
  nextButton.click();
  if (assertion) {
    current = slideCount - items;
    assertion = 
      navItems[Math.floor(current/items)].className.indexOf(navActiveClass) >= 0 &&
      !slideItems[current].hasAttribute('aria-hidden');
  }

  // click prev button once
  prevButton.click();
  if (assertion) {
    assertion = !nextButton.hasAttribute('disabled');
  }

  // click prev button (slideCount - items) times
  await repeat(function() { prevButton.click(); }, (slideCount - items - 1) );
  current = 0;
  if (assertion) {
    assertion = 
      prevButton.hasAttribute('disabled') &&
      navItems[Math.floor(current/items)].className.indexOf(navActiveClass) >= 0 &&
      !slideItems[current].hasAttribute('aria-hidden') &&
      compare2Nums(slideItems[current].getBoundingClientRect().left, 0);
  }

  updateTest(test, assertion);
  assignDone(id);
}

























function testRewind () {
  var id = 'rewind',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);

  runTest('Slide: count && Controls: disabled', function() {
    return info.slideItems.length === info.slideCount &&
      !info.prevButton.hasAttribute('disabled');
  });

  var test = addTest('Controls: click functions');
  var assertion,
      container = info.container,
      prevButton = info.prevButton,
      nextButton = info.nextButton,
      navItems = info.navItems,
      slideItems = info.slideItems,
      items = info.items,
      count = info.slideCountNew;

  prevButton.click();
  assertion = compare2Nums(slideItems[count - 1].getBoundingClientRect().right, container.parentNode.getBoundingClientRect().right);

  if (assertion) {
    nextButton.click();
    assertion = compare2Nums(slideItems[0].getBoundingClientRect().left, 0);
  }

  updateTest(test, assertion);
  assignDone(id);
}
























function testFixedWidth () {
  var id = 'fixedWidth',
      fixedWidth = fw,
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);

  runTest('Slides: position', function() {
    var assertion,
        slideItems = info.slideItems,
        slideCount = info.slideCount,
        cloneCount = info.cloneCount,
        items = info.items;
    assertion = items === Math.floor(windowWidth / fixedWidth) &&
      compare2Nums(slideItems[cloneCount].getBoundingClientRect().left, 0);

    return assertion;
  });

  var controlsClick = addTest('Controls: click functions');
  checkControlsClick(controlsClick, id, (info.slideCount * 3 + 2), false, true);
}























function testFixedWidthGutter () {
  var id = 'fixedWidth-gutter',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);

  runTest('Slides: gutter', function() {
    var slideItems = info.slideItems;
    return compare2Nums(slideItems[0].clientWidth, fw + gutter);
  });
  assignDone(id);
}

























function testFixedWidthEdgePadding () {
  var id = 'fixedWidth-edgePadding',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);
  runTest('Slides: edge padding', function() {
    var innerWrapper = info.container.parentNode;

    return compare2Nums(innerWrapper.getBoundingClientRect().left, edgepadding) &&
      compare2Nums(getWindowWidth() - innerWrapper.getBoundingClientRect().right, edgepadding);
  });
  assignDone(id);
}




















function testFixedWidthEdgePaddingGutter () {
  var id = 'fixedWidth-edgePadding-gutter',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);
  runTest('Slides: edge padding', function() {
    var innerWrapper = info.container.parentNode;

    return compare2Nums(innerWrapper.getBoundingClientRect().left, edgepadding) &&
      compare2Nums(getWindowWidth() - innerWrapper.getBoundingClientRect().right, edgepadding - gutter);
  });
  assignDone(id);
}




















function testVertical () {
  var id = 'vertical',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);

  runTest('Outer wrapper should has class: tns-ovh', function() {
    return containsClasses(info.container.parentNode.parentNode, ['tns-ovh']);
  });

  runTest('Inner wrapper should has class: tns-inner', function() {
    return containsClasses(info.container.parentNode, ['tns-inner']);
  });

  runTest('Container should has classes: tns-slider, tns-carousel, tns-vertical', function() {
    return containsClasses(info.container, ['tns-slider', 'tns-carousel', 'tns-vertical']);
  });

  runTest('The 1st visible slide should occupy the full viewport width', function() {
    var slideItems = info.slideItems;

    return compare2Nums(slideItems[0].getBoundingClientRect().left, 0) &&
      compare2Nums(slideItems[0].getBoundingClientRect().right, windowWidth);
  });

  runTest('Slides: position', async function() {
    await wait(100);
    return checkPositionEdgePadding(id, true);
  });

  var controlsClick = addTest('slides: click functions');
  (async function() {
    await wait(500);
    checkControlsClick(controlsClick, id, 11, true, true);
  })();
}




















function testVerticalGutter () {
  var id = 'vertical-gutter',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);
  runTest('Slides: position, gutter', async function() {
    await wait(500);
    var slideItems = info.slideItems,
        cloneCount = info.cloneCount,
        firstRect = slideItems[cloneCount].getBoundingClientRect(),
        secondRect = slideItems[cloneCount + 1].getBoundingClientRect(),
        lastRect = slideItems[cloneCount + info.items - 1].getBoundingClientRect(),
        innerWrapperRect = info.container.parentNode.getBoundingClientRect();

    return compare2Nums(firstRect.top, innerWrapperRect.top) &&
      compare2Nums(firstRect.bottom, secondRect.top - gutter) &&
      compare2Nums(lastRect.bottom, innerWrapperRect.bottom - gutter);
  });
  assignDone(id);
}




















function testVerticalEdgePadding () {
  var id = 'vertical-edgePadding',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);
  runTest('Slides: position, edge padding', async function() {
    await wait(500);
    return checkPositionEdgePadding(id, true);
  });
  assignDone(id);
}




















function testVerticalEdgePaddingGutter () {
  var id = 'vertical-edgePadding-gutter',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);
  runTest('Slides: position, edge padding', async function() {
    await wait(500);
    return checkPositionEdgePadding(id, true);
  });
  assignDone(id);
}


















function center_regular (id) {
  var slider = sliders[id], nextButton = slider.getInfo().nextButton;

  addTitle(id);
  runTest('Init: current slide should be in the center of the viewport', async function() {
    await wait(300);
    return checkPositionCenter(id);
  });

  runTest('After controls click: current slide should be in the center of the viewport', async function() {

    await repeat(function() { nextButton.click(); }, 10);
    await wait(300);
    
    return checkPositionCenter(id);
  });

  assignDone(id);
}
function testCenterNonLoop () {
  center_regular('center-non-loop');
}
function testCenterLoop () {
  center_regular('center-loop');
}
function testCenterFixedWidthNonLoop () {
  center_regular('center-fixedWidth-non-loop');
}
function testCenterFixedWidthLoop () {
  center_regular('center-fixedWidth-loop');
}




















function center_autoWidth (id) {
  var slider = sliders[id];

  addTitle(id);
  var testInit = addTest('Init: current slide should be in the center of the viewport'),
      testAfterClick = addTest('After controls click: current slide should be in the center of the viewport');

  waitUntilInit(slider, async function() {
    await wait(300);
    updateTest(testInit, checkPositionCenter(id));

    await wait(1000);
    var nextButton = slider.getInfo().nextButton;
    await repeat(function() { nextButton.click(); }, 10);
    await wait(1000);
    
    updateTest(testAfterClick, checkPositionCenter(id, true));

    assignDone(id);
  });
}
function testCenterAutoWidthNonLoop () {
  center_autoWidth('center-autoWidth-non-loop');
}
function testCenterAutoWidthLoop () {
  center_autoWidth('center-autoWidth-loop');
}
function testCenterAutoWidthNonLoopEdgePadding () {
  center_autoWidth('center-autoWidth-non-loop-edgePadding');
}
function testCenterAutoWidthLoopEdgePadding () {
  center_autoWidth('center-autoWidth-loop-edgePadding');
}





















function forEach (arr, callback, scope) {
  for (var i = 0, l = arr.length; i < l; i++) {
    callback.call(scope, arr[i], i);
  }
}
function check_lazyload (id) {
  var val = true,
      imgs = doc.querySelectorAll('#' + id + ' .tns-slide-active .tns-lazy-img'),
      activeSlides = doc.querySelectorAll('#' + id + ' .tns-slide-active'),
      nextNotActiveSlide = activeSlides[activeSlides.length - 1].nextElementSibling;

  forEach(imgs, function(img, i) {
    if (val) { val = img.src === img.getAttribute('data-src'); }
  });

  if (val && nextNotActiveSlide) {
    var img = nextNotActiveSlide.querySelector('.tns-lazy-img');
    val = img.src !== img.getAttribute('data-src');
  }

  return val;
}
function center_lazyload (id) {
  var slider = sliders[id];

  addTitle(id);
  var str = 'images in active slides should be loaded, images not in active slides should not',
      testInit = addTest('Init: ' + str),
      testAfterClick = addTest('After controls click: ' + str);

  waitUntilInit(slider, async function() {
    await wait(500);
    updateTest(testInit, check_lazyload(id));

    await wait(1000);
    slider.getInfo().nextButton.click();
    await wait(500);
    
    updateTest(testAfterClick, check_lazyload(id));

    assignDone(id);
  });
}
function testCenterLazyLoadNonLoop () {
  center_lazyload('center-lazyload-non-loop');
}
function testCenterLazyLoadLoop () {
  center_lazyload('center-lazyload-loop');
}
function testCenterLazyLoadFixedWidthNonLoop () {
  center_lazyload('center-lazyload-fixedWidth-non-loop');
}
function testCenterLazyLoadFixedWidthLoop () {
  center_lazyload('center-lazyload-fixedWidth-loop');
}
function testCenterLazyLoadAutoWidthNonLoop () {
  center_lazyload('center-lazyload-autoWidth-non-loop');
}
function testCenterLazyLoadAutoWidthLoop () {
  center_lazyload('center-lazyload-autoWidth-loop');
}





















function testResponsive1 () {
  var id = 'responsive1',
      responsive = options[id]['responsive'],
      bps = Object.keys(responsive).sort(function(a, b) { return a - b; });

  addTitle(id + ': items, slideBy, gutter, edgePadding update');

  var testItems = addTest('items'),
      testSlideBy = addTest('slideBy'),
      testGutter = addTest('gutter'),
      testEdgePadding = addTest('edgePadding'),
      newWindow = document.createElement('iframe');
  newWindow.setAttribute('frameBorder', '0');
  newWindow.style.cssText = 'width: ' + (Number(bps[0]) + 20) + 'px; height: 1000px; border-width: 0; overflow: hidden;';
  newWindow.src = id + prefix + '.html';

  if (newWindow.addEventListener) {
    newWindow.addEventListener('load', responsive1Tests, false);
  } else if (newWindow.readyState) {
    newWindow.onreadystatechange = function() {
      if (newWindow.readyState === 'complete') {
        responsive1Tests();
      }
    }
  }

  body.appendChild(newWindow);

  async function responsive1Tests () {
    try {
      var doc = newWindow.contentDocument? newWindow.contentDocument: newWindow.contentWindow.document,
          nextButton = doc.querySelector('[data-controls="next"]'),
          assertionItems,
          assertionSlideBy,
          assertionGutter,
          assertionEdgePadding,
          container = doc.querySelector('#' + id),
          slideItems = container.children,
          wrapper = container.parentNode,
          slideBy = options[id].slideBy,
          items = responsive[bps[0]].items,
          cloneCount = (slideItems.length - 7) / 2,
          index = cloneCount,
          gutter = options[id].gutter,
          edgePadding = responsive[bps[0]].edgePadding,
          first,
          second,
          last,
          wrapperRect;

      nextButton.click();
      first = slideItems[index + 1];
      last = slideItems[index + items - 1 + 1];
      wrapperRect = wrapper.getBoundingClientRect();

      assertionItems = 
        compare2Nums(first.getBoundingClientRect().left, wrapperRect.left) &&
        compare2Nums(last.getBoundingClientRect().right, wrapperRect.right);
      assertionGutter = window.getComputedStyle(first, null).paddingRight === gutter + 'px';
      assertionEdgePadding = compare2Nums(wrapperRect.left, edgePadding) &&
        compare2Nums(wrapperRect.right, (Number(bps[0]) + 20) - (edgePadding - gutter));

      // resize window
      newWindow.style.width = (Number(bps[1]) + 20) + 'px';
      await wait(2000);
      items = responsive[bps[1]].items;
      gutter = responsive[bps[1]].gutter;
      edgePadding = responsive[bps[1]].edgePadding,
      last = slideItems[index + items - 1 + 1];
      wrapperRect = wrapper.getBoundingClientRect();

      if (assertionItems) {
        assertionItems = 
          compare2Nums(first.getBoundingClientRect().left, wrapperRect.left) &&
          compare2Nums(last.getBoundingClientRect().right, wrapperRect.right);
      }

      if (assertionGutter) {
        assertionGutter = window.getComputedStyle(first, null).paddingRight === gutter + 'px';
      }

      if (assertionEdgePadding) {
        assertionEdgePadding = compare2Nums(wrapperRect.left, edgePadding) &&
          compare2Nums(wrapperRect.right, (Number(bps[1]) + 20) - (edgePadding - gutter));
      }
      updateTest(testItems, assertionItems);
      updateTest(testGutter, assertionGutter);
      updateTest(testEdgePadding, assertionEdgePadding);

      nextButton.click();
      first = slideItems[index + items + 1];
      last = slideItems[index + items * 2 - 1 + 1];
      wrapperRect = wrapper.getBoundingClientRect();

      if (assertionItems) {
        assertionSlideBy = 
          compare2Nums(first.getBoundingClientRect().left, wrapperRect.left) &&
          compare2Nums(last.getBoundingClientRect().right, wrapperRect.right);
      }

      updateTest(testSlideBy, assertionSlideBy);
    } catch (e) {
      testItems.className = 'item-notsure';
      testSlideBy.className = 'item-notsure';
      testGutter.className = 'item-notsure';
      testEdgePadding.className = 'item-notsure';
    } finally {
      body.removeChild(newWindow);
      assignDone(id);
    }
  }
}



















function testResponsive2 () {
  var id = 'responsive2',
      responsive = options[id]['responsive'],
      bps = Object.keys(responsive).sort(function(a, b) { return a - b; });

  addTitle(id + ': controls, nav, autoplay display toggle');

  var testControlsT = addTest('controls'),
      testNavT = addTest('nav'),
      testAutoplayT = addTest('autoplay'),
      newWindow = document.createElement('iframe');
  newWindow.setAttribute('frameBorder', '0');
  newWindow.style.cssText = 'width: ' + (Number(bps[1]) + 20) + 'px; height: 1000px; border-width: 0; overflow: hidden;';
  newWindow.src = id + prefix + '.html';

  if (newWindow.addEventListener) {
    newWindow.addEventListener('load', responsive2Tests, false);
  } else if (newWindow.readyState) {
    newWindow.onreadystatechange = function() {
      if (newWindow.readyState === 'complete') {
        responsive2Tests();
      }
    }
  }

  body.appendChild(newWindow);

  async function responsive2Tests () {
    try {
      var assertionControls,
          assertionNav,
          assertionAutoplay,
          doc = newWindow.contentDocument? newWindow.contentDocument: newWindow.contentWindow.document,
          box = doc.querySelector('#' + id + '_wrapper'),
          slideItems = box.querySelector('#' + id).children,
          controlsContainer = box.querySelector('.tns-controls'),
          navContainer = box.querySelector('.tns-nav'),
          autoplayButton = box.querySelector('[data-action]'),
          index = 14,
          timeouts = [options[id].autoplayTimeout, responsive[bps[0]].autoplayTimeout],
          firstRect;

      firstRect = slideItems[index].getBoundingClientRect();
      await wait(timeouts[1] + 1000);
      assertionControls = getComputedStyle(controlsContainer, null).display !== 'none';
      assertionNav = getComputedStyle(navContainer, null).display === 'none';
      assertionAutoplay = getComputedStyle(autoplayButton, null).display === 'none' &&
        autoplayButton.getAttribute('data-action') === 'start' &&
        firstRect.left === slideItems[index].getBoundingClientRect().left;
      // console.log(assertionControls, assertionNav, assertionAutoplay);
      // alert(assertionControls + ', ' + assertionNav + ', ' + assertionAutoplay);

      // resize window
      newWindow.style.width = (Number(bps[0]) + 20) + 'px';
      firstRect = slideItems[index].getBoundingClientRect();
      await wait(timeouts[1] + 1000);
      if (assertionControls) { assertionControls = getComputedStyle(controlsContainer, null).display === 'none'; }
      if (assertionNav) { assertionNav = getComputedStyle(navContainer, null).display !== 'none'; }
      if (assertionAutoplay) {
        assertionAutoplay = getComputedStyle(autoplayButton, null).display !== 'none' &&
          autoplayButton.getAttribute('data-action') === 'stop' &&
          firstRect.left !== slideItems[index].getBoundingClientRect().left;
      }
      // console.log(assertionControls, assertionNav, assertionAutoplay);
      // alert(assertionControls + ', ' + assertionNav + ', ' + assertionAutoplay);

      // resize window
      newWindow.style.width = (Number(bps[0]) - 20) + 'px';
      firstRect = slideItems[index].getBoundingClientRect();
      await wait(timeouts[0] + 1000);
      if (assertionControls) { assertionControls = getComputedStyle(controlsContainer, null).display !== 'none'; }
      if (assertionNav) { assertionNav = getComputedStyle(navContainer, null).display !== 'none'; }
      if (assertionAutoplay) {
        assertionAutoplay = getComputedStyle(autoplayButton, null).display === 'none' &&
          autoplayButton.getAttribute('data-action') === 'start' 
          firstRect.left === slideItems[index].getBoundingClientRect().left;
      }
      // console.log(assertionControls, assertionNav, assertionAutoplay);
      // alert(assertionControls + ', ' + assertionNav + ', ' + assertionAutoplay);

      updateTest(testControlsT, assertionControls);
      updateTest(testNavT, assertionNav);
      updateTest(testAutoplayT, assertionAutoplay);
    } catch (e) {
      testControlsT.className = 'item-notsure';
      testNavT.className = 'item-notsure';
      testAutoplayT.className = 'item-notsure';
    } finally {
      body.removeChild(newWindow);
      assignDone(id);
    }
  }
}




















function testResponsive3() {
  var id = 'responsive3',
      responsive = options[id]['responsive'],
      bps = Object.keys(responsive).sort(function(a, b) { return a - b; });

  addTitle(id + ': controls, autoplay text content update');

  var testControlsT = addTest('controlsText'),
      testAutoplayT = addTest('autoplayText'),
      newWindow = document.createElement('iframe');

  newWindow.setAttribute('frameBorder', '0');
  newWindow.style.cssText = 'width: ' + (Number(bps[1]) + 20) + 'px; height: 1000px; border-width: 0; overflow: hidden;';
  newWindow.src = id + prefix + '.html';

  if (newWindow.addEventListener) {
    newWindow.addEventListener('load', responsive3Tests, false);
  } else if (newWindow.readyState) {
    newWindow.onreadystatechange = function() {
      if (newWindow.readyState === 'complete') {
        responsive3Tests();
      }
    }
  }

  body.appendChild(newWindow);

  async function responsive3Tests () {
    try {
      var assertionControls,
          assertionAutoplay,
          doc = newWindow.contentDocument? newWindow.contentDocument: newWindow.contentWindow.document,
          box = doc.querySelector('#' + id + '_wrapper'),
          controlsContainer = box.querySelector('.tns-controls'),
          prevButton = controlsContainer.children[0],
          nextButton = controlsContainer.children[1],
          autoplayButton = box.querySelector('[data-action]'),
          str;

      str = autoplayButton.innerHTML;
      assertionControls = prevButton.innerHTML === 'prev' && nextButton.innerHTML === 'next';
      assertionAutoplay = str.substring(str.length - 4) === 'stop';

      // resize window
      newWindow.style.width = (Number(bps[0]) + 20) + 'px';
      await wait(1000);
      str = autoplayButton.innerHTML;
      if (assertionControls) {
        assertionControls = prevButton.innerHTML === '&lt;' && nextButton.innerHTML === '&gt;';
      }
      if (assertionAutoplay) {
        assertionAutoplay = str.substring(str.length - 2) === '||';
      }
      // console.log(assertionControls, assertionAutoplay);

      // resize window
      newWindow.style.width = (Number(bps[0]) - 20) + 'px';
      await wait(1000);
      str = autoplayButton.innerHTML;
      if (assertionControls) {
        assertionControls = prevButton.innerHTML === 'prev' && nextButton.innerHTML === 'next';
      }
      if (assertionAutoplay) {
        assertionAutoplay = str.substring(str.length - 4) === 'stop';
      }
      // console.log(assertionControls, assertionAutoplay);

      updateTest(testControlsT, assertionControls);
      updateTest(testAutoplayT, assertionAutoplay);
    } catch (e) {
      testControlsT.className = 'item-notsure';
      testAutoplayT.className = 'item-notsure';
    } finally {
      body.removeChild(newWindow);
      assignDone(id);
    }
  }
}




















function testResponsive4 () {
  var id = 'responsive4',
      responsive = options[id]['responsive'],
      bps = Object.keys(responsive).sort(function(a, b) { return a - b; });

  addTitle(id + ': touch, mouseDrag, arrowKeys toggle');

  var testTouchT = addTest('touch'),
      testMouseDragT = addTest('mouse drag'),
      testArrowKeysT = addTest('arrow keys');

  updateTest(testTouchT, '-notsure');
  updateTest(testMouseDragT, '-notsure');
  updateTest(testArrowKeysT, '-notsure');
  // var newWindow = document.createElement('iframe');
  // newWindow.setAttribute('frameBorder', '0');
  // newWindow.style.cssText = 'width: ' + (Number(bps[1]) + 20) + 'px; height: 1000px; border-width: 0; overflow: hidden;';
  // newWindow.src = id + prefix + '.html';

  // if (newWindow.addEventListener) {
  //   newWindow.addEventListener('load', responsive4Tests, false);
  // } else if (newWindow.readyState) {
  //   newWindow.onreadystatechange = function() {
  //     if (newWindow.readyState === 'complete') {
  //       responsive4Tests();
  //     }
  //   }
  // }

  // body.appendChild(newWindow);

  function responsive4Tests () {
    if (canFireKeydown) {
      var assertionArrowKeys,
          doc = newWindow.contentDocument? newWindow.contentDocument: newWindow.contentWindow.document,
          container = doc.querySelector('#' + id),
          left;

      new Promise(function(resolve) {
        left = container.getBoundingClientRect().left;
        // fire keydown event on right arrow
        fire(doc, 'keydown', { 'keyCode': 39 });

        resolve();
      }).then(function() {
        return new Promise(function(resolve) {
          assertionArrowKeys = container.getBoundingClientRect().left !== left;
          // console.log(assertionArrowKeys);

          resolve();
        });
      }).then(function() {
        // resize window
        return new Promise(function(resolve) {
          newWindow.style.width = (Number(bps[0]) + 20) + 'px';
          left = container.getBoundingClientRect().left;

          resolve();
        }).then(function() {
          return new Promise(function(resolve) {
            // fire keydown event on right arrow
            fire(doc, 'keydown', { 'keyCode': 39 });

            resolve();
          });
        }).then(function() {
          return wait(500).then(function() {
            return new Promise(function(resolve) {
              if (assertionArrowKeys) {
                assertionArrowKeys = container.getBoundingClientRect().left === left;
              }
              // console.log(assertionArrowKeys);

              resolve();
            });
          });
        });
      }).then(function() {
        updateTest(testArrowKeysT, assertionArrowKeys);
        body.removeChild(newWindow);
      });
    } else {
      testArrowKeysT.className = 'item-notsure';
      body.removeChild(newWindow);
    }
    assignDone(id);
  }
}




















function testResponsive5 () {
  var id = 'responsive5',
      responsive = options[id]['responsive'],
      bps = Object.keys(responsive).sort(function(a, b) { return a - b; });

  addTitle(id + ': fixedWidth update, autoHeight toggle');

  var testFixedWidthT = addTest('fixedWidth'),
      testAutoHeightT = addTest('auto height'),
      newWindow = document.createElement('iframe'),
      windowWidth = Number(bps[0]) - 20;

  newWindow.setAttribute('frameBorder', '0');
  newWindow.style.cssText = 'width: ' + windowWidth + 'px; height: 1000px; border-width: 0; overflow: hidden;';
  newWindow.src = id + prefix + '.html';

  if (newWindow.addEventListener) {
    newWindow.addEventListener('load', responsive5Tests, false);
  } else if (newWindow.readyState) {
    newWindow.onreadystatechange = function() {
      if (newWindow.readyState === 'complete') {
        responsive5Tests();
      }
    }
  }

  body.appendChild(newWindow);

  async function responsive5Tests () {
    try {
      var assertionFixedWidth,
          assertionAutoHeight,
          commentFixedWidth,
          commentAutoHeight,
          doc = newWindow.contentDocument? newWindow.contentDocument: newWindow.contentWindow.document,
          wrapper = doc.querySelector('#' + id + '-mw'),
          container = doc.querySelector('#' + id),
          first = container.querySelector('#' + id + '-item0');

      await wait(1000);
      assertionFixedWidth = first.clientWidth === getFW(windowWidth) &&
        compare2Nums(wrapper.getBoundingClientRect().left, first.getBoundingClientRect().left);
      // console.log(first.clientWidth + '|' + getFW(windowWidth) + '|' + wrapper.getBoundingClientRect().left + '|' + first.getBoundingClientRect().left);
      assertionAutoHeight = wrapper.style.height === '';
      // if (!assertionFixedWidth) {
      //   commentFixedWidth = 'FixedWidth 1 >> first element width: ' + first.clientWidth + ' | ' + getFW(windowWidth) + ', wrapper left: ' + wrapper.getBoundingClientRect().left + ' | first element left: ' + first.getBoundingClientRect().left + ', viewport width: ' + windowWidth;
      // }
      // if (!assertionAutoHeight) {
      //   commentAutoHeight = 'AutoHeight 1 >> wrapper height: ' + wrapper.style.height + '(should be empty)' + ', viewport width: ' + windowWidth;
      // }

      // resize window
      await wait(1000);
      windowWidth = Number(bps[0]) + 20;
      newWindow.style.width = windowWidth + 'px';
      await wait(2000);
      if (assertionFixedWidth) {
        assertionFixedWidth = first.clientWidth === (getFW(windowWidth) + 100) &&
          compare2Nums(wrapper.getBoundingClientRect().left, first.getBoundingClientRect().left);
        // console.log(first.clientWidth + ' | ' + (getFW(windowWidth) + 100) + ' | ' + wrapper.getBoundingClientRect().left + ' | ' + first.getBoundingClientRect().left);
        // if (!assertionFixedWidth) {
        //   commentFixedWidth = 'FixedWidth 2 >> first element width: ' + first.clientWidth + ' | ' + (getFW(windowWidth) + 100) + ', wrapper left: ' + wrapper.getBoundingClientRect().left + ' | first element left: ' + first.getBoundingClientRect().left + ', viewport width: ' + windowWidth;
        // }
      }
      if (assertionAutoHeight) {
        assertionAutoHeight = wrapper.style.height === first.clientHeight + 'px';
        // if (!assertionAutoHeight) {
        //   commentAutoHeight = 'AutoHeight 2 >> wrapper height: ' + wrapper.style.height + ' | first element height: ' + first.clientHeight + 'px' + ', viewport width: ' + windowWidth;
        // }
      }

      updateTest(testFixedWidthT, assertionFixedWidth, commentFixedWidth);
      updateTest(testAutoHeightT, assertionAutoHeight, commentAutoHeight);
    } catch(e) {
      testFixedWidthT.className = 'item-notsure';
      testAutoHeightT.className = 'item-notsure';
    } finally {
      body.removeChild(newWindow);
      assignDone(id);
    }
  }
}




















function testResponsive6 () {
  var id = 'responsive6',
      opt = options[id],
      fixedWidth = opt.fixedWidth,
      gutter = opt.gutter,
      slideWidth = fixedWidth + gutter;

  addTitle(id + ': fixedWidth width few items');

  var testEdgePaddingT = addTest('edgePadding toggle'),
      testControlsNavT = addTest('controls, nav toggle'),
      newWindow = document.createElement('iframe');

  newWindow.setAttribute('frameBorder', '0');
  newWindow.style.cssText = 'width: ' + (slideWidth + edgepadding * 2 - gutter) + 'px; height: 1000px; border-width: 0; overflow: hidden;';
  newWindow.src = id + prefix + '.html';

  if (newWindow.addEventListener) {
    newWindow.addEventListener('load', responsive6Tests, false);
  } else if (newWindow.readyState) {
    newWindow.onreadystatechange = function() {
      if (newWindow.readyState === 'complete') {
        responsive6Tests();
      }
    }
  }

  body.appendChild(newWindow);

  async function responsive6Tests () {
    try {
      var assertionEdgePadding,
          assertionControlsNav,
          commentEdgePadding,
          commentControlsNav,
          doc = newWindow.contentDocument? newWindow.contentDocument: newWindow.contentWindow.document,
          wrapper = doc.querySelector('#' + id + '_wrapper'),
          innerWrapper = doc.querySelector('#' + id + '-iw'),
          container = doc.querySelector('#' + id),
          controls = wrapper.querySelector('.tns-controls'),
          nav = wrapper.querySelector('.tns-nav'),
          child0 = container.children[0],
          child1 = container.children[1],
          childL = container.children[container.children.length - 1],
          prevButton = controls.children[0],
          nextButton = controls.children[1],
          viewport,
          controlsDisplay,
          navDisplay,
          left,
          right;

      viewport = wrapper.clientWidth;
      left = innerWrapper.getBoundingClientRect().left;
      right = innerWrapper.getBoundingClientRect().right;
      assertionEdgePadding = left === edgepadding && right === viewport - (edgepadding - gutter);
      // if (!assertionEdgePadding) {
      //   commentEdgePadding = 'init >> edgePadding: innerWrapper left - ' + left + ' | ' + edgepadding + ', innerWrapper right - ' + right + ' | ' + (viewport - (edgepadding - gutter)) + ', viewport - ' + viewport;
      // }

      // resize window
      newWindow.style.width = (slideWidth * 2 + 100) + 'px';
      await wait(1000);
      if (assertionEdgePadding) {
        left = child0.getBoundingClientRect().left;
        assertionEdgePadding = left === 0;
        // if (!assertionEdgePadding) {
        //   commentEdgePadding += 'frozen >> edgePadding: child0 left - ' + left + ' | 0, viewport - ' + viewport;
        // }
      }

      controlsDisplay = controls.style.display;
      navDisplay = nav.style.display;
      assertionControlsNav = controlsDisplay === 'none' && navDisplay === 'none';
      // if (!assertionControlsNav) {
      //   commentControlsNav = 'frozen >> controls display: ' + controlsDisplay + ' | none ; nav display: ' + navDisplay + ' | none, viewport - ' + viewport;
      // }

      // resize window
      newWindow.style.width = (slideWidth + edgepadding * 2 - gutter) + 'px';
      await wait(1000);
      if (assertionEdgePadding) {
        viewport = wrapper.clientWidth;
        left = innerWrapper.getBoundingClientRect().left;
        right = innerWrapper.getBoundingClientRect().right;
        assertionEdgePadding = left === edgepadding && right === viewport - (edgepadding - gutter);
        // if (!assertionEdgePadding) {
        //   commentEdgePadding = 'active >> edgePadding: innerWrapper left - ' + left + ' | ' + edgepadding + ', innerWrapper right - ' + right + ' | ' + (viewport - (edgepadding - gutter)) + ', viewport - ' + viewport;
        // }
      }
      if (assertionControlsNav) {
        controlsDisplay = controls.style.display;
        navDisplay = nav.style.display;
        assertionControlsNav = controlsDisplay !== 'none' && navDisplay !== 'none';
        // if (!assertionControlsNav) {
        //   commentControlsNav = 'active >> controls display: ' + controlsDisplay + ' | !none ; nav display: ' + navDisplay + ' | !none, viewport - ' + viewport
        // }
      }

      updateTest(testEdgePaddingT, assertionEdgePadding, commentEdgePadding);
      updateTest(testControlsNavT, assertionControlsNav, commentControlsNav);
    } catch(e) {
      updateTest(testEdgePaddingT, assertionEdgePadding, commentEdgePadding);
      updateTest(testControlsNavT, assertionControlsNav, commentControlsNav);
    } finally {
      body.removeChild(newWindow);
      assignDone(id);
    }
  }
}




















function testMouseDrag () {
  var id = 'mouse-drag',
      slider = sliders[id],
      info = slider.getInfo(),
      container = info.container;

  addTitle(id);
  var test = addTest('Mouse drag');
  updateTest(test, '-notsure');
  assignDone(id);
}




















function testGutter () {
  var id = 'gutter',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);
  runTest('Slide: gutter', function() {
    var slideItems = info.slideItems,
        cloneCount = info.cloneCount,
        firstRect = slideItems[cloneCount].getBoundingClientRect(),
        secondRect = slideItems[cloneCount + 1].getBoundingClientRect();
    // There is no "gap" between the two slides
    // because the gap is made by padding
    return compare2Nums(firstRect.right, secondRect.left);
  });
  assignDone(id);
}




















function testEdgePadding () {
  var id = 'edgePadding',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);
  runTest('Slide: position', function() {
    return checkPositionEdgePadding(id, 0);
  });
  assignDone(id);
}




















function testEdgePaddingGutter () {
  var id = 'edgePadding-gutter',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);
  runTest('Slide: position', function() {
    return checkPositionEdgePadding(id);
  });
  assignDone(id);
}




















function testFewitems () {
  var id = 'few-items',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);
  runTest('Slide: count, controls: hidden, nav: hidden', function() {
    return info.container.parentNode.style.margin === '0px' &&
      info.controlsContainer.style.display === 'none' &&
      info.navContainer.style.display === 'none';
  });
  assignDone(id);
}




















function testSlideByPage () {
  var id = 'slide-by-page',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);
  var controlsClick = addTest('Controls: click');
  checkControlsClick(controlsClick, id, 11, false, true);
}




















function testArrowKeys () {
  var id = 'arrowKeys',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);

  var test = addTest('Slides: keydown');
  // can fire keydown event
  if (canFireKeydown) {
    var assertion,
        container = info.container,
        slideBy = info.slideBy,
        index = slider.getInfo().index;
    
    // fire keydown event on right arrow
    fire(document, 'keydown', { 'keyCode': 39 });
    assertion = slider.getInfo().index === index + slideBy;

    if (assertion) {
      // fire keydown event on right arrow
      fire(document, 'keydown', { 'keyCode': 39 });
      assertion = slider.getInfo().index === index + slideBy * 2;

      if (assertion) {
        // fire keydown event on left arrow
        fire(document, 'keydown', { 'keyCode': 37 });
        assertion = slider.getInfo().index === index + slideBy;

        if (assertion) {
          // fire keydown event on left arrow
          fire(document, 'keydown', { 'keyCode': 37 });
          assertion = slider.getInfo().index === index;
        }
      }
    }
    updateTest(test, assertion);

  // can't fire keydown event
  // manual test needed
  } else {
    updateTest(test, '-notsure');
  }
  assignDone(id);
}




















async function testAutoplay () {
  var id = 'autoplay',
      slider = sliders[id],
      info = slider.getInfo(),
      opt = options[id],
      buttons = info.navContainer.children,
      autoplayButton = doc.querySelector('#' + id + '_wrapper [data-action]');

  addTitle(id);
  runTest('autoplayButton: attrs', function() {
    return autoplayButton.getAttribute('data-action') === 'stop' && 
      autoplayButton.textContent.indexOf('stop animation') > -1;
  });

  var timeout = 0;
  if (opt['autoplayTimeout']) { timeout += opt['autoplayTimeout']; }
  if (opt['speed']) { timeout += opt['speed']; }

  var testClick = addTest('autoplayButton: click'),
      test1 = addTest('Slide: autoplay'),
      test2 = addTest('Slide: autoplay pause'),
      assertion;

  // click autoplay button once => pause
  autoplayButton.click();
  assertion = 
    autoplayButton.getAttribute('data-action') === 'start' &&
    autoplayButton.textContent.indexOf('start animation') > -1;

  if (assertion) {
    // click autoplay button the second time => restart
    autoplayButton.click();
    assertion = 
        autoplayButton.getAttribute('data-action') === 'stop' &&
        autoplayButton.textContent.indexOf('stop animation') > -1;
  }

  updateTest(testClick, assertion);

  // test autoplay
  await testAutoplayFn(id, test1, timeout, false);
  // test autoplay pause
  autoplayButton.click();
  await testAutoplayFn(id, test2, timeout, true);
  assignDone(id);
}




















async function testAnimation1 () {
  var id = 'animation1',
      slider = sliders[id],
      info = slider.getInfo(),
      slideCountNew = info.slideCountNew,
      items = info.items,
      slideItems = info.slideItems,
      opt = options[id],
      animateIn = opt['animateIn'] ? opt['animateIn'] : 'tns-fadeIn',
      animateOut = opt['animateOut'] ? opt['animateOut'] : 'tns-fadeOut',
      animateNormal = 'tns-normal',
      speed = opt['speed'] ? opt['speed'] : 0;

  if (localStorage['tnsAnDu'] === 'false') {
    animateIn = 'tns-fadeIn';
    animateOut = 'tns-fadeOut';
  }

  addTitle(id);

  function checkAnimationClasses () {
    var assertion,
        index = slider.getInfo().index;

    for (var i = slideCountNew; i--;) {
      if (assertion !== false) {
        assertion = (i >= index && i < index + items) ? containsClasses(slideItems[i], animateIn) : containsClasses(slideItems[i], animateNormal);
      }
    }

    return assertion;
  }

  runTest('Slides: classes on init', function() {
    return checkAnimationClasses();
  });

  var test = addTest('Slides: classes after click');
  await wait(300);
  info.nextButton.click();
  await wait(speed + 500);
  updateTest(test, checkAnimationClasses());
  assignDone(id);
}




















async function testAnimation2 () {
  var id = 'animation2',
      slider = sliders[id],
      info = slider.getInfo(),
      container = info.container,
      slideItems = info.slideItems,
      items = info.items,
      slideCount = info.slideCount,
      nextButton = info.nextButton;

  addTitle(id);

  var test = addTest('Slides: position after click'),
      count = info.slideCountNew + 1,
      assertion;

  // click next button *count* times
  await repeat(function() {
    nextButton.click();
  }, count);

  await wait(300);
  var index = slider.getInfo().index,
      rect = container.parentNode.getBoundingClientRect();
      
  assertion = 
    index%slideCount === count*items%slideCount &&
    compare2Nums(slideItems[index].getBoundingClientRect().left, rect.left) &&
    compare2Nums(slideItems[index + items - 1].getBoundingClientRect().right, rect.right);

  updateTest(test, assertion);
  assignDone(id);
}




















function testLazyload () {
  var id = 'lazyload',
      slider = sliders[id];

  waitUntilInit(slider, async function() {
    var info = slider.getInfo(),
        edgePadding = options[id]['edgePadding'],
        slideBy = options[id]['slideBy'] || 1,
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

    runTest('Slide: init', function() {
      var imgFirst = slideItems[first].querySelector('img'),
          imgLast = slideItems[last].querySelector('img'),
          imgPrev = slideItems[first - 1].querySelector('img'),
          imgNext = slideItems[last + 1].querySelector('img');

      return imgFirst.getAttribute('src') === imgFirst.getAttribute('data-src') &&
        imgLast.getAttribute('src') === imgLast.getAttribute('data-src') &&
        imgPrev.getAttribute('src') !== imgPrev.getAttribute('data-src') && 
        imgNext.getAttribute('src') !== imgNext.getAttribute('data-src');
    });

    var test = addTest('Controls: click'),
        assertion;

    info.nextButton.click();
    for (var i = last + 1; i < last + 1 + slideBy; i++) {
      if (assertion === undefined || assertion !== false) {
        var img = slideItems[i].querySelector('img');
        assertion = img.getAttribute('src') === img.getAttribute('data-src');
      }
    }
    updateTest(test, assertion);
    assignDone(id);
  });
}




















async function testCustomize () {
  var id = 'customize',
      slider = sliders[id],
      opt = options[id],
      autoplayButton = document.querySelector(opt['autoplayButton']);

  addTitle(id);

  waitUntilInit(slider, async function() {
    // stop autoplay and go to the first slide
    // before testing slide attrs
    if (opt['autoplay']) {
      autoplayButton.click();
      slider.goTo('first');
    }
    runTest('Slides: width, count, id, class, aria-hidden, tabindex', async function() {
      await wait(300);
      return checkSlidesAttrs(id);
    });

    runTest('Controls: aria-label, aria-controls, data-controls, tabindex', function() {
      return checkControlsAttrs(id);
    });

    var info = slider.getInfo();
    runTest('Nav: aria-label, data-nav, tabindex, active class, aria-controls', function() {
      var assertion,
          info = slider.getInfo(),
          slideCount = info.slideCount,
          cloneCount = info.cloneCount,
          absIndex = (info.index-cloneCount)%slideCount,
          navContainer = info.navContainer,
          navItems = info.navItems;

      assertion = navContainer.getAttribute('aria-label') === 'Carousel Pagination';

      while (absIndex < 0) { absIndex += slideCount; }
      for (var i = slideCount; i--;) {
        var nav = navItems[i],
            number = nav.className.indexOf(navActiveClass),
            hasCl = (i === absIndex) ? number >= 0 : number < 0,
            currentStr = (i === absIndex) ? ' (Current Slide)' : '',
            ti = (i === absIndex) ? !nav.hasAttribute('tabindex') : nav.getAttribute('tabindex') === '-1';

        if (assertion) {
          assertion = 
            nav.getAttribute('data-nav') === i.toString() &&
            nav.getAttribute('aria-controls') === id &&
            nav.getAttribute('aria-label') === 'Carousel Page '+ (i + 1) + currentStr &&
            ti &&
            hasCl;
        }
      }
      return assertion;
    });

    simulateClick(info.prevButton);
    var controlsClick = addTest('Controls: click functions'),
        autoplayT = addTest('Slide: autoplay'),
        autoplayPauseT = addTest('Slide: autoplay pause');

    await checkControlsClick(controlsClick, id, 11);

    if (opt['autoplay']) {
      // reset autoplay
      autoplayButton.click();

      var timeout = 100;
      if (opt['autoplayTimeout']) { timeout += opt['autoplayTimeout']; }
      if (opt['speed']) { timeout += opt['speed']; }

      await testAutoplayFn(id, autoplayT, timeout, false);
      autoplayButton.click();
      await testAutoplayFn(id, autoplayPauseT, timeout, true);
    }

    assignDone(id);
  });
}




















function testAutoHeight () {
  var id = 'autoHeight',
      slider = sliders[id];

  addTitle(id);

  var testClass = addTest('Middle wrapper should has class "tns-ah"'),
      testHeight1 = addTest('Slider height should be the same as the maximum heights of visible slides in initialization'),
      testHeight2 = addTest('Slider height should be the same as the maximum heights of visible slides after clicking prev/next buttons'),
      comment = '';

  waitUntilInit(slider, async function() {
    await wait(300);
    var assertion,
        info = slider.getInfo(),
        slideItems = info.slideItems,
        nextButton = info.nextButton,
        middleWrapper = doc.querySelector('#' + id + '-mw');

    assertion = containsClasses(middleWrapper, ['tns-ah']);
    updateTest(testClass, assertion, comment);

    assertion = compare2Nums(middleWrapper.clientHeight, slideItems[info.index].clientHeight);
    updateTest(testHeight1, assertion, comment);

    nextButton.click();
    await wait(800);
    assertion = compare2Nums(middleWrapper.clientHeight, slideItems[slider.getInfo().index].clientHeight);

    nextButton.click();
    await wait(800);
    if (assertion) {
      assertion = compare2Nums(middleWrapper.clientHeight, slideItems[slider.getInfo().index].clientHeight);
    }

    updateTest(testHeight2, assertion, comment);
    assignDone(id);
  });
}




















function testNested () {
  var id = 'nested',
      slider = sliders[id],
      info = slider.getInfo(),
      index = info.index,
      slideBy = info.slideBy,
      nextButton = info.nextButton,
      prevButton = info.prevButton,
      assertion,
      _id = 'nested_inner',
      _slider = sliders[_id],
      _info = _slider.getInfo(),
      _index = _info.index,
      _slideBy = _info.slideBy,
      _nextButton = _info.nextButton,
      _edgePadding = _info.edgePadding ? _info.edgePadding : 0,
      _assertion;

  addTitle(id);
  runTest('Slides: position', function() {
    return checkPositionEdgePadding(id);
  });
  var test = addTest('Controls: click');

  addTitle(_id);
  runTest('Slides: position', function() {
    return checkPositionEdgePadding(_id);
  });

  var _test = addTest('Controls: click');

  nextButton.click();
  assertion = slider.getInfo().index === index + slideBy &&
    _slider.getInfo().index === _index;
  updateTest(test, assertion);

  prevButton.click();
  _nextButton.click();
  _assertion = _slider.getInfo().index === _index + _slideBy &&
    slider.getInfo().index === index;    
  updateTest(_test, _assertion);
  assignDone(id);
}




















function wait (ms) {
  return new Promise(function(resolve) {
    setTimeout(function() {
      resolve();
    }, ms);
  });
}

function addTitle (str) {
  var title = doc.createElement('div');
  title.className = 'title';
  title.textContent = str;
  resultsDiv.appendChild(title);
}

function addTest (str, postfix) {
  var test = doc.createElement('div');
  if (!postfix) { postfix = '-running'; }
  test.className = 'item' + postfix;
  test.textContent = str;
  resultsDiv.appendChild(test);
  return test;
}

function updateTest (test, assertion, str) {
  switch(assertion) {
    case true:
      test.className = 'item-success';
      break;
    case false:
      test.className = 'item-fail';
      if (str) { addComment(test, str); }
      break;
    default:
      test.className = 'item-notsure';
  }
}

function assignDone (id) {
  var div = doc.querySelector('#' + id + '_wrapper');
  if (div) {
    div.style.display = 'none';
  }

  var str = 'test-done';
  if (resultsDiv.className.indexOf(str) < 0) {
    resultsDiv.className += ' ' + str;
  }
}

function addComment (test, str) {
  var comment = doc.createElement('div');
  comment.innerHTML = str;
  comment.className = 'item-comment';
  test.nextElementSibling ? resultsDiv.insertBefore(comment, test.nextElementSibling) : resultsDiv.appendChild(comment);
}

function runTest (str, fn) {
  var test = addTest(str);
  test.className = (fn()) ? 'item-success' : 'item-fail';
}

function containsClasses (el, arr) {
  var len = arr.length,
      classes = el.className,
      assertion = true;

  for (var i = 0; i < len; i++) {
    if (classes.indexOf(arr[i]) < 0) { assertion = false; }
  }

  return assertion;
}

function compare2Nums (a, b) { return Math.abs(a - b) <= 2; }

function getAbsIndex (current, clicks, info) {
  var cc = info.cloneCount,
      sc = info.slideCount,
      sb = info.slideBy,
      i = current + sb * clicks + sc * multiplyer;

  while (i < cc) { i += sc; }
  return (i-cc)%sc;
}

async function repeat (fn, count, timeout) {
  if (timeout) {
    while (count > 0) {
      await wait(timeout);
      fn();
      count--;
    }
  } else {
    while (count > 0) {
      fn();
      count--;
    }
  }
}

function checkSlidesAttrs (id) {
  var info = sliders[id].getInfo(),
      slideItems = info.slideItems,
      index = info.index,
      items = info.items,
      slideCount = info.slideCount,
      cloneCount = info.cloneCount,
      firstVisible = slideItems[index],
      lastVisible = slideItems[index + items - 1],
      firstVisiblePrev = slideItems[index - 1],
      lastVisibleNext = slideItems[index + items],
      checkLastItem = (options[id]['axis'] === 'vertical') ? true : 
        compare2Nums(slideItems[slideItems.length - 1].getBoundingClientRect().top, info.container.parentNode.getBoundingClientRect().top),
      mul = options[id].loop !== false ? 2 : 1;

  return slideItems.length === slideCount + cloneCount * mul &&
    containsClasses(firstVisible, ['tns-item']) &&
    firstVisible.id === id + '-item' + 0 &&
    !firstVisible.hasAttribute('aria-hidden') &&
    !firstVisible.hasAttribute('tabindex') &&
    firstVisiblePrev.id === '' &&
    firstVisiblePrev.getAttribute('aria-hidden') === 'true' &&
    firstVisiblePrev.getAttribute('tabindex') === '-1' &&
    lastVisible.id === id + '-item' + (items - 1) &&
    !lastVisible.hasAttribute('aria-hidden') &&
    !lastVisible.hasAttribute('tabindex') &&
    lastVisibleNext.getAttribute('aria-hidden') === 'true' &&
    lastVisibleNext.getAttribute('tabindex') === '-1' &&
    compare2Nums(firstVisible.clientWidth, windowWidth / items) &&
    checkLastItem;
}

function checkControlsAttrs (id) {
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

async function checkControlsClick (test, id, count, vertical, islast) {
  var assertion,
      slider = sliders[id],
      info = slider.getInfo(),
      container = info.container,
      wrapper = container.parentNode,
      slideCount = info.slideCount,
      navContainer = info.navContainer,
      navItems = info.navItems,
      slideItems = info.slideItems,
      items = info.items,
      edge1 = 'left',
      edge2 = 'right';

  if (vertical) {
    edge1 = 'top';
    edge2 = 'bottom';
    wrapper = wrapper.parentNode;
  }
      
  function getAssertion (absIndex) {
    var index = sliders[id].getInfo().index,
        first = slideItems[index],
        last = slideItems[index + items - 1],
        checkLastEdge = options[id]['fixedWidth'] ? true : compare2Nums(last.getBoundingClientRect()[edge2], wrapper.getBoundingClientRect()[edge2]);

    // if (id === 'customize') {
      // console.log(absIndex, index%slideCount);
    // }
    return !first.hasAttribute('aria-hidden') &&
      !first.hasAttribute(tabindex) &&
      !last.hasAttribute('aria-hidden') &&
      !last.hasAttribute(tabindex) &&
      compare2Nums(first.getBoundingClientRect()[edge1], wrapper.getBoundingClientRect()[edge1]) &&
      checkLastEdge;
  }

  // click prev button n times
  var current = info.index,
      absIndex = getAbsIndex(current, -count, info);
  await repeat(function() {
    (id === 'customize') ? simulateClick(info.prevButton) : info.prevButton.click();
  }, count);
  assertion = getAssertion(absIndex);

  if (assertion) {
    // click next button n times
    await repeat(function() {
      (id === 'customize') ? simulateClick(info.nextButton) : info.nextButton.click();
    }, count);
    assertion = getAssertion(0);
  }

  updateTest(test, assertion);
  if (islast) { assignDone(id); }
}

function checkPositionEdgePadding (id, vertical) {
  var opt = options[id],
      info = sliders[id].getInfo(),
      edgePadding = opt.edgePadding ? opt.edgePadding : 0,
      gutter = opt.gutter ? opt.gutter : 0,
      vertical = vertical || false,
      slideItems = info.slideItems,
      cloneCount = info.cloneCount,
      wrapper = info.container.parentNode,
      first = slideItems[cloneCount],
      last = slideItems[cloneCount + info.items - 1],
      edge1 = (vertical) ? 'top' : 'left',
      edge2 = (vertical) ? 'bottom' : 'right',
      endGap = vertical ? edgePadding : edgePadding - gutter,

  wrapper = wrapper.parentNode;
  var wrapperRect = wrapper.getBoundingClientRect();

  return compare2Nums(first.getBoundingClientRect()[edge1] - edgePadding, wrapperRect[edge1]) &&
    compare2Nums(last.getBoundingClientRect()[edge2], wrapperRect[edge2] - endGap);
}

function checkPositionCenter (id, note) {
  var info = sliders[id].getInfo(),
      gutter = options[id].gutter,
      wrapper = doc.querySelector('#' + id + '-mw'),
      wrapperRect = wrapper.getBoundingClientRect(),
      slideItems = info.slideItems,
      index = info.index,
      slide = slideItems[index],
      slideRect = slide.getBoundingClientRect();
  note && console.log(wrapperRect.right - slideRect.right + gutter, slideRect.left - wrapperRect.left);
  return compare2Nums(wrapperRect.right - slideRect.right + gutter, slideRect.left - wrapperRect.left);
}

async function testAutoplayFn (id, el, timeout, equal) {
  var assertion,
      current = sliders[id].getInfo().index;

  await wait(timeout);
  assertion = current === sliders[id].getInfo().index;
  assertion = (equal) ? assertion : !assertion;
  updateTest(el, assertion);
}

function waitFn (fn, time) {
  if (!time) { time = 200; }

  return async function() {
    await wait(time);
    fn();
  };
}

function waitUntilInit (slider, callback) {
  setTimeout(function() {
    if (slider.getInfo().isOn) {
      callback();
    } else {
      waitUntilInit(slider, callback);
    }
  }, 30);
}

initFns = {
  'base': waitFn(testBase),
  'start-index-gallery-non-loop': waitFn(testStartIndex),
  'few-items': waitFn(testFewitems),
  'mouse-drag': waitFn(testMouseDrag),
  'gutter': waitFn(testGutter),
  'edgePadding': waitFn(testEdgePadding),
  'edgePadding-gutter': waitFn(testEdgePaddingGutter),
  'non-loop': waitFn(testNonLoop),
  'rewind': waitFn(testRewind),
  'slide-by-page': waitFn(testSlideByPage),
  'fixedWidth': waitFn(testFixedWidth),
  'fixedWidth-gutter': waitFn(testFixedWidthGutter),
  'fixedWidth-edgePadding': waitFn(testFixedWidthEdgePadding),
  'fixedWidth-edgePadding-gutter': waitFn(testFixedWidthEdgePaddingGutter),
  'arrowKeys': waitFn(testArrowKeys),
  'autoplay': waitFn(testAutoplay),
  'vertical': waitFn(testVertical),
  'vertical-gutter': waitFn(testVerticalGutter),
  'vertical-edgePadding': waitFn(testVerticalEdgePadding),
  'vertical-edgePadding-gutter': waitFn(testVerticalEdgePaddingGutter),
  'center-non-loop': waitFn(testCenterNonLoop),
  'center-loop': waitFn(testCenterLoop),
  'center-fixedWidth-non-loop': waitFn(testCenterFixedWidthNonLoop),
  'center-fixedWidth-loop': waitFn(testCenterFixedWidthLoop),
  'center-autoWidth-non-loop': waitFn(testCenterAutoWidthNonLoop),
  'center-autoWidth-loop': waitFn(testCenterAutoWidthLoop),
  'center-autoWidth-non-loop-edgePadding': waitFn(testCenterAutoWidthNonLoopEdgePadding),
  'center-autoWidth-loop-edgePadding': waitFn(testCenterAutoWidthLoopEdgePadding),
  'center-lazyload-non-loop': waitFn(testCenterLazyLoadNonLoop),
  'center-lazyload-loop': waitFn(testCenterLazyLoadLoop),
  'center-lazyload-fixedWidth-non-loop': waitFn(testCenterLazyLoadFixedWidthNonLoop),
  'center-lazyload-fixedWidth-loop': waitFn(testCenterLazyLoadFixedWidthLoop),
  'center-lazyload-autoWidth-non-loop': waitFn(testCenterLazyLoadAutoWidthNonLoop),
  'center-lazyload-autoWidth-loop': waitFn(testCenterLazyLoadAutoWidthLoop),
  'animation1': waitFn(testAnimation1),
  'animation2': waitFn(testAnimation2),
  'lazyload': waitFn(testLazyload),
  'customize': waitFn(testCustomize),
  'autoHeight': waitFn(testAutoHeight),
  'nested': waitFn(testNested),
  'responsive1': waitFn(testResponsive1),
  'responsive2': waitFn(testResponsive2),
  'responsive3': waitFn(testResponsive3),
  'responsive4': waitFn(testResponsive4),
  'responsive5': waitFn(testResponsive5),
  'responsive6': waitFn(testResponsive6),
};

// Chrome 33:
// responsive5
// responsive6
