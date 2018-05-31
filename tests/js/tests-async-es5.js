'use strict';

// ### base
var testBase = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var id, slider, info, container, innerWrapper, slideItems, navItems, visibleNavIndexes, slideCount, cloneCount, assertion, controlsClick, navClick, controlsKeydown, navKeydown, testGoto, i, current, currentSlide, prev, absIndex, navContainer, wrapperLeft, controls, input, button, mul, checkGoto;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            checkGoto = function checkGoto() {
              var number = Math.round(Math.random() * mul);
              input.value = number;
              button.click();
              while (number < 0) {
                number += slideCount;
              }
              if (assertion !== false) {
                assertion = slider.getInfo().index % slideCount === number % slideCount;
              }
            };

            id = 'base', slider = sliders[id], info = slider.getInfo(), container = info.container, innerWrapper = container.parentNode, slideItems = info.slideItems, navItems = info.navItems, visibleNavIndexes = info.visibleNavIndexes, slideCount = info.slideCount, cloneCount = info.cloneCount;


            addTitle(id);

            runTest('Outer wrapper: classes', function () {
              return containsClasses(innerWrapper.parentNode, ['tns-outer']);
            });

            runTest('Inner wrapper: classes', function () {
              return containsClasses(innerWrapper, ['tns-inner', 'tns-ovh']);
            });

            runTest('Container: classes', function () {
              return containsClasses(container, ['base', 'tns-slider', 'tns-carousel', 'tns-horizontal']);
            });

            runTest('Slides: width, count, id, class, aria-hidden, tabindex', function () {
              return checkSlidesAttrs(id);
            });

            runTest('Slides: position', function () {
              return checkPositionEdgePadding(id);
            });

            runTest('Controls: class, aria-label, aria-controls, data-controls, tabindex', function () {
              return checkControlsAttrs(id);
            });

            runTest('Nav items: data-nav, hidden', function () {
              var navVisible = navItems[0],
                  navHidden = navItems[2];

              return navVisible.getAttribute('data-nav') === '0' && !navVisible.hasAttribute('hidden') && navHidden.getAttribute('data-nav') === '2' && navHidden.hasAttribute('hidden');
            });

            controlsClick = addTest('Controls: click functions'), navClick = addTest('Nav: click functions'), controlsKeydown = addTest('Controls: keydown events'), navKeydown = addTest('Nav: keydown events'), testGoto = addTest('Goto: Random numbers');

            // controls click

            _context.next = 13;
            return checkControlsClick(controlsClick, id, 11);

          case 13:

            // nav click
            for (i = visibleNavIndexes.length; i--;) {
              navItems[visibleNavIndexes[i]].click();

              current = slider.getInfo().index, currentSlide = slideItems[current];


              if (assertion !== false) {
                assertion = navItems[visibleNavIndexes[i]].getAttribute('aria-selected') === 'true' && getAbsIndex(current, 0, info) === visibleNavIndexes[i] && compare2Nums(currentSlide.getBoundingClientRect().left, 0) && currentSlide.getAttribute('aria-hidden') === 'false';
              }
            }

            updateTest(navClick, assertion);

            // keydown events

            if (!canFireKeydown) {
              _context.next = 50;
              break;
            }

            _context.next = 18;
            return repeat(function () {
              // fire keydown events on left arrow
              fire(info.controlsContainer, 'keydown', { 'keyCode': 37 });
            }, 3);

          case 18:
            prev = info.index, current = slider.getInfo().index, absIndex = getAbsIndex(prev, -3, info), currentSlide = slideItems[current];


            assertion = current === absIndex + cloneCount && navItems[absIndex].getAttribute('aria-selected') === 'true' && compare2Nums(currentSlide.getBoundingClientRect().left, innerWrapper.getBoundingClientRect().left);

            if (!assertion) {
              _context.next = 27;
              break;
            }

            _context.next = 23;
            return repeat(function () {
              fire(info.controlsContainer, 'keydown', { 'keyCode': 39 });
            }, 3);

          case 23:

            current = slider.getInfo().index;
            absIndex = 0;
            currentSlide = slideItems[current];

            assertion = current === absIndex + cloneCount && navItems[absIndex].getAttribute('aria-selected') === 'true' && compare2Nums(currentSlide.getBoundingClientRect().left, innerWrapper.getBoundingClientRect().left);

          case 27:

            updateTest(controlsKeydown, assertion);

            // nav keydown
            navContainer = info.navContainer, wrapperLeft = innerWrapper.getBoundingClientRect().left;
            // focus on the 1st nav item

            navItems[visibleNavIndexes[0]].focus();
            // fire keydown event on right arrow
            // the 2nd nav item get focused
            fire(navContainer, 'keydown', { 'keyCode': 39 });
            assertion = document.activeElement === navItems[visibleNavIndexes[1]];
            // press "Enter"
            fire(navContainer, 'keydown', { 'keyCode': 13 });
            current = slider.getInfo().index, currentSlide = slideItems[current];

            if (assertion) {
              assertion = getAbsIndex(current, 0, info) === visibleNavIndexes[1] && navItems[visibleNavIndexes[1]].getAttribute('aria-selected') === 'true' && compare2Nums(currentSlide.getBoundingClientRect().left, wrapperLeft);
            }
            // fire keydown event on left arrow
            // the 1st nav item get focused
            fire(navContainer, 'keydown', { 'keyCode': 37 });
            if (assertion) {
              assertion = document.activeElement === navItems[visibleNavIndexes[0]];
            }
            // fire keydown event on down arrow
            // the 3nd nav item get focused
            fire(navContainer, 'keydown', { 'keyCode': 40 });
            if (assertion) {
              assertion = document.activeElement === navItems[visibleNavIndexes[2]];
            }
            // press "Space"
            fire(navContainer, 'keydown', { 'keyCode': 32 });
            current = slider.getInfo().index, currentSlide = slideItems[current];


            if (assertion) {
              assertion = getAbsIndex(current, 0, info) === visibleNavIndexes[2] && navItems[visibleNavIndexes[2]].getAttribute('aria-selected') === 'true' && compare2Nums(currentSlide.getBoundingClientRect().left, wrapperLeft);
            }
            // fire keydown event on up arrow
            // the 1st nav item get focused
            fire(navContainer, 'keydown', { 'keyCode': 38 });
            if (assertion) {
              assertion = document.activeElement === navItems[visibleNavIndexes[0]];
            }
            // press "Enter"
            fire(navContainer, 'keydown', { 'keyCode': 13 });
            current = slider.getInfo().index, currentSlide = slideItems[current];


            if (assertion) {
              assertion = getAbsIndex(current, 0, info) === visibleNavIndexes[0] && navItems[visibleNavIndexes[0]].getAttribute('aria-selected') === 'true' && compare2Nums(currentSlide.getBoundingClientRect().left, wrapperLeft);
            }
            updateTest(navKeydown, assertion);
            _context.next = 52;
            break;

          case 50:
            updateTest(controlsKeydown, '?');
            updateTest(navKeydown, '?');

          case 52:

            // go to
            controls = document.querySelector('#base_wrapper .goto-controls'), input = controls.querySelector('input'), button = controls.querySelector('.button'), mul = 100;
            _context.next = 55;
            return repeat(checkGoto, 3);

          case 55:
            mul = -100;
            _context.next = 58;
            return repeat(checkGoto, 3);

          case 58:

            updateTest(testGoto, assertion);

          case 59:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function testBase() {
    return _ref.apply(this, arguments);
  };
}();

