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

  my.checkAttrubutes = function (el, modeName, cloneCount, items) {
    my.createSuite(
      'wrapped into .tiny-slider', 
      el.parentNode.className === 'tiny-slider'
    );
    my.createSuite(
      'add class tiny-content and ' + modeName, 
      el.className.indexOf('tiny-content ' + modeName) !== -1
    );
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
      'aria-hiddens are correctly added', 
      ariaHiddenAdded
    );
  };

  return my;
})();

tt.createSliderHtml();
tt.cacheSliders();
tinySlider({
  container: tt.dom.sliders.base,
  items: 3,
}).init();

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

tt.createSuiteContainer();

tt.createSuiteTitle('base');
tt.checkAttrubutes(tt.dom.sliders.base, 'horizontal', 8, 3);