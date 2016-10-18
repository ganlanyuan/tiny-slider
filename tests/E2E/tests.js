if (!Array.prototype.forEach) {
    Array.prototype.forEach =  function(block, thisObject) {
        var len = this.length >>> 0;
        for (var i = 0; i < len; i++) {
            if (i in this) {
                block.call(thisObject, this[i], i, this);
            }
        }
    };
}
var events = {
  events: {},
  on: function (eventName, fn) {
    this.events[eventName] = this.events[eventName] || [];
    this.events[eventName].push(fn);
  },
  off: function(eventName, fn) {
    if (this.events[eventName]) {
      for (var i = 0; i < this.events[eventName].length; i++) {
        if (this.events[eventName][i] === fn) {
          this.events[eventName].splice(i, 1);
          break;
        }
      };
    }
  },
  emit: function (eventName, data) {
    if (this.events[eventName]) {
      this.events[eventName].forEach(function(fn) {
        fn(data);
      });
    }
  }
};
/* From Modernizr */
function whichTransitionEvent(){
  var t,
      el = document.createElement('fakeelement'),
      transitions = {
        'transition':'transitionend',
        'OTransition':'oTransitionEnd',
        'MozTransition':'transitionend',
        'WebkitTransition':'webkitTransitionEnd'
      };

  for(t in transitions){
    if( el.style[t] !== undefined ){
      return transitions[t];
    }
  }

  return false // explicit for ie8 (._.)
}
// Production steps of ECMA-262, Edition 5, 15.4.4.14
// Reference: http://es5.github.io/#x15.4.4.14
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function(searchElement, fromIndex) {

    var k;

    // 1. Let o be the result of calling ToObject passing
    //    the this value as the argument.
    if (this == null) {
      throw new TypeError('"this" is null or not defined');
    }

    var o = Object(this);

    // 2. Let lenValue be the result of calling the Get
    //    internal method of o with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = o.length >>> 0;

    // 4. If len is 0, return -1.
    if (len === 0) {
      return -1;
    }

    // 5. If argument fromIndex was passed let n be
    //    ToInteger(fromIndex); else let n be 0.
    var n = +fromIndex || 0;

    if (Math.abs(n) === Infinity) {
      n = 0;
    }

    // 6. If n >= len, return -1.
    if (n >= len) {
      return -1;
    }

    // 7. If n >= 0, then Let k be n.
    // 8. Else, n<0, Let k be len - abs(n).
    //    If k is less than 0, then let k be 0.
    k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

    // 9. Repeat, while k < len
    while (k < len) {
      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the
      //    HasProperty internal method of o with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      //    i.  Let elementK be the result of calling the Get
      //        internal method of o with the argument ToString(k).
      //   ii.  Let same be the result of applying the
      //        Strict Equality Comparison Algorithm to
      //        searchElement and elementK.
      //  iii.  If same is true, return k.
      if (k in o && o[k] === searchElement) {
        return k;
      }
      k++;
    }
    return -1;
  };
}

var tt = (function () {
  var my = {}, 
      doc = document,
      sliderNames = ['vertical', 'fade', 'responsive', 'fixedWidth', 'nonLoop', 'slideByPage', 'autoplay', 'arrowKeys'],
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
        gutter = options.gutter,
        edgePadding = options.edgePadding,
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

    my.createSuiteTitle('Functions', 'subtitle');
    var CT = my.createSubSuiteContainer();
    
    // check controls
    function checkControls (des, fn, ss) {
      function fallback () {
        fn();
        a++;
        setTimeout(function () {
          checkControls(des, fn, ss);
        }, 50);
      };

      if (!controlsCheckInit && my.transitionendEvent) {
        sliderContainer.addEventListener(my.transitionendEvent, fallback);
        controlsCheckInit = true;
        ss = ss || fallback;
      }

      if (a < b) { 
        my.simulateClick((des === 'prev')? prevButton : nextButton);
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
      var index = (des === 'prev')? slideCount - a : slideCount + a,
          SLs = [],
          pr = Math.round(sliderContainer.parentNode.getBoundingClientRect().right),
          sr = Math.round(slideItems[slideLength - 1].getBoundingClientRect().right);

      index = (index < 0) ? index + slideCount : index%slideCount;

      for (var i = 0; i < slideCountMultiple; i++) {
        SLs.push(Math.round(slideItems[index + slideCount * i].getBoundingClientRect().left));
      }

      if (sr < pr || SLs.indexOf(gap) === -1) {
        controlsFnCheck = false;
      }
    }

    function prevFn() { controlsFn('prev'); }
    function nextFn() { controlsFn('next'); }

    if (controls) {
      var a = 1, 
          b = slideCount + 1,
          controlsFnCheck = true,
          controlsCheckInit = false;

      // checkControls('next', nextFn);
      // events.on('nextButtonDone', function () {
      //   // reset variables
      //   a = 1;
      //   controlsCheckInit = false;
      //   checkControls('prev', prevFn);
      // });
    }

    // check nav
    if (nav) {
      var c = 1,
          d = options.navCountVisible,
          navFnCheck = true,
          navCheckInit = false;

      // events.on('prevButtonDone', function () {
      //   checkNav();
      // });

      function checkNav() {
        if (!navCheckInit && my.transitionendEvent) {
          sliderContainer.addEventListener(my.transitionendEvent, navCheckFn);
          navCheckInit = true;
        }

        if (c < d) {
          my.simulateClick(allNavs[c]);
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
        if (slideItems[index].getBoundingClientRect().left !== gap) { 
          navFnCheck = false; 
        }
        c++;
        checkNav();
      }
    }

  };

  return my;
})();

tt.createSliderHtml();
tt.cacheSliders();
tt.createSuiteContainer();

// # base
// var baseSD = tinySlider({
//   container: tt.dom.sliders.base,
//   items: 3,
//   speed: 10,
// });
// baseSD.init();
// tt.createSuiteTitle('base');
// tt.checkInit(baseSD);
// tt.checkFunctions(baseSD);

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
tt.createSuiteTitle('responsive');
tt.checkInit(responsiveSD);
tt.checkFunctions(responsiveSD);

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

