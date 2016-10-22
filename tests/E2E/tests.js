var tt = (function () {
  var my = {}, 
      doc = document,
      sliderNames = ['responsive', 'fixedWidth'],
      sliderNames = ['vertical', 'fade', 'responsive', 'fixedWidth', 'nonLoop', 'slideByPage', 'autoplay', 'arrowKeys'],
      div = doc.createElement('div');
      ul = doc.createElement('ul');
      li = doc.createElement('li');

  my.transitionendEvent = whichTransitionEvent();
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
        divider = docContainer.querySelector('.divider');

    for (var i = sliderNames.length; i--;) {
      var sd = htmlTemplate.cloneNode(true);
      sd.className = sliderNames[i] + '_wrapper';
      sd.querySelector('h2').innerHTML = sliderNames[i];
      sd.querySelector('div').className = sd.querySelector('div').id = sliderNames[i];

      sliderFragment.insertBefore(sd, sliderFragment.firstChild);
    }
    docContainer.insertBefore(sliderFragment, divider);
  };

  my.cacheSliders = function () {
    for (var i = 0; i < sliderNames.length; i++) {
      this.dom.sliders[sliderNames[i]] = doc.getElementById(sliderNames[i]);
    }
  };

  my.createSuiteContainer = function () {
    var newDiv = div.cloneNode(true);
    newDiv.className = 'suite-container';
    this.dom.body.insertBefore(newDiv, this.dom.container);
    this.dom.suiteContainer = newDiv;
    return newDiv;
  };

  my.createSubSuiteContainer = function (container, newClass) {
    var newUl = ul.cloneNode(true);
    if (newClass) { newUl.className = newClass; }
    container.appendChild(newUl);
    return newUl;
  };

  my.createSuiteTitle = function (container, describe, newClass) {
    var newDiv = div.cloneNode(true);
    newDiv.innerHTML = describe;
    newDiv.className = newClass || 'title';
    container.appendChild(newDiv);
  };

  my.createSuite = function (container, describe, result) {
    var newLi = li.cloneNode(true);
    newLi.innerHTML = describe;
    if (!result) { newLi.className += 'fail'; }
    container.appendChild(newLi);
  };

  my.checkInit = function (container, options) {
    var sliderContainer = options.sliderContainer,
        mode = options.transform || 'horizontal',
        slideItems = options.slideItems,
        slideCount = options.slideCount,
        cloneCount = options.cloneCount,
        items = options.items,
        controls = options.controls,
        nav = options.nav,
        gutter = options.gutter,
        edgePadding = options.edgePadding,
        gap = gutter + edgePadding,
        prevDisabled = !options.loop,
        controlsContainer = options.controlsContainer(),
        prevButton = options.prevButton(),
        nextButton = options.nextButton(),
        navContainer = options.navContainer(),
        allNavs = options.allNavs(),
        navEnabled = true;

    my.createSuiteTitle(container, 'Initialization', 'subtitle');
    var CT = my.createSubSuiteContainer(container);
    
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
      Math.round(slideItems[cloneCount].getBoundingClientRect().left) === Math.round(sliderContainer.parentNode.getBoundingClientRect().left + gap) &&
      Math.round(slideItems[cloneCount + items - 1].getBoundingClientRect().right + gap) === Math.round(sliderContainer.parentNode.getBoundingClientRect().right)
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

  my.checkFunctions = function (container, options) {
    var sliderContainer = options.sliderContainer,
        mode = options.transform || 'horizontal',
        slideItems = options.slideItems,
        slideCount = options.slideCount,
        cloneCount = options.cloneCount,
        items = options.items,
        controls = options.controls,
        nav = options.nav,
        speed = options.speed,
        loop = options.loop,
        gutter = options.gutter,
        edgePadding = options.edgePadding,
        slideBy = options.slideBy,
        slideWidth = options.slideWidth(),
        gap = gutter + edgePadding,
        prevDisabled = !options.loop,
        controlsContainer = options.controlsContainer(),
        prevButton = options.prevButton(),
        nextButton = options.nextButton(),
        navContainer = options.navContainer(),
        allNavs = options.allNavs(),
        navEnabled = true,
        slideLength = slideItems.length,
        slideCountMultiple = Math.floor((cloneCount * 2 + slideCount) / slideCount);

    my.createSuiteTitle(container, 'Functions', 'subtitle');
    var CT = my.createSubSuiteContainer(container);

    // check controls
    function checkControls (des, fn, ss) {
      function fallback () {
        fn();
        (des === 'next') ? a++ : a--;
        setTimeout(function () {
          checkControls(des, fn, ss);
        }, 50);
      };

      if (!controlsCheckInit && my.transitionendEvent) {
        sliderContainer.addEventListener(my.transitionendEvent, fallback);
        controlsCheckInit = true;
        ss = ss || fallback;
      }

      if (des === 'next' && a < b) { 
        my.simulateClick(nextButton);
        if (!my.transitionendEvent) {
          setTimeout(function () {
            fallback();
          }, 20);
        } 
      } else if (des === 'prev' && a >= 0){
        my.simulateClick(prevButton);
        if (!my.transitionendEvent) {
          setTimeout(function () {
            fallback();
          }, 20);
        } 
      } else {
        sliderContainer.removeEventListener(my.transitionendEvent, ss);
        my.createSuite(CT, 'Controls: ' + des + ' button works as expected.', controlsFnCheck);
        if (des === 'next') {
          events.emit('nextButtonDone');
        } else {
          events.emit('prevButtonDone');
        }
      }
    }
      
    function controlsFn (des) {
      var index = cloneCount + slideBy * a,
          SLs = [],
          pr = Math.round(sliderContainer.parentNode.getBoundingClientRect().right),
          sr = Math.round(slideItems[slideLength - 1].getBoundingClientRect().right);

      index = (index < 0) ? index + slideCount : index%slideCount;

      for (var i = 0; i < slideCountMultiple; i++) {
        var left = (index%1 === 0) ? Math.round(slideItems[index + slideCount * i].getBoundingClientRect().left) : Math.round(slideItems[Math.floor(index) + slideCount * i].getBoundingClientRect().left + (index - Math.floor(index)) * slideWidth);
        SLs.push(left);
      }

      // console.log(index, SLs, a, b);
      if (sr < pr || SLs.indexOf(gap) === -1) {
        controlsFnCheck = false;
      }
    }

    function prevFn() { controlsFn('prev'); }
    function nextFn() { controlsFn('next'); }

    if (controls) {
      var a = 1, 
          b = (loop) ? Math.floor(slideCount/slideBy) + 1 : Math.floor((slideCount - items)/slideBy) + 1,
          controlsFnCheck = true,
          controlsCheckInit = false;

      checkControls('next', nextFn);
      events.on('nextButtonDone', function () {
        // reset variables
        a = a -2;
        controlsCheckInit = false;
        checkControls('prev', prevFn);
      });
    }

    // check nav
    if (nav) {
      var c = options.navCountVisible() - 1,
          navFnCheck = true,
          navCheckInit = false;

      events.on('prevButtonDone', function () {
        checkNav();
      });

      function checkNav() {
        if (!navCheckInit && my.transitionendEvent) {
          sliderContainer.addEventListener(my.transitionendEvent, navCheckFn);
          navCheckInit = true;
        }

        if (c >= 0) {
          my.simulateClick(allNavs[c]);
          // console.log(c);
          if (!my.transitionendEvent) {
            setTimeout(function () {
              navCheckFn();
            }, 20);
          }
        } else {
          sliderContainer.removeEventListener(my.transitionendEvent, navCheckFn);
          my.createSuite(CT, 'Nav: works as expected.', navFnCheck);
          events.emit('navDone');
        }
      }

      function navCheckFn() {
        var index = Math.min((cloneCount + items * c), (slideLength - items));
        // console.log(index, slideItems[index].getBoundingClientRect().left);
        if (slideItems[index].getBoundingClientRect().left !== gap) { 
          navFnCheck = false; 
        }
        c--;
        checkNav();
      }
    }

  };

  return my;
})();