var testNonLoop = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
    var id, slider, info, slideCount, items, test, assertion, prevButton, nextButton, navItems, slideItems, current;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            id = 'non-loop', slider = sliders[id], info = slider.getInfo(), slideCount = info.slideCount, items = info.items;


            addTitle(id);

            runTest('Slide: count && Controls: disabled', function () {
              return info.slideItems.length === info.slideCount && info.prevButton.hasAttribute('disabled');
            });

            test = addTest('Controls: click functions');
            prevButton = info.prevButton, nextButton = info.nextButton, navItems = info.navItems, slideItems = info.slideItems;


            nextButton.click();
            assertion = !prevButton.hasAttribute('disabled');

            // click next button (slideCount - items) times
            _context2.next = 9;
            return repeat(function () {
              nextButton.click();
            }, slideCount - items - 1);

          case 9:
            current = slideCount - items;
            if (assertion) {
              assertion = nextButton.hasAttribute('disabled') && navItems[current].getAttribute('aria-selected') === 'true' && slideItems[current].getAttribute('aria-hidden') === 'false' && compare2Nums(slideItems[current].getBoundingClientRect().left, 0);
            }

            // click next button once
            nextButton.click();
            if (assertion) {
              current = slideCount - items;
              assertion = navItems[current].getAttribute('aria-selected') === 'true' && slideItems[current].getAttribute('aria-hidden') === 'false';
            }

            // click prev button once
            prevButton.click();
            if (assertion) {
              assertion = !nextButton.hasAttribute('disabled');
            }

            // click prev button (slideCount - items) times
            _context2.next = 17;
            return repeat(function () {
              prevButton.click();
            }, slideCount - items - 1);

          case 17:
            current = 0;
            if (assertion) {
              assertion = prevButton.hasAttribute('disabled') && navItems[current].getAttribute('aria-selected') === 'true' && slideItems[current].getAttribute('aria-hidden') === 'false' && compare2Nums(slideItems[current].getBoundingClientRect().left, 0);
            }

            updateTest(test, assertion);

          case 20:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function testNonLoop() {
    return _ref2.apply(this, arguments);
  };
}();

var testAutoplay = function () {
  var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8() {
    var id, slider, info, opt, buttons, autoplayButton, timeout, testClick, test1, test2, assertion;
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            id = 'autoplay', slider = sliders[id], info = slider.getInfo(), opt = options[id], buttons = info.navContainer.children, autoplayButton = doc.querySelector('#' + id + '_wrapper [data-action]');


            addTitle(id);
            runTest('autoplayButton: attrs', function () {
              return autoplayButton.getAttribute('data-action') === 'stop' && autoplayButton.textContent.indexOf('stop animation') > -1;
            });

            timeout = 0;

            if (opt['autoplayTimeout']) {
              timeout += opt['autoplayTimeout'];
            }
            if (opt['speed']) {
              timeout += opt['speed'];
            }

            testClick = addTest('autoplayButton: click'), test1 = addTest('Slide: autoplay'), test2 = addTest('Slide: autoplay pause');

            // click autoplay button once => pause

            autoplayButton.click();
            assertion = autoplayButton.getAttribute('data-action') === 'start' && autoplayButton.textContent.indexOf('start animation') > -1;

            if (assertion) {
              // click autoplay button the second time => restart
              autoplayButton.click();
              assertion = autoplayButton.getAttribute('data-action') === 'stop' && autoplayButton.textContent.indexOf('stop animation') > -1;
            }

            updateTest(testClick, assertion);

            // test autoplay
            _context8.next = 13;
            return testAutoplayFn(id, test1, timeout, false);

          case 13:
            // test autoplay pause
            autoplayButton.click();
            _context8.next = 16;
            return testAutoplayFn(id, test2, timeout, true);

          case 16:
          case 'end':
            return _context8.stop();
        }
      }
    }, _callee8, this);
  }));

  return function testAutoplay() {
    return _ref8.apply(this, arguments);
  };
}();

var testAnimation1 = function () {
  var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9() {
    var id, slider, info, slideCountNew, items, slideItems, opt, animateIn, animateOut, animateNormal, speed, checkAnimationClasses, test;
    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            checkAnimationClasses = function checkAnimationClasses() {
              var assertion,
                  index = slider.getInfo().index;

              for (var i = slideCountNew; i--;) {
                if (assertion !== false) {
                  assertion = i >= index && i < index + items ? containsClasses(slideItems[i], animateIn) : containsClasses(slideItems[i], animateNormal);
                }
              }

              return assertion;
            };

            id = 'animation1', slider = sliders[id], info = slider.getInfo(), slideCountNew = info.slideCountNew, items = info.items, slideItems = info.slideItems, opt = options[id], animateIn = opt['animateIn'] ? opt['animateIn'] : 'tns-fadeIn', animateOut = opt['animateOut'] ? opt['animateOut'] : 'tns-fadeOut', animateNormal = 'tns-normal', speed = opt['speed'] ? opt['speed'] : 0;


            if (localStorage['tnsAnDu'] === 'false') {
              animateIn = 'tns-fadeIn';
              animateOut = 'tns-fadeOut';
            }

            addTitle(id);

            runTest('Slides: classes on init', function () {
              return checkAnimationClasses();
            });

            test = addTest('Slides: classes after click');
            _context9.next = 8;
            return wait(300);

          case 8:
            info.nextButton.click();
            _context9.next = 11;
            return wait(speed + 500);

          case 11:
            updateTest(test, checkAnimationClasses());

          case 12:
          case 'end':
            return _context9.stop();
        }
      }
    }, _callee9, this);
  }));

  return function testAnimation1() {
    return _ref9.apply(this, arguments);
  };
}();

var testAnimation2 = function () {
  var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10() {
    var id, slider, info, container, slideItems, items, slideCount, nextButton, test, count, assertion, index, rect;
    return regeneratorRuntime.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            id = 'animation2', slider = sliders[id], info = slider.getInfo(), container = info.container, slideItems = info.slideItems, items = info.items, slideCount = info.slideCount, nextButton = info.nextButton;


            addTitle(id);

            test = addTest('Slides: position after click'), count = info.slideCountNew + 1;

            // click next button *count* times

            _context10.next = 5;
            return repeat(function () {
              nextButton.click();
            }, count);

          case 5:
            _context10.next = 7;
            return wait(300);

          case 7:
            index = slider.getInfo().index, rect = container.parentNode.getBoundingClientRect();


            assertion = index % slideCount === count * items % slideCount && compare2Nums(slideItems[index].getBoundingClientRect().left, rect.left) && compare2Nums(slideItems[index + items - 1].getBoundingClientRect().right, rect.right);

            updateTest(test, assertion);

          case 10:
          case 'end':
            return _context10.stop();
        }
      }
    }, _callee10, this);
  }));

  return function testAnimation2() {
    return _ref10.apply(this, arguments);
  };
}();

