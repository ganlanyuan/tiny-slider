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

  my.createSuiteTitle = function (describe) {
    var newLi = li.cloneNode(true);
    newLi.innerHTML = describe;
    newLi.className = 'title';
    this.dom.suiteContainer.appendChild(newLi);
  };

  my.createSuite = function (describe, result) {
    var newLi = li.cloneNode(true);
    newLi.innerHTML = describe;
    if (!result) { newLi.className = 'fail'; }
    this.dom.suiteContainer.appendChild(newLi);
  };

  my.checkAttributes = function (options) {
    var el = options.container,
        mode = options.mode || 'horizontal',
        slideCount = options.slideCount || 8,
        cloneCount = options.cloneCount || slideCount,
        items = options.items || 3,
        controls = options.controls || true,
        nav = options.nav || true,
        prevDisabled = options.prevDisabled || false;

    // check wrapper
    my.createSuite(
      'Slider is wrapped into .tiny-slider.', 
      el.parentNode.className === 'tiny-slider'
    );

    // check container
    my.createSuite(
      'Classes  tiny-content and ' + mode + ' are added.', 
      el.className.indexOf('tiny-content ' + mode) !== -1
    );

    // // check transform
    // my.createSuite(
    //   'Transform is added.',
    //   el.style.transitionDuration === '0s' && 
    //   el.style.transform === 'translate3d(0px, 0px, 0px)'
    // );

    // check slides' aria-hidden
    var ariaHiddenAdded = true, 
        elChildren = el.children,
        elChildrenLen = el.children.length;
    for (var i = 0; i < elChildrenLen; i++) {
      if (ariaHiddenAdded) { 
        if (i >= cloneCount && i < cloneCount + items) {
          if (elChildren[i].getAttribute('aria-hidden') !== 'false') {
            ariaHiddenAdded = false; 
          }
        } else {
          if (elChildren[i].getAttribute('aria-hidden') !== 'true') {
            ariaHiddenAdded = false; 
          }
        }
      }
    }
    my.createSuite(
      'Aria-hidden attributes are correctly added.', 
      ariaHiddenAdded
    );

    // check controls
    if (controls) {
      var controlsContainer = el.nextSibling,
          prevBtn = controlsContainer.children[0],
          nextBtn = controlsContainer.children[1];

      my.createSuite(
        'Class .tiny-controls and attribute aria-label are added to controls container.',
        controlsContainer.className.indexOf('tiny-controls') !== -1 && 
        controlsContainer.getAttribute('aria-label') === 'Carousel Navigation' 
      );
      my.createSuite(
        'Attributes are correctly added to controls.',
        prevBtn.getAttribute('data-controls') === 'prev' &&
        prevBtn.getAttribute('tabindex') === '-1' &&
        prevBtn.getAttribute('aria-controls') === el.id &&
        prevBtn.hasAttribute('disabled') === prevDisabled &&
        nextBtn.getAttribute('data-controls') === 'next' &&
        nextBtn.getAttribute('tabindex') === '0' &&
        nextBtn.getAttribute('aria-controls') === el.id
      );
    }

    // check nav
    if (nav) {
      var navContainer = el.nextSibling.nextSibling,
          allNavs = navContainer.querySelectorAll('[data-slide]'),
          navEnabled = true;

      my.createSuite(
        'Class .tiny-nav and attribute aria-label are added to nav container.',
        navContainer.className.indexOf('tiny-nav') !== -1 && 
        navContainer.getAttribute('aria-label') === 'Carousel Pagination' 
      );

      var controlsName = el.id + 'item';
      for (var i = 0; i < slideCount; i++) {
        if (navEnabled) {
          var tabindex = (i !== 0) ? '-1' : '0',
              selected = (i !== 0) ? 'false' : 'true',
              thisNav = allNavs[i];

          navEnabled = thisNav.getAttribute('data-slide') === i + '' && thisNav.getAttribute('tabindex') === tabindex && thisNav.getAttribute('aria-selected') === selected && thisNav.getAttribute('aria-controls') === controlsName + i;
        }
      }

      my.createSuite(
        'Attributes are correctly added to navs.',
        allNavs.length === slideCount && navEnabled
      );
    }
  };

  return my;
})();

tt.createSliderHtml();
tt.cacheSliders();
tt.createSuiteContainer();

// # base
tinySlider({
  container: tt.dom.sliders.base,
  items: 3,
}).init();
tt.createSuiteTitle('base');
tt.checkAttributes({
  container: tt.dom.sliders.base, 
  cloneCount: 8,
  items: 3,
  prevDisabled: false,
});

tinySlider({
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
}).init();

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