tt.createSliderHtml();
tt.cacheSliders();

// # base
var baseSD = tinySlider({
  container: tt.dom.sliders.base,
  items: 3,
  speed: 10,
});
// baseSD.init();

// var baseContainer = tt.createSuiteContainer();
// tt.createSuiteTitle(baseContainer, 'base');
// tt.checkInit(baseContainer, baseSD);
// tt.checkFunctions(baseContainer, baseSD);

// # responsive
var responsiveSD = tinySlider({
  container: tt.dom.sliders.responsive,
  gutter: 10,
  gutterPosition: 'left',
  edgePadding: 50,
  slideBy: 'page',
  responsive: {
    600: 2,
    900: 3,
  },
  // rewind: true,
});
responsiveSD.init();

// var responsiveContainer = tt.createSuiteContainer();
// tt.createSuiteTitle(responsiveContainer, 'responsive');
// tt.checkInit(responsiveContainer, responsiveSD);
// tt.checkFunctions(responsiveContainer, responsiveSD);

tinySlider({
  container: tt.dom.sliders.fixedWidth,
  gutter: 10,
  edgePadding: 50,
  fixedWidth: 200,
  arrowKeys: true,
  rewind: true,
  slideByPage: true,
  loop: false,
}).init();

tinySlider({
  container: tt.dom.sliders.nonLoop,
  items: 3,
  edgePadding: 50,
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
  // autoplay: true,
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
  controlsContainer: document.querySelector('.customize-tools .controls'),
  navContainer: document.querySelector('.customize-tools .thumbnails'),
  lazyload: true,
}).init();

tinySlider({
  container: document.querySelector('.auto-height'),
  autoHeight: true,
  items: 1,
}).init();

tinySlider({
  container: tt.dom.sliders.vertical,
  items: 2,
  mode: 'carousel',
  direction: 'vertical',
}).init();
// var myWindow = window.open('http://192.168.103.82:3000/tests/E2E/index.html', 'test window', 'innerWidth=1024, height=800, resizable, scrollbars, status');
// setTimeout(function () {
//   myWindow.resizeTo(800, 1024);
// }, 1000);