var testCustomize = function () {
  var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11() {
    var id, slider, info, opt, autoplayButton, controlsClick, autoplayT, autoplayPauseT, timeout;
    return regeneratorRuntime.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            id = 'customize', slider = sliders[id], info = slider.getInfo(), opt = options[id], autoplayButton = document.querySelector(opt['autoplayButton']);


            addTitle(id);

            // stop autoplay and go to the first slide
            // before testing slide attrs
            if (opt['autoplay']) {
              autoplayButton.click();
              slider.goTo(0);
            }
            runTest('Slides: width, count, id, class, aria-hidden, tabindex', function () {
              return checkSlidesAttrs(id);
            });

            runTest('Controls: aria-label, aria-controls, data-controls, tabindex', function () {
              return checkControlsAttrs(id);
            });

            runTest('Nav: aria-label, data-nav, tabindex, aria-selected, aria-controls', function () {
              var assertion,
                  info = slider.getInfo(),
                  slideCount = info.slideCount,
                  absIndex = info.index % slideCount,
                  navContainer = info.navContainer,
                  navItems = info.navItems;

              assertion = navContainer.getAttribute('aria-label') === 'Carousel Pagination';

              while (absIndex < 0) {
                absIndex += slideCount;
              }
              for (var i = slideCount; i--;) {
                var arr = i === absIndex ? ['0', 'true'] : ['-1', 'false'],
                    nav = navItems[i];
                if (assertion) {
                  assertion = nav.getAttribute('data-nav') === i.toString() && nav.getAttribute('aria-controls') === id + '-item' + i && nav.getAttribute(tabindex) === arr[0] && nav.getAttribute('aria-selected') === arr[1];
                }
              }
              return assertion;
            });

            // simulateClick(info.prevButton);
            controlsClick = addTest('Controls: click functions'), autoplayT = addTest('Slide: autoplay'), autoplayPauseT = addTest('Slide: autoplay pause');
            _context11.next = 9;
            return checkControlsClick(controlsClick, id, 11);

          case 9:
            if (!opt['autoplay']) {
              _context11.next = 19;
              break;
            }

            // reset autoplay
            autoplayButton.click();

            timeout = 100;

            if (opt['autoplayTimeout']) {
              timeout += opt['autoplayTimeout'];
            }
            if (opt['speed']) {
              timeout += opt['speed'];
            }

            _context11.next = 16;
            return testAutoplayFn(id, autoplayT, timeout, false);

          case 16:
            autoplayButton.click();
            _context11.next = 19;
            return testAutoplayFn(id, autoplayPauseT, timeout, true);

          case 19:
          case 'end':
            return _context11.stop();
        }
      }
    }, _callee11, this);
  }));

  return function testCustomize() {
    return _ref11.apply(this, arguments);
  };
}();

var repeat = function () {
  var _ref13 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13(fn, count, timeout) {
    return regeneratorRuntime.wrap(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            if (!timeout) {
              _context13.next = 10;
              break;
            }

          case 1:
            if (!(count > 0)) {
              _context13.next = 8;
              break;
            }

            _context13.next = 4;
            return wait(timeout);

          case 4:
            fn();
            count--;
            _context13.next = 1;
            break;

          case 8:
            _context13.next = 11;
            break;

          case 10:
            while (count > 0) {
              fn();
              count--;
            }

          case 11:
          case 'end':
            return _context13.stop();
        }
      }
    }, _callee13, this);
  }));

  return function repeat(_x, _x2, _x3) {
    return _ref13.apply(this, arguments);
  };
}();

var checkControlsClick = function () {
  var _ref14 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14(test, id, count, vertical) {
    var assertion, slider, info, container, wrapper, slideCount, navContainer, navItems, slideItems, items, edge1, edge2, getAssertion, current, absIndex;
    return regeneratorRuntime.wrap(function _callee14$(_context14) {
      while (1) {
        switch (_context14.prev = _context14.next) {
          case 0:
            getAssertion = function getAssertion(absIndex) {
              var index = sliders[id].getInfo().index,
                  first = slideItems[index],
                  last = slideItems[index + items - 1],
                  checkLastEdge = options[id]['fixedWidth'] ? true : compare2Nums(last.getBoundingClientRect()[edge2], wrapper.getBoundingClientRect()[edge2]);

              // if (id === 'customize') {
              //   console.log(absIndex, index%slideCount);
              // }
              if (first === undefined) {
                console.log(id, sliders[id].getInfo().index);
              }
              return absIndex === Number(navContainer.querySelector('.tns-nav-active').getAttribute('data-nav')) && navItems[absIndex].getAttribute('aria-selected') === 'true' && first.getAttribute('aria-hidden') === 'false' && !first.hasAttribute(tabindex) && last.getAttribute('aria-hidden') === 'false' && !last.hasAttribute(tabindex) && compare2Nums(first.getBoundingClientRect()[edge1], wrapper.getBoundingClientRect()[edge1]) && checkLastEdge;
            };

            slider = sliders[id], info = slider.getInfo(), container = info.container, wrapper = container.parentNode, slideCount = info.slideCount, navContainer = info.navContainer, navItems = info.navItems, slideItems = info.slideItems, items = info.items, edge1 = 'left', edge2 = 'right';


            if (vertical) {
              edge1 = 'top';
              edge2 = 'bottom';
            }

            // click prev button n times
            current = info.index, absIndex = getAbsIndex(current, -count, info);
            _context14.next = 6;
            return repeat(function () {
              id === 'customize' ? simulateClick(info.prevButton) : info.prevButton.click();
            }, count);

          case 6:
            assertion = getAssertion(absIndex);

            if (!assertion) {
              _context14.next = 11;
              break;
            }

            _context14.next = 10;
            return repeat(function () {
              id === 'customize' ? simulateClick(info.nextButton) : info.nextButton.click();
            }, count);

          case 10:
            assertion = getAssertion(0);

          case 11:

            updateTest(test, assertion);

          case 12:
          case 'end':
            return _context14.stop();
        }
      }
    }, _callee14, this);
  }));

  return function checkControlsClick(_x4, _x5, _x6, _x7) {
    return _ref14.apply(this, arguments);
  };
}();

var testAutoplayFn = function () {
  var _ref15 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15(id, el, timeout, equal) {
    var assertion, current;
    return regeneratorRuntime.wrap(function _callee15$(_context15) {
      while (1) {
        switch (_context15.prev = _context15.next) {
          case 0:
            current = sliders[id].getInfo().index;
            _context15.next = 3;
            return wait(timeout);

          case 3:
            assertion = current === sliders[id].getInfo().index;
            assertion = equal ? assertion : !assertion;
            updateTest(el, assertion);

          case 6:
          case 'end':
            return _context15.stop();
        }
      }
    }, _callee15, this);
  }));

  return function testAutoplayFn(_x8, _x9, _x10, _x11) {
    return _ref15.apply(this, arguments);
  };
}();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

if (!Object.keys) Object.keys = function (o) {
  if (o !== Object(o)) throw new TypeError('Object.keys called on a non-object');
  var k = [],
      p;
  for (p in o) {
    if (Object.prototype.hasOwnProperty.call(o, p)) k.push(p);
  }return k;
};

var resultsDiv = doc.querySelector('.test-results'),
    windowWidth = (document.documentElement || document.body.parentNode || document.body).clientWidth,
    multiplyer = 100,
    edgePadding = 50,
    gutter = 10,
    ua = navigator.userAgent,
    tabindex = ua.indexOf('MSIE 9.0') > -1 || ua.indexOf('MSIE 8.0') > -1 ? 'tabIndex' : 'tabindex',
    canFireKeydown;

