var tt = (function () {
  var my = {}, 
      doc = document,
      sliderNames = ['vertical', 'fade', 'base', 'responsive', 'fixedWidth', 'nonLoop', 'slideByPage', 'autoplay', 'arrowKeys'],
      ul = doc.createElement('ul');
      li = doc.createElement('li');

  my.dom = {
    body: doc.querySelector('body'),
    container: doc.querySelector('.container'),
    sliders: {},
  };

  my.simulateClick = function (el) {
    var event;
    if (doc.createEvent) {
      event = doc.createEvent('Event');
      event.initEvent('click', true, true);
      el.dispatchEvent(event);
    } else {
      event = doc.createEventObject();
      el.fireEvent('onclick', event);
    }
  };

  my.createSliderHtml = function () {
    var htmlTemplate = doc.querySelector('.html_template'),
        sliderFragment = doc.createDocumentFragment(),
        docContainer = doc.querySelector('.container'),
        docHeading = docContainer.querySelector('h1');

    for (var i = sliderNames.length; i--;) {
      var sd = htmlTemplate.cloneNode(true);
      sd.className = sliderNames[i] + '_wrapper';
      sd.querySelector('h2').innerHTML = sliderNames[i];
      sd.querySelector('div').className = sd.querySelector('div').id = sliderNames[i];

      sliderFragment.insertBefore(sd, sliderFragment.firstChild);
    }
    docContainer.insertBefore(sliderFragment, docHeading.nextSibling);
  };

  my.cacheSliders = function () {
    for (var i = 0; i < sliderNames.length; i++) {
      this.dom.sliders[sliderNames[i]] = doc.getElementById(sliderNames[i]);
    }
  };

  my.createSuiteContainer = function () {
    var newUl = ul.cloneNode(true);
    newUl.className = 'suite-container';
    this.dom.body.insertBefore(newUl, this.dom.container);
    this.dom.suiteContainer = newUl;
  };

  my.createSubSuiteContainer = function (newClass) {
    var newUl = ul.cloneNode(true);
    if (newClass) { newUl.className = newClass; }
    this.dom.suiteContainer.appendChild(newUl);
    return newUl;
  };

  my.createSuiteTitle = function (describe, newClass) {
    var newLi = li.cloneNode(true);
    newLi.innerHTML = describe;
    newLi.className = newClass || 'title';
    this.dom.suiteContainer.appendChild(newLi);
  };

  my.createSuite = function (container, describe, result) {
    var newLi = li.cloneNode(true);
    newLi.innerHTML = describe;
    if (!result) { newLi.className += 'fail'; }
    container.appendChild(newLi);
  };

  my.checkInit = function (options) {
    var sliderContainer = options.sliderContainer,
        mode = options.transform || 'horizontal',
        slideItems = options.slideItems,
        slideCount = options.slideCount,
        cloneCount = options.cloneCount,
        items = options.items,
        controls = options.controls,
        nav = options.nav,
        prevDisabled = !options.loop,
        controlsContainer = options.controlsContainer(),
        prevButton = options.prevButton(),
        nextButton = options.nextButton(),
        navContainer = options.navContainer(),
        allNavs = options.allNavs(),
        navEnabled = true;

    my.createSuiteTitle('Initialization', 'subtitle');
    var CT = my.createSubSuiteContainer();
    
    // check wrapper
    my.createSuite(
      CT,
      'Container: slider is wrapped into <strong>.tiny-slider</strong>.', 
      sliderContainer.parentNode.className === 'tiny-slider'
    );

    // check container
    my.createSuite(
      CT,
      'Container: classes  <strong>.tiny-content</strong> and <strong>.' + mode + '</strong> are added.', 
      sliderContainer.className.indexOf('tiny-content ' + mode) !== -1
    );

    // check slides' aria-hidden
    var ariaHiddenAdded = true, 
        elChildrenLen = slideItems.length;
    for (var i = 0; i < elChildrenLen; i++) {
      if (ariaHiddenAdded) { 
        if (i >= cloneCount && i < cloneCount + items) {
          if (slideItems[i].getAttribute('aria-hidden') !== 'false') {
            ariaHiddenAdded = false; 
          }
        } else {
          if (slideItems[i].getAttribute('aria-hidden') !== 'true') {
            ariaHiddenAdded = false; 
          }
        }
      }
    }
    my.createSuite(
      CT,
      'Slides: <strong>Aria-hidden</strong> attributes are correctly added.', 
      ariaHiddenAdded
    );

    // check slides' position
    my.createSuite(
      CT,
      'Slides: slides are at expected positions.',
      Math.round(slideItems[cloneCount].getBoundingClientRect().left) === Math.round(sliderContainer.parentNode.getBoundingClientRect().left) &&
      Math.round(slideItems[cloneCount + items - 1].getBoundingClientRect().right) === Math.round(sliderContainer.parentNode.getBoundingClientRect().right)
    );

    // check controls
    if (controls) {
      my.createSuite(
        CT,
        'Controls: class <strong>.tiny-controls</strong> and attribute <strong>aria-label</strong> are added to controls container.',
        controlsContainer.className.indexOf('tiny-controls') !== -1 && 
        controlsContainer.getAttribute('aria-label') === 'Carousel Navigation' 
      );
      my.createSuite(
        CT,
        'Controls: attributes are correctly added to controls.',
        prevButton.getAttribute('data-controls') === 'prev' &&
        prevButton.getAttribute('tabindex') === '-1' &&
        prevButton.getAttribute('aria-controls') === sliderContainer.id &&
        prevButton.hasAttribute('disabled') === prevDisabled &&
        nextButton.getAttribute('data-controls') === 'next' &&
        nextButton.getAttribute('tabindex') === '0' &&
        nextButton.getAttribute('aria-controls') === sliderContainer.id
      );
    }

    // check nav
    if (nav) {
      my.createSuite(
        CT,
        'Nav: class <strong>.tiny-nav</strong> and attribute <strong>aria-label</strong> are added to nav container.',
        navContainer.className.indexOf('tiny-nav') !== -1 && 
        navContainer.getAttribute('aria-label') === 'Carousel Pagination' 
      );

      var controlsName = sliderContainer.id + 'item';
      for (var i = 0; i < slideCount; i++) {
        if (navEnabled) {
          var tabindex = (i !== 0) ? '-1' : '0',
              selected = (i !== 0) ? 'false' : 'true',
              thisNav = allNavs[i];

          navEnabled = thisNav.getAttribute('data-slide') === i + '' && thisNav.getAttribute('tabindex') === tabindex && thisNav.getAttribute('aria-selected') === selected && thisNav.getAttribute('aria-controls') === controlsName + i;
        }
      }

      my.createSuite(
        CT,
        'Nav: attributes are correctly added to navs.',
        allNavs.length === slideCount && navEnabled
      );
    }
  };

  my.checkFunctions = function (options) {
    var sliderContainer = options.sliderContainer,
        mode = options.transform || 'horizontal',
        slideItems = options.slideItems,
        slideCount = options.slideCount,
        cloneCount = options.cloneCount,
        items = options.items,
        controls = options.controls,
        nav = options.nav,
        speed = options.speed,
        prevDisabled = !options.loop,
        controlsContainer = options.controlsContainer(),
        prevButton = options.prevButton(),
        nextButton = options.nextButton(),
        navContainer = options.navContainer(),
        allNavs = options.allNavs(),
        navEnabled = true;

    my.createSuiteTitle('Functions', 'subtitle');
    var CT = my.createSubSuiteContainer();
    
    // check controls
    var a = 1, 
        b = slideCount + 1,
        controlsFnCheck = true,
        slideLength = slideItems.length,
        timeout = (gn.getSupportedProp(['transitionDuration', 'WebkitTransitionDuration', 'MozTransitionDuration', 'OTransitionDuration'])) ? (speed * slideCount) : 10;

    var checkControls = function (des, fn) {
      if (a < b) { 
        if (des === 'prev') {
          my.simulateClick(prevButton);
        } else {
          my.simulateClick(nextButton);
        }
        setTimeout(function () {
          fn();
          a++;
          checkControls(des, fn); 
        }, timeout);
      } else {
        my.createSuite(CT, 'Controls: ' + des + ' button works as expected.', controlsFnCheck);
      }
    };
      
    function controlsFn (des) {
      var expected = (des === 'prev')? slideCount - a : slideCount + a,
          thisIndex = options.index() + cloneCount,
          pr = Math.round(sliderContainer.parentNode.getBoundingClientRect().right),
          sr = Math.round(slideItems[slideLength - 1].getBoundingClientRect().right),
          check;

      expected = (expected < 0) ? expected + slideCount : expected%slideCount;
      thisIndex = (thisIndex < 0) ? thisIndex + slideCount : thisIndex%slideCount;
      check = sr >= pr && thisIndex === expected;

      // console.log(thisIndex, sr, pr, '||', thisIndex, expected);
      if (!check) {
        controlsFnCheck = false;
      }
    }

    function prevFn() {
      controlsFn('prev');
    }
    function nextFn() {
      controlsFn('next');
    }

    if (controls) {
      checkControls('next', nextFn);
      setTimeout(function () {
        a = 1;
        checkControls('prev', prevFn);
      }, 1000);
    }
    // check nav
    if (nav) {
      var c = 1,
          d = options.navCountVisible;
    }

  };

  return my;
})();