document.onkeydown = function (e) {
  e = e || window.event;
  var body = document.body;
  if (e.ctrlKey === true && e.keyCode === 192) {
    if (body.getAttribute('data-fire-keyevent') !== 'true') {
      body.setAttribute('data-fire-keyevent', 'true');
    }
  }
};

fire(document, 'keydown', { 'ctrlKey': true, 'keyCode': 192 });
canFireKeydown = document.body.getAttribute('data-fire-keyevent') === 'true' ? true : false;

function testRewind() {
  var id = 'rewind',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);

  runTest('Slide: count && Controls: disabled', function () {
    return info.slideItems.length === info.slideCount && !info.prevButton.hasAttribute('disabled');
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
}

function testFixedWidth() {
  var id = 'fixedWidth',
      fixedWidth = 300,
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);

  runTest('Slides: position', function () {
    var assertion,
        slideItems = info.slideItems,
        slideCount = info.slideCount,
        cloneCount = info.cloneCount,
        items = info.items;
    assertion = items === Math.floor(windowWidth / fixedWidth) && compare2Nums(slideItems[cloneCount].getBoundingClientRect().left, 0);

    return assertion;
  });

  var controlsClick = addTest('Controls: click functions');
  checkControlsClick(controlsClick, id, info.slideCount * 3 + 2);
}

function testFixedWidthGutter() {
  var id = 'fixedWidth-gutter',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);

  runTest('Slides: gutter', function () {
    var slideItems = info.slideItems;
    return compare2Nums(slideItems[0].clientWidth, 310);
  });
}

function testFixedWidthEdgePadding() {
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

function testFixedWidthEdgePaddingGutter() {
  var id = 'fixedWidth-edgePadding-gutter',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);
  runTest('Slides: edge padding', function () {
    var slideItems = info.slideItems,
        cloneCount = info.cloneCount,
        items = info.items;

    // alert(items);
    // alert(slideItems[cloneCount].getBoundingClientRect().left);
    // alert(windowWidth - slideItems[cloneCount + items - 1].getBoundingClientRect().right + gutter);
    return compare2Nums(slideItems[cloneCount].getBoundingClientRect().left, windowWidth - slideItems[cloneCount + items - 1].getBoundingClientRect().right + gutter);
  });
}

function testVertical() {
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

    return compare2Nums(slideItems[0].getBoundingClientRect().left, 0) && compare2Nums(slideItems[0].getBoundingClientRect().right, windowWidth);
  });

  runTest('Slides: position', function () {
    return checkPositionEdgePadding(id, true);
  });

  var controlsClick = addTest('slides: click functions');
  checkControlsClick(controlsClick, id, 11, 'top');
}

function testVerticalGutter() {
  var id = 'vertical-gutter',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);
  runTest('Slides: position, gutter', function () {
    var slideItems = info.slideItems,
        cloneCount = info.cloneCount,
        firstRect = slideItems[cloneCount].getBoundingClientRect(),
        secondRect = slideItems[cloneCount + 1].getBoundingClientRect(),
        lastRect = slideItems[cloneCount + info.items - 1].getBoundingClientRect(),
        innerWrapperRect = info.container.parentNode.getBoundingClientRect();

    return compare2Nums(firstRect.top, innerWrapperRect.top) && compare2Nums(firstRect.bottom, secondRect.top - gutter) && compare2Nums(lastRect.bottom, innerWrapperRect.bottom - gutter);
  });
}

function testVerticalEdgePadding() {
  var id = 'vertical-edgePadding',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);
  runTest('Slides: position, edge padding', function () {
    return checkPositionEdgePadding(id, true);
  });
}

function testVerticalEdgePaddingGutter() {
  var id = 'vertical-edgePadding-gutter',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);
  runTest('Slides: position, edge padding', function () {
    return checkPositionEdgePadding(id, true);
  });
}

function testResponsive1() {
  var responsive1Tests = function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
      var doc, nextButton, assertionItems, assertionSlideBy, assertionGutter, assertionEdgePadding, container, slideItems, wrapper, slideBy, items, cloneCount, index, gutter, edgePadding, firstRect, secondRect, lastRect, wrapperRect;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.prev = 0;
              doc = newWindow.contentDocument ? newWindow.contentDocument : newWindow.contentWindow.document, nextButton = doc.querySelector('[data-controls="next"]'), container = doc.querySelector('#' + id), slideItems = container.children, wrapper = container.parentNode, slideBy = options[id].slideBy, items = responsive[bps[0]].items, cloneCount = (slideItems.length - 7) / 2, index = cloneCount, gutter = options[id].gutter, edgePadding = responsive[bps[0]].edgePadding;


              nextButton.click();
              firstRect = slideItems[index].getBoundingClientRect();
              lastRect = slideItems[index + items - 1].getBoundingClientRect();
              wrapperRect = wrapper.getBoundingClientRect();

              assertionItems = compare2Nums(firstRect.left, wrapperRect.left) && compare2Nums(lastRect.right, wrapperRect.right);
              assertionGutter = window.getComputedStyle(slideItems[index], null).paddingRight === gutter + 'px';
              assertionEdgePadding = compare2Nums(wrapperRect.left, edgePadding + gutter) && compare2Nums(wrapperRect.right + edgePadding, Number(bps[0]) + 20);
              // alert(assertionEdgePadding);

              // resize window
              newWindow.style.width = Number(bps[1]) + 20 + 'px';
              _context3.next = 12;
              return wait(2000);

            case 12:
              items = responsive[bps[1]].items;
              gutter = responsive[bps[1]].gutter;
              edgePadding = responsive[bps[1]].edgePadding, firstRect = slideItems[index].getBoundingClientRect();
              secondRect = slideItems[index + 1].getBoundingClientRect();
              lastRect = slideItems[index + items - 1].getBoundingClientRect();
              wrapperRect = wrapper.getBoundingClientRect();

              if (assertionItems) {
                assertionItems = compare2Nums(firstRect.left, wrapperRect.left) && compare2Nums(lastRect.right, wrapperRect.right);
              }

              if (assertionGutter) {
                assertionGutter = window.getComputedStyle(slideItems[index], null).paddingRight === gutter + 'px';
              }

              if (assertionEdgePadding) {
                assertionEdgePadding = compare2Nums(wrapperRect.left, edgePadding) && compare2Nums(wrapperRect.right + edgePadding, Number(bps[1]) + 20);
              }
              updateTest(testItems, assertionItems);
              updateTest(testGutter, assertionGutter);
              updateTest(testEdgePadding, assertionEdgePadding);

              nextButton.click();
              firstRect = slideItems[index + items].getBoundingClientRect();
              lastRect = slideItems[index + items * 2 - 1].getBoundingClientRect();
              wrapperRect = wrapper.getBoundingClientRect();

              if (assertionItems) {
                assertionSlideBy = compare2Nums(firstRect.left, wrapperRect.left) && compare2Nums(lastRect.right, wrapperRect.right);
              }

              updateTest(testSlideBy, assertionSlideBy);
              _context3.next = 39;
              break;

            case 32:
              _context3.prev = 32;
              _context3.t0 = _context3['catch'](0);

              console.log(_context3.t0);
              testItems.className = 'item-notsure';
              testSlideBy.className = 'item-notsure';
              testGutter.className = 'item-notsure';
              testEdgePadding.className = 'item-notsure';

            case 39:
              _context3.prev = 39;

              document.body.removeChild(newWindow);
              return _context3.finish(39);

            case 42:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, this, [[0, 32, 39, 42]]);
    }));

    return function responsive1Tests() {
      return _ref3.apply(this, arguments);
    };
  }();

  var id = 'responsive1',
      responsive = options[id]['responsive'],
      bps = Object.keys(responsive).sort(function (a, b) {
    return a - b;
  });

  addTitle(id + ': items, slideBy, gutter, edgePadding update');

  var testItems = addTest('items'),
      testSlideBy = addTest('slideBy'),
      testGutter = addTest('gutter'),
      testEdgePadding = addTest('edgePadding'),
      newWindow = document.createElement('iframe');
  newWindow.setAttribute('frameBorder', '0');
  newWindow.style.cssText = 'width: ' + (Number(bps[0]) + 20) + 'px; height: 1000px; border-width: 0; overflow: hidden;';
  newWindow.src = id + '.html';

  if (newWindow.addEventListener) {
    newWindow.addEventListener('load', responsive1Tests, false);
  } else if (newWindow.readyState) {
    newWindow.onreadystatechange = function () {
      if (newWindow.readyState === 'complete') {
        responsive1Tests();
      }
    };
  }

  document.body.appendChild(newWindow);
}

function testResponsive2() {
  var responsive2Tests = function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
      var assertionControls, assertionNav, assertionAutoplay, doc, box, slideItems, controlsContainer, navContainer, autoplayButton, index, timeouts, firstRect;
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.prev = 0;
              doc = newWindow.contentDocument ? newWindow.contentDocument : newWindow.contentWindow.document, box = doc.querySelector('#' + id + '_wrapper'), slideItems = box.querySelector('#' + id).children, controlsContainer = box.querySelector('.tns-controls'), navContainer = box.querySelector('.tns-nav'), autoplayButton = box.querySelector('[data-action]'), index = 14, timeouts = [options[id].autoplayTimeout, responsive[bps[0]].autoplayTimeout];


              firstRect = slideItems[index].getBoundingClientRect();
              _context4.next = 5;
              return wait(timeouts[1] + 1000);

            case 5:
              assertionControls = getComputedStyle(controlsContainer, null).display !== 'none';
              assertionNav = getComputedStyle(navContainer, null).display === 'none';
              assertionAutoplay = getComputedStyle(autoplayButton, null).display === 'none' && autoplayButton.getAttribute('data-action') === 'start' && firstRect.left === slideItems[index].getBoundingClientRect().left;
              // console.log(assertionControls, assertionNav, assertionAutoplay);
              // alert(assertionControls + ', ' + assertionNav + ', ' + assertionAutoplay);

              // resize window
              newWindow.style.width = Number(bps[0]) + 20 + 'px';
              firstRect = slideItems[index].getBoundingClientRect();
              _context4.next = 12;
              return wait(timeouts[1] + 1000);

            case 12:
              if (assertionControls) {
                assertionControls = getComputedStyle(controlsContainer, null).display === 'none';
              }
              if (assertionNav) {
                assertionNav = getComputedStyle(navContainer, null).display !== 'none';
              }
              if (assertionAutoplay) {
                assertionAutoplay = getComputedStyle(autoplayButton, null).display !== 'none' && autoplayButton.getAttribute('data-action') === 'stop' && firstRect.left !== slideItems[index].getBoundingClientRect().left;
              }
              // console.log(assertionControls, assertionNav, assertionAutoplay);
              // alert(assertionControls + ', ' + assertionNav + ', ' + assertionAutoplay);

              // resize window
              newWindow.style.width = Number(bps[0]) - 20 + 'px';
              firstRect = slideItems[index].getBoundingClientRect();
              _context4.next = 19;
              return wait(timeouts[0] + 1000);

            case 19:
              if (assertionControls) {
                assertionControls = getComputedStyle(controlsContainer, null).display !== 'none';
              }
              if (assertionNav) {
                assertionNav = getComputedStyle(navContainer, null).display !== 'none';
              }
              if (assertionAutoplay) {
                assertionAutoplay = getComputedStyle(autoplayButton, null).display === 'none' && autoplayButton.getAttribute('data-action') === 'start';
                firstRect.left === slideItems[index].getBoundingClientRect().left;
              }
              // console.log(assertionControls, assertionNav, assertionAutoplay);
              // alert(assertionControls + ', ' + assertionNav + ', ' + assertionAutoplay);

              updateTest(testControlsT, assertionControls);
              updateTest(testNavT, assertionNav);
              updateTest(testAutoplayT, assertionAutoplay);
              _context4.next = 32;
              break;

            case 27:
              _context4.prev = 27;
              _context4.t0 = _context4['catch'](0);

              testControlsT.className = 'item-notsure';
              testNavT.className = 'item-notsure';
              testAutoplayT.className = 'item-notsure';

            case 32:
              _context4.prev = 32;

              document.body.removeChild(newWindow);
              return _context4.finish(32);

            case 35:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, this, [[0, 27, 32, 35]]);
    }));

    return function responsive2Tests() {
      return _ref4.apply(this, arguments);
    };
  }();

  var id = 'responsive2',
      responsive = options[id]['responsive'],
      bps = Object.keys(responsive).sort(function (a, b) {
    return a - b;
  });

  addTitle(id + ': controls, nav, autoplay display toggle');

  var testControlsT = addTest('controls'),
      testNavT = addTest('nav'),
      testAutoplayT = addTest('autoplay'),
      newWindow = document.createElement('iframe');
  newWindow.setAttribute('frameBorder', '0');
  newWindow.style.cssText = 'width: ' + (Number(bps[1]) + 20) + 'px; height: 1000px; border-width: 0; overflow: hidden;';
  newWindow.src = id + '.html';

  if (newWindow.addEventListener) {
    newWindow.addEventListener('load', responsive2Tests, false);
  } else if (newWindow.readyState) {
    newWindow.onreadystatechange = function () {
      if (newWindow.readyState === 'complete') {
        responsive2Tests();
      }
    };
  }

  document.body.appendChild(newWindow);
}