tt.createSliderHtml();
tt.cacheSliders();
tt.createSuiteContainer();

// # base
var baseSD = tinySlider({
  container: tt.dom.sliders.base,
  items: 3,
  speed: 10,
});
baseSD.init();
tt.createSuiteTitle('base');
tt.checkInit(baseSD);
tt.checkFunctions(baseSD);

var responsiveSD = tinySlider({
  container: tt.dom.sliders.responsive,
  gutter: 10,
  gutterPosition: 'left',
  edgePadding: 50,
  slideBy: 0.5,
  responsive: {
    500: 2,
    800: 3,
  },
  // rewind: true,
});
responsiveSD.init();
// tt.createSuiteTitle('responsive');
// tt.checkInit(responsiveSD);

tinySlider({
  container: tt.dom.sliders.fixedWidth,
  // gutter: 10,
  edgePadding: 50,
  gutterPosition: 'left',
  fixedWidth: 200,
  maxContainerWidth: 900,
  arrowKeys: true,
  slideByPage: true,
  // loop: false,
}).init();

tinySlider({
  container: tt.dom.sliders.nonLoop,
  items: 3,
  loop: false,
}).init();

tinySlider({
  container: tt.dom.sliders.slideByPage,
  items: 3,
  slideByPage: true,
}).init();

tinySlider({
  container: tt.dom.sliders.autoplay,
  items: 3,
  autoplay: true,
  speed: 300,
  autoplayTimeout: 3000,
  autoplayText: ['▶', '❚❚'],
}).init();

tinySlider({
  container: tt.dom.sliders.arrowKeys,
  items: 3,
  // edgePadding: 50,
  arrowKeys: true,
  // slideByPage: true,
}).init();

tinySlider({
  container: document.querySelector('.customize'),
  items: 3,
  edgePadding: 40,
  controlsContainer: document.querySelector('.customize .slider-controls'),
  navContainer: document.querySelector('.customize .thumbnails'),
  lazyload: true,
}).init();

tinySlider({
  container: document.querySelector('.auto-height'),
  autoHeight: true,
  items: 1,
}).init();

// var myWindow = window.open('http://192.168.103.82:3000/tests/E2E/index.html', 'test window', 'innerWidth=1024, height=800, resizable, scrollbars, status');
// setTimeout(function () {
//   myWindow.resizeTo(800, 1024);
// }, 1000);