function testResponsive3() {
  var responsive3Tests = function () {
    var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
      var assertionControls, assertionAutoplay, doc, box, controlsContainer, prevButton, nextButton, autoplayButton, str;
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.prev = 0;
              doc = newWindow.contentDocument ? newWindow.contentDocument : newWindow.contentWindow.document, box = doc.querySelector('#' + id + '_wrapper'), controlsContainer = box.querySelector('.tns-controls'), prevButton = controlsContainer.children[0], nextButton = controlsContainer.children[1], autoplayButton = box.querySelector('[data-action]');


              str = autoplayButton.innerHTML;
              assertionControls = prevButton.innerHTML === 'prev' && nextButton.innerHTML === 'next';
              assertionAutoplay = str.substring(str.length - 4) === 'stop';
              // console.log(assertionControls, assertionAutoplay);

              // resize window
              newWindow.style.width = Number(bps[0]) + 20 + 'px';
              _context5.next = 8;
              return wait(1000);

            case 8:
              str = autoplayButton.innerHTML;
              if (assertionControls) {
                assertionControls = prevButton.innerHTML === '&lt;' && nextButton.innerHTML === '&gt;';
              }
              if (assertionAutoplay) {
                assertionAutoplay = str.substring(str.length - 2) === '||';
              }
              // console.log(assertionControls, assertionAutoplay);

              // resize window
              newWindow.style.width = Number(bps[0]) - 20 + 'px';
              _context5.next = 14;
              return wait(1000);

            case 14:
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
              _context5.next = 25;
              break;

            case 21:
              _context5.prev = 21;
              _context5.t0 = _context5['catch'](0);

              testControlsT.className = 'item-notsure';
              testAutoplayT.className = 'item-notsure';

            case 25:
              _context5.prev = 25;

              document.body.removeChild(newWindow);
              return _context5.finish(25);

            case 28:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, this, [[0, 21, 25, 28]]);
    }));

    return function responsive3Tests() {
      return _ref5.apply(this, arguments);
    };
  }();

  var id = 'responsive3',
      responsive = options[id]['responsive'],
      bps = Object.keys(responsive).sort(function (a, b) {
    return a - b;
  });

  addTitle(id + ': controls, autoplay text content update');

  var testControlsT = addTest('controlsText'),
      testAutoplayT = addTest('autoplayText'),
      newWindow = document.createElement('iframe');

  newWindow.setAttribute('frameBorder', '0');
  newWindow.style.cssText = 'width: ' + (Number(bps[1]) + 20) + 'px; height: 1000px; border-width: 0; overflow: hidden;';
  newWindow.src = id + '.html';

  if (newWindow.addEventListener) {
    newWindow.addEventListener('load', responsive3Tests, false);
  } else if (newWindow.readyState) {
    newWindow.onreadystatechange = function () {
      if (newWindow.readyState === 'complete') {
        responsive3Tests();
      }
    };
  }

  document.body.appendChild(newWindow);
}

function testResponsive4() {
  var id = 'responsive4',
      responsive = options[id]['responsive'],
      bps = Object.keys(responsive).sort(function (a, b) {
    return a - b;
  });

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
  // newWindow.src = id + '.html';

  // if (newWindow.addEventListener) {
  //   newWindow.addEventListener('load', responsive4Tests, false);
  // } else if (newWindow.readyState) {
  //   newWindow.onreadystatechange = function() {
  //     if (newWindow.readyState === 'complete') {
  //       responsive4Tests();
  //     }
  //   }
  // }

  // document.body.appendChild(newWindow);

  function responsive4Tests() {
    if (canFireKeydown) {
      var assertionArrowKeys,
          doc = newWindow.contentDocument ? newWindow.contentDocument : newWindow.contentWindow.document,
          container = doc.querySelector('#' + id),
          left;

      new Promise(function (resolve) {
        left = container.getBoundingClientRect().left;
        // fire keydown event on right arrow
        fire(doc, 'keydown', { 'keyCode': 39 });

        resolve();
      }).then(function () {
        return new Promise(function (resolve) {
          assertionArrowKeys = container.getBoundingClientRect().left !== left;
          // console.log(assertionArrowKeys);

          resolve();
        });
      }).then(function () {
        // resize window
        return new Promise(function (resolve) {
          newWindow.style.width = Number(bps[0]) + 20 + 'px';
          left = container.getBoundingClientRect().left;

          resolve();
        }).then(function () {
          return new Promise(function (resolve) {
            // fire keydown event on right arrow
            fire(doc, 'keydown', { 'keyCode': 39 });

            resolve();
          });
        }).then(function () {
          return wait(500).then(function () {
            return new Promise(function (resolve) {
              if (assertionArrowKeys) {
                assertionArrowKeys = container.getBoundingClientRect().left === left;
              }
              // console.log(assertionArrowKeys);

              resolve();
            });
          });
        });
      }).then(function () {
        updateTest(testArrowKeysT, assertionArrowKeys);
        document.body.removeChild(newWindow);
      });
    } else {
      testArrowKeysT.className = 'item-notsure';
      document.body.removeChild(newWindow);
    }
  }
}

function testResponsive5() {
  var responsive5Tests = function () {
    var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
      var assertionFixedWidth, assertionAutoHeight, doc, wrapper, first;
      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.prev = 0;
              doc = newWindow.contentDocument ? newWindow.contentDocument : newWindow.contentWindow.document, wrapper = doc.querySelector('#' + id + '-iw'), first = doc.querySelector('#' + id).children[14];


              assertionFixedWidth = first.clientWidth === options[id].fixedWidth && wrapper.getBoundingClientRect().left === first.getBoundingClientRect().left;
              assertionAutoHeight = wrapper.style.height === '';
              // console.log(assertionFixedWidth, assertionAutoHeight);

              // resize window
              newWindow.style.width = Number(bps[0]) + 20 + 'px';
              _context6.next = 7;
              return wait(2000);

            case 7:
              if (assertionFixedWidth) {
                assertionFixedWidth = first.clientWidth === responsive[bps[0]].fixedWidth && wrapper.getBoundingClientRect().left === first.getBoundingClientRect().left;
              }
              if (assertionAutoHeight) {
                assertionAutoHeight = wrapper.style.height === first.clientHeight + 'px';
              }
              // console.log(assertionFixedWidth, assertionAutoHeight);

              updateTest(testFixedWidthT, assertionFixedWidth);
              updateTest(testAutoHeightT, assertionAutoHeight);
              _context6.next = 17;
              break;

            case 13:
              _context6.prev = 13;
              _context6.t0 = _context6['catch'](0);

              testFixedWidthT.className = 'item-notsure';
              testAutoHeightT.className = 'item-notsure';

            case 17:
              _context6.prev = 17;

              document.body.removeChild(newWindow);
              return _context6.finish(17);

            case 20:
            case 'end':
              return _context6.stop();
          }
        }
      }, _callee6, this, [[0, 13, 17, 20]]);
    }));

    return function responsive5Tests() {
      return _ref6.apply(this, arguments);
    };
  }();

  var id = 'responsive5',
      responsive = options[id]['responsive'],
      bps = Object.keys(responsive).sort(function (a, b) {
    return a - b;
  });

  addTitle(id + ': fixedWidth update, autoHeight toggle');

  var testFixedWidthT = addTest('fixedWidth'),
      testAutoHeightT = addTest('auto height'),
      newWindow = document.createElement('iframe');

  newWindow.setAttribute('frameBorder', '0');
  newWindow.style.cssText = 'width: ' + (Number(bps[0]) - 20) + 'px; height: 1000px; border-width: 0; overflow: hidden;';
  newWindow.src = id + '.html';

  if (newWindow.addEventListener) {
    newWindow.addEventListener('load', responsive5Tests, false);
  } else if (newWindow.readyState) {
    newWindow.onreadystatechange = function () {
      if (newWindow.readyState === 'complete') {
        responsive5Tests();
      }
    };
  }

  document.body.appendChild(newWindow);
}

function testResponsive6() {
  var responsive6Tests = function () {
    var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
      var assertionEdgePadding, assertionControlsNav, assertionControlsClick, doc, wrapper, container, controls, nav, child0, child1, childL, prevButton, nextButton, viewport, edge;
      return regeneratorRuntime.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.prev = 0;
              doc = newWindow.contentDocument ? newWindow.contentDocument : newWindow.contentWindow.document, wrapper = doc.querySelector('#' + id + '_wrapper'), container = doc.querySelector('#' + id), controls = wrapper.querySelector('.tns-controls'), nav = wrapper.querySelector('.tns-nav'), child0 = container.children[0], child1 = container.children[1], childL = container.children[container.children.length - 1], prevButton = controls.children[0], nextButton = controls.children[1];
              viewport = wrapper.clientWidth, edge = (viewport - fixedWidth) / 2;

              assertionEdgePadding = child0.getBoundingClientRect().left === edge && child0.getBoundingClientRect().right === viewport - (edge - gutter);

              // go to the second slide
              nextButton.click();
              _context7.next = 7;
              return wait(1000);

            case 7:
              viewport = wrapper.clientWidth, edge = (viewport - fixedWidth) / 2;

              assertionControlsClick = child1.getBoundingClientRect().left === edge && child1.getBoundingClientRect().right === viewport - (edge - gutter);

              // resize window
              newWindow.style.width = slideWidth * 2 + 100 + 'px';
              _context7.next = 12;
              return wait(1000);

            case 12:
              if (assertionEdgePadding) {
                assertionEdgePadding = child0.getBoundingClientRect().left === 0;
              }
              assertionControlsNav = getComputedStyle(controls, null).display === 'none' && getComputedStyle(nav, null).display === 'none';

              // resize window
              newWindow.style.width = slideWidth + 100 + 'px';
              _context7.next = 17;
              return wait(1000);

            case 17:
              if (assertionEdgePadding) {
                viewport = wrapper.clientWidth, edge = (viewport - fixedWidth) / 2;

                assertionEdgePadding = child0.getBoundingClientRect().left === edge && child0.getBoundingClientRect().right === viewport - (edge - gutter);
              }
              if (assertionControlsNav) {
                assertionControlsNav = getComputedStyle(controls, null).display !== 'none' && getComputedStyle(nav, null).display !== 'none';
              }

              // resize window
              newWindow.style.width = fixedWidth - 20 + 'px';
              _context7.next = 22;
              return wait(1000);

            case 22:
              if (assertionEdgePadding) {
                assertionEdgePadding = child0.getBoundingClientRect().left === 0;
              }

              updateTest(testEdgePaddingT, assertionEdgePadding);
              updateTest(testControlsNavT, assertionControlsNav);
              updateTest(testControlsClickT, assertionControlsClick);
              _context7.next = 33;
              break;

            case 28:
              _context7.prev = 28;
              _context7.t0 = _context7['catch'](0);

              updateTest(testEdgePaddingT, assertionEdgePadding);
              updateTest(testControlsNavT, assertionControlsNav);
              updateTest(testControlsClickT, assertionControlsClick);

            case 33:
              _context7.prev = 33;

              document.body.removeChild(newWindow);
              return _context7.finish(33);

            case 36:
            case 'end':
              return _context7.stop();
          }
        }
      }, _callee7, this, [[0, 28, 33, 36]]);
    }));

    return function responsive6Tests() {
      return _ref7.apply(this, arguments);
    };
  }();

  var id = 'responsive6',
      opt = options[id],
      fixedWidth = opt.fixedWidth,
      gutter = opt.gutter,
      slideWidth = fixedWidth + gutter;

  addTitle(id + ': fixedWidth width few items');

  var testEdgePaddingT = addTest('edgePadding toggle'),
      testControlsNavT = addTest('controls, nav toggle'),
      testControlsClickT = addTest('controls click after resizing'),
      newWindow = document.createElement('iframe');

  newWindow.setAttribute('frameBorder', '0');
  newWindow.style.cssText = 'width: ' + (slideWidth + 100) + 'px; height: 1000px; border-width: 0; overflow: hidden;';
  newWindow.src = id + '.html';

  if (newWindow.addEventListener) {
    newWindow.addEventListener('load', responsive6Tests, false);
  } else if (newWindow.readyState) {
    newWindow.onreadystatechange = function () {
      if (newWindow.readyState === 'complete') {
        responsive6Tests();
      }
    };
  }

  document.body.appendChild(newWindow);
}

function testMouseDrag() {
  var id = 'mouse-drag',
      slider = sliders[id],
      info = slider.getInfo(),
      container = info.container;

  addTitle(id);
  var test = addTest('Mouse drag');
  updateTest(test, '-notsure');
}

function testGutter() {
  var id = 'gutter',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);
  runTest('Slide: gutter', function () {
    var slideItems = info.slideItems,
        cloneCount = info.cloneCount,
        firstRect = slideItems[cloneCount].getBoundingClientRect(),
        secondRect = slideItems[cloneCount + 1].getBoundingClientRect();
    // There is no "gap" between the two slides
    // because the gap is made by padding
    return compare2Nums(firstRect.right, secondRect.left);
  });
}

function testEdgePadding() {
  var id = 'edgePadding',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);
  runTest('Slide: position', function () {
    return checkPositionEdgePadding(id, 0);
  });
}

function testEdgePaddingGutter() {
  var id = 'edgePadding-gutter',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);
  runTest('Slide: position', function () {
    return checkPositionEdgePadding(id);
  });
}

function testFewitems() {
  var id = 'few-items',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);
  runTest('Slide: count, controls: hidden, nav: hidden', function () {
    return info.container.parentNode.style.margin === '0px' && info.controlsContainer.hasAttribute('hidden') && info.navContainer.hasAttribute('hidden');
  });
}

function testSlideByPage() {
  var id = 'slide-by-page',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);
  var controlsClick = addTest('Controls: click');
  checkControlsClick(controlsClick, id, 11);
}

function testArrowKeys() {
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
}

function testLazyload() {
  var id = 'lazyload',
      slider = sliders[id],
      info = slider.getInfo(),
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

  runTest('Slide: init', function () {
    var imgFirst = slideItems[first].querySelector('img'),
        imgLast = slideItems[last].querySelector('img'),
        imgPrev = slideItems[first - 1].querySelector('img'),
        imgNext = slideItems[last + 1].querySelector('img');

    return imgFirst.getAttribute('src') === imgFirst.getAttribute('data-src') && imgLast.getAttribute('src') === imgLast.getAttribute('data-src') && imgPrev.getAttribute('src') !== imgPrev.getAttribute('data-src') && imgNext.getAttribute('src') !== imgNext.getAttribute('data-src') && containsClasses(imgFirst, 'loaded') && containsClasses(imgLast, 'loaded') && !containsClasses(imgPrev, 'loaded') && !containsClasses(imgNext, 'loaded');
  });

  var test = addTest('Controls: click'),
      assertion;

  info.nextButton.click();
  for (var i = last + 1; i < last + 1 + slideBy; i++) {
    if (assertion === undefined || assertion !== false) {
      var img = slideItems[i].querySelector('img');
      assertion = img.getAttribute('src') === img.getAttribute('data-src') && containsClasses(img, 'loaded');
    }
  }
  updateTest(test, assertion);
}

function testAutoHeight() {
  var id = 'autoHeight',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);

  var test1 = addTest('Slide: init'),
      test2 = addTest('Slide: click');

  imagesLoaded(info.container, _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12() {
    var assertion, wrapper, slideItems, nextButton;
    return regeneratorRuntime.wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            wrapper = info.container.parentNode, slideItems = info.slideItems, nextButton = info.nextButton;


            assertion = containsClasses(wrapper, ['tns-ah']) && compare2Nums(wrapper.clientHeight, slideItems[info.index].clientHeight);

            updateTest(test1, assertion);

            assertion = null;

            nextButton.click();
            _context12.next = 7;
            return wait(500);

          case 7:
            assertion = compare2Nums(wrapper.clientHeight, slideItems[slider.getInfo().index].clientHeight);

            nextButton.click();
            _context12.next = 11;
            return wait(500);

          case 11:
            if (assertion || assertion === null) {
              assertion = compare2Nums(wrapper.clientHeight, slideItems[slider.getInfo().index].clientHeight);
            }
            updateTest(test2, assertion);

          case 13:
          case 'end':
            return _context12.stop();
        }
      }
    }, _callee12, this);
  })));
}

function testNested() {
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
  runTest('Slides: position', function () {
    return checkPositionEdgePadding(id);
  });
  var test = addTest('Controls: click');

  addTitle(_id);
  runTest('Slides: position', function () {
    return checkPositionEdgePadding(_id);
  });

  var _test = addTest('Controls: click');

  nextButton.click();
  assertion = slider.getInfo().index === index + slideBy && _slider.getInfo().index === _index;
  updateTest(test, assertion);

  prevButton.click();
  _nextButton.click();
  _assertion = _slider.getInfo().index === _index + _slideBy && slider.getInfo().index === index;
  updateTest(_test, _assertion);
}

function wait(ms) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve();
    }, ms);
  });
}

function addTitle(str) {
  var title = doc.createElement('div');
  title.className = 'title';
  title.textContent = str;
  resultsDiv.appendChild(title);
}

function addTest(str, postfix) {
  var test = doc.createElement('div');
  if (!postfix) {
    postfix = '-running';
  }
  test.className = 'item' + postfix;
  test.textContent = str;
  resultsDiv.appendChild(test);
  return test;
}

function updateTest(test, assertion) {
  switch (assertion) {
    case true:
      test.className = 'item-success';
      break;
    case false:
      test.className = 'item-fail';
      break;
    default:
      test.className = 'item-notsure';
  }
}

function runTest(str, fn) {
  var test = addTest(str);
  test.className = fn() ? 'item-success' : 'item-fail';
}

function containsClasses(el, arr) {
  var len = arr.length,
      classes = el.className,
      assertion = true;

  for (var i = 0; i < len; i++) {
    if (classes.indexOf(arr[i]) < 0) {
      assertion = false;
    }
  }

  return assertion;
}

function compare2Nums(a, b) {
  return Math.abs(a - b) <= 2;
}

function getAbsIndex(current, clicks, info) {
  var cc = info.cloneCount,
      sc = info.slideCount,
      sb = info.slideBy,
      i = current + sb * clicks + sc * multiplyer;

  while (i < cc) {
    i += sc;
  }
  return (i - cc) % sc;
}

function checkSlidesAttrs(id) {
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
      checkLastItem = options[id]['axis'] === 'vertical' ? true : compare2Nums(slideItems[slideItems.length - 1].getBoundingClientRect().top, info.container.parentNode.getBoundingClientRect().top),
      mul = options[id].loop !== false ? 2 : 1;

  return slideItems.length === slideCount + cloneCount * mul && containsClasses(firstVisible, ['tns-item']) && firstVisible.id === id + '-item' + 0 && firstVisible.getAttribute('aria-hidden') === 'false' && !firstVisible.hasAttribute('tabindex') && firstVisiblePrev.id === '' && firstVisiblePrev.getAttribute('aria-hidden') === 'true' && firstVisiblePrev.getAttribute('tabindex') === '-1' && lastVisible.id === id + '-item' + (items - 1) && lastVisible.getAttribute('aria-hidden') === 'false' && !lastVisible.hasAttribute('tabindex') && lastVisibleNext.getAttribute('aria-hidden') === 'true' && lastVisibleNext.getAttribute('tabindex') === '-1' && compare2Nums(firstVisible.clientWidth, windowWidth / items) && checkLastItem;
}

function checkControlsAttrs(id) {
  var info = sliders[id].getInfo(),
      controlsContainer = info.controlsContainer,
      prevButton = info.prevButton,
      nextButton = info.nextButton,
      checkClass = options[id]['controlsContainer'] ? true : containsClasses(controlsContainer, 'tns-controls');
  return checkClass && controlsContainer.getAttribute('aria-label') === 'Carousel Navigation' && controlsContainer.getAttribute(tabindex) === '0' && prevButton.getAttribute(tabindex) === '-1' && prevButton.getAttribute('data-controls') === 'prev' && prevButton.getAttribute('aria-controls') === id && nextButton.getAttribute(tabindex) === '-1' && nextButton.getAttribute('data-controls') === 'next' && nextButton.getAttribute('aria-controls') === id;
}

function checkPositionEdgePadding(id, vertical) {
  var opt = options[id],
      info = sliders[id].getInfo(),
      padding = opt.edgePadding ? opt.edgePadding : 0,
      gap = opt.gutter ? opt.gutter : 0,
      vertical = vertical || false,
      slideItems = info.slideItems,
      cloneCount = info.cloneCount,
      wrapper = info.container.parentNode,
      first = slideItems[cloneCount],
      last = slideItems[cloneCount + info.items - 1],
      edge1 = vertical ? 'top' : 'left',
      edge2 = vertical ? 'bottom' : 'right',
      gutterAdjust = vertical ? 0 : padding ? gap : 0;

  if (!vertical) {
    wrapper = wrapper.parentNode;
  }
  var wrapperRect = wrapper.getBoundingClientRect();

  return compare2Nums(first.getBoundingClientRect()[edge1] - (padding + gap), wrapperRect[edge1]) && compare2Nums(last.getBoundingClientRect()[edge2] - gutterAdjust, wrapperRect[edge2] - (padding + gap));
}

initFns = {
  // 'base': testBase,
  // 'few-items': testFewitems,
  // 'mouse-drag': testMouseDrag,
  // 'gutter': testGutter,
  // 'edgePadding': testEdgePadding,
  // 'edgePadding-gutter': testEdgePaddingGutter,
  // 'non-loop': testNonLoop,
  // 'rewind': testRewind,
  // 'slide-by-page': testSlideByPage,
  // 'fixedWidth': testFixedWidth,
  // 'fixedWidth-gutter': testFixedWidthGutter,
  // 'fixedWidth-edgePadding': testFixedWidthEdgePadding,
  // 'fixedWidth-edgePadding-gutter': testFixedWidthEdgePaddingGutter,
  'responsive1': testResponsive1
  // 'responsive2': testResponsive2,
  // 'responsive3': testResponsive3,
  // 'responsive4': testResponsive4,
  // 'responsive5': testResponsive5,
  // 'responsive6': testResponsive6,
  // 'arrowKeys': testArrowKeys,
  // 'autoplay': testAutoplay,
  // 'vertical': testVertical,
  // 'vertical-gutter': testVerticalGutter,
  // 'vertical-edgePadding': testVerticalEdgePadding,
  // 'vertical-edgePadding-gutter': testVerticalEdgePaddingGutter,
  // 'animation1': testAnimation1,
  // 'animation2': testAnimation2,
  // 'lazyload': testLazyload,
  // 'customize': testCustomize,
  // 'autoHeight': testAutoHeight,
  // 'nested': testNested,
};
