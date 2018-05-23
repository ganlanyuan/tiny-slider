if (!Object.keys) Object.keys = function(o) {
  if (o !== Object(o))
    throw new TypeError('Object.keys called on a non-object');
  var k=[],p;
  for (p in o) if (Object.prototype.hasOwnProperty.call(o,p)) k.push(p);
  return k;
}

var resultsDiv = doc.querySelector('.test-results'),
    windowWidth = (document.documentElement || document.body.parentNode || document.body).clientWidth,
    multiplyer = 100,
    edgePadding = 50,
    gutter = 10,
    ua = navigator.userAgent,
    tabindex = (ua.indexOf('MSIE 9.0') > -1 || ua.indexOf('MSIE 8.0') > -1) ? 'tabIndex' : 'tabindex',
    canFireKeydown;

document.onkeydown = function(e) {
  e = e || window.event;
  var body = document.body;
  if (e.ctrlKey === true && e.keyCode === 192) {
    if (body.getAttribute('data-fire-keyevent') !== 'true') {
      body.setAttribute('data-fire-keyevent', 'true');
    }
  }
};

fire(document, 'keydown', {'ctrlKey': true, 'keyCode': 192});
canFireKeydown = (document.body.getAttribute('data-fire-keyevent') === 'true') ? true : false;




// ### base
async function testBase () {
  var id = 'base',
      slider = sliders[id],
      info = slider.getInfo();

  addTitle(id);

  runTest('Outer wrapper: classes', function() {
    return containsClasses(info.container.parentNode.parentNode, ['tns-outer']);
  });

  runTest('Inner wrapper: classes', function() {
    return containsClasses(info.container.parentNode, ['tns-inner', 'tns-ovh']);
  });

  runTest('Container: classes', function() {
    return containsClasses(info.container, ['base','tns-slider','tns-carousel','tns-horizontal']);
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
    var navItems = info.navItems,
        nav0 = navItems[0],
        nav1 = navItems[1];
    return nav0.getAttribute('data-nav') === '0' &&
      !nav0.hasAttribute('hidden') &&
      nav1.getAttribute('data-nav') === '1' &&
      nav1.hasAttribute('hidden');
  });

  var controlsClick = addTest('Controls: click functions'),
      navClick = addTest('Nav: click functions'),
      controlsKeydown = addTest('Controls: keydown events'),
      navKeydown = addTest('Nav: keydown events'),
      testGoto = addTest('Goto: Random numbers');

  /* ### check controls click functions
   *
   */
  checkControlsClick(controlsClick, id, 11).then(function() {
    /* ### check nav click functions
     *
     */
    return Promise.resolve().then(function() {
      var assertion,
          slideItems = info.slideItems,
          visibleNavIndexes = info.visibleNavIndexes,
          len = visibleNavIndexes.length;

      for (var i = len; i--;) {
        info.navItems[visibleNavIndexes[i]].click();
        var current = slider.getInfo().index,
            currentSlide = slideItems[current];
        if (assertion !== false) {
          assertion = 
            info.navItems[visibleNavIndexes[i]].getAttribute('aria-selected') === 'true' &&
            current%info.slideCount === visibleNavIndexes[i] &&
            compare2Nums(currentSlide.getBoundingClientRect().left, 0) &&
            currentSlide.getAttribute('aria-hidden') === 'false';
        }
      }

      updateTest(navClick, assertion);
    });
  }).then(function() {
    // browser support fire keyevents
    if (canFireKeydown) {

      /* ### check controls keydown functions
       * 
       */
      return Promise.resolve().then(function() {
        var assertion;

        // fire keydown events on left arrow
        return repeat(function() {
          fire(info.controlsContainer, 'keydown', {'keyCode': 37}); 
        }, 3).then(function() {
          return Promise.resolve().then(function() {
            var prev = info.index,
                current = slider.getInfo().index,
                absIndex = getAbsIndex(prev, -3, info),
                currentSlide = info.slideItems[current],
                wrapper = info.container.parentNode;
                
            assertion = 
              current%info.slideCount === absIndex &&
              info.navItems[absIndex].getAttribute('aria-selected') === 'true' &&
              compare2Nums(currentSlide.getBoundingClientRect().left, wrapper.getBoundingClientRect().left);
          });
        }).then(function() {
          if (assertion) {

            // fire keydown events on right arrow
            return repeat(function() { 
              fire(info.controlsContainer, 'keydown', {'keyCode': 39});
            }, 3).then(function() {
              return Promise.resolve().then(function() {
                var current = slider.getInfo().index,
                    absIndex = 0,
                    currentSlide = info.slideItems[current],
                    wrapper = info.container.parentNode;
                    
                assertion = 
                  current%info.slideCount === absIndex &&
                  info.navItems[absIndex].getAttribute('aria-selected') === 'true' &&
                  compare2Nums(currentSlide.getBoundingClientRect().left, wrapper.getBoundingClientRect().left);
              });
            });
          } else {
            return Promise.resolve();
          }
        }).then(function() {
          return Promise.resolve().then(function() {
            updateTest(controlsKeydown, assertion);
          });
        }).then(function() {

          /* ### check nav keydown functions
           * 
           */
          // reset assertion
          assertion = undefined;
          var info = slider.getInfo(),
              slideCount = info.slideCount,
              navContainer = info.navContainer,
              navItems = info.navItems,
              slideItems = info.slideItems,
              visibleNavIndexes = info.visibleNavIndexes,
              wrapperLeft = info.container.parentNode.getBoundingClientRect().left;

          return new Promise(function(resolve) {
            // focus on the 1st nav item
            navItems[visibleNavIndexes[0]].focus();
            // fire keydown event on right arrow
            // the 2nd nav item get focused
            fire(navContainer, 'keydown', {'keyCode': 39});
            resolve();
          }).then(function() {
            return new Promise(function(resolve) {
              assertion = document.activeElement === navItems[visibleNavIndexes[1]];
              resolve();
            });
          }).then(function() {
            // press "Enter"
            return new Promise(function(resolve) {
              fire(navContainer, 'keydown', {'keyCode': 13});
              resolve();
            });
          }).then(function() {
            return new Promise(function(resolve) {
              var current = slider.getInfo().index,
                  currentSlide = slideItems[current];

              if (assertion) {
                assertion = current%slideCount === visibleNavIndexes[1] &&
                  info.navItems[visibleNavIndexes[1]].getAttribute('aria-selected') === 'true' &&
                  compare2Nums(currentSlide.getBoundingClientRect().left, wrapperLeft);
              }
              resolve();
            });
          }).then(function() {
            return new Promise(function(resolve) {
              // fire keydown event on left arrow
              // the 1st nav item get focused
              fire(navContainer, 'keydown', {'keyCode': 37});
              resolve();
            });
          }).then(function() {
            return new Promise(function(resolve) {
              if (assertion) {
                assertion = document.activeElement === navItems[visibleNavIndexes[0]];
              }
              resolve();
            })
          }).then(function() {
            return new Promise(function(resolve) {
              // fire keydown event on down arrow
              // the 3nd nav item get focused
              fire(navContainer, 'keydown', {'keyCode': 40});
              resolve();
            })
          }).then(function() {
            return new Promise(function(resolve) {
              if (assertion) {
                assertion = document.activeElement === navItems[visibleNavIndexes[2]];
              }
              resolve();
            });
          }).then(function(){
            return new Promise(function(resolve) {
              // press "Space"
              fire(navContainer, 'keydown', {'keyCode': 32});
              resolve();
            });
          }).then(function() {
            return new Promise(function(resolve) {
              var current = slider.getInfo().index,
                  currentSlide = slideItems[current];

              if (assertion) {
                assertion = current%slideCount === visibleNavIndexes[2] &&
                  info.navItems[visibleNavIndexes[2]].getAttribute('aria-selected') === 'true' &&
                  compare2Nums(currentSlide.getBoundingClientRect().left, wrapperLeft);
              }
              resolve();
            });
          }).then(function() {
            return new Promise(function(resolve) {
              // fire keydown event on up arrow
              // the 1st nav item get focused
              fire(navContainer, 'keydown', {'keyCode': 38});
              resolve();
            });
          }).then(function() {
            return new Promise(function(resolve) {
              if (assertion) {
                assertion = document.activeElement === navItems[visibleNavIndexes[0]];
              }
              resolve();
            });
          }).then(function() {
            return new Promise(function(resolve) {
              // press "Enter"
              fire(navContainer, 'keydown', {'keyCode': 13});
              resolve();
            });
          }).then(function(){
            return new Promise(function(resolve) {
              var current = slider.getInfo().index,
                  currentSlide = slideItems[current];

              if (assertion) {
                assertion = current%slideCount === visibleNavIndexes[0] &&
                  info.navItems[visibleNavIndexes[0]].getAttribute('aria-selected') === 'true' &&
                  compare2Nums(currentSlide.getBoundingClientRect().left, wrapperLeft);
              }
              resolve();
            });
          }).then(function(){
            updateTest(navKeydown, assertion);
          });
        });
      });

    // browser not support fire keyevents
    // manual test needed
    } else {
      return Promise.resolve().then(function() {
        updateTest(controlsKeydown, '?');
        updateTest(navKeydown, '?');
      });
    }
  }).then(function() {
    var slideCount = info.slideCount,
        controls = document.querySelector('#base_wrapper .goto-controls'),
        input = controls.querySelector('input'),
        button = controls.querySelector('.button');

    var assertion,
        mul = 100;

    function checkGoto () {
      var number = Math.round(Math.random() * mul);
      input.value = number;
      button.click();
      while (number < 0) { number += slideCount; }
      if (assertion !== false) {
        assertion = slider.getInfo().index%slideCount === number%slideCount;
      }
    }

    repeat(checkGoto, 3).then(function() {
      mul = -100;
      return repeat(checkGoto, 3);
    }).then(function() {
      updateTest(testGoto, assertion);
    });
  });
}

function testNonLoop () {
}

function testRewind () {
}

function testFixedWidth () {
}

function testFixedWidthGutter () {
}

function testFixedWidthEdgePadding () {
}

function testFixedWidthEdgePaddingGutter () {
}

function testVertical () {
}

function testVerticalGutter () {
}

function testVerticalEdgePadding () {
}

function testVerticalEdgePaddingGutter () {
}

function testResponsive1 () {
}

function testResponsive2 () {
}

function testResponsive3() {
}

function testResponsive4 () {
}

function testResponsive5 () {
}

function testResponsive6 () {
}

function testMouseDrag () {
}

function testGutter () {
}

function testEdgePadding () {
}

function testEdgePaddingGutter () {
}

function testFewitems () {
}

function testSlideByPage () {
}

function testArrowKeys () {
}

function testAutoplay () {
}

function testAnimation1 () {
}

function testAnimation2 () {
}

function testLazyload () {
}

function testCustomize () {
}

function testAutoHeight () {
}

function testNested () {
}

function testAutoplayFn (id, el, timeout, equal) {
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

function updateTest (test, assertion) {
  switch(assertion) {
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

function compare2Nums (a, b) {
  // var gap = (ua.indexOf('MSIE 8.0') > -1) ? 2 : 1;
  return Math.abs(a - b) <= 2;
}

function getAbsIndex (current, clicks, info) {
  return (current + info.slideBy * clicks + info.slideCount * multiplyer)%info.slideCount;
}

function repeat (fn, count, timeout) {
  var promise = Promise.resolve();

  if (timeout) {
    while (count > 0) {
      promise = promise.then(function() {
        return wait(timeout);
      }).then(function() {
        return new Promise(function(resolve, reject) {
          fn();
          resolve();
        });
      });

      count--;
    }
  } else {
    while (count > 0) {
      promise = promise.then(function() {
        return new Promise(function(resolve, reject) {
          fn();
          resolve();
        });
      });

      count--;
    }
  }

  return promise;
}

function checkSlidesAttrs (id) {
  var info = sliders[id].getInfo(),
      slideItems = info.slideItems,
      index = info.index,
      items = info.items,
      slideCount = info.slideCount,
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

function checkControlsClick (test, id, count, vertical) {
  var assertion,
      slider = sliders[id],
      info = slider.getInfo(),
      container = info.container,
      wrapper = container.parentNode,
      slideCount = info.slideCount,
      navItems = info.navItems,
      slideItems = info.slideItems,
      items = info.items,
      edge1 = 'left',
      edge2 = 'right';

  if (vertical) {
    edge1 = 'top';
    edge2 = 'bottom';
  }
      
  function getAssertion (absIndex) {
    var index = sliders[id].getInfo().index,
        first = slideItems[index],
        last = slideItems[index + items - 1],
        checkLastEdge = options[id]['fixedWidth'] ? true : compare2Nums(last.getBoundingClientRect()[edge2], wrapper.getBoundingClientRect()[edge2]);
        
    // if (id === 'customize') {
    //   console.log(absIndex, index%slideCount);
    // }
    return absIndex === index%slideCount &&
      navItems[absIndex].getAttribute('aria-selected') === 'true' &&
      first.getAttribute('aria-hidden') === 'false' &&
      !first.hasAttribute(tabindex) &&
      last.getAttribute('aria-hidden') === 'false' &&
      !last.hasAttribute(tabindex) &&
      compare2Nums(first.getBoundingClientRect()[edge1], wrapper.getBoundingClientRect()[edge1]) &&
      checkLastEdge;
  }

  // click prev button n times
  var current = info.index;
  var promise = (id === 'customize') ? 
      repeat(function() { simulateClick(info.prevButton); }, count) : 
      repeat(function() { info.prevButton.click(); }, count);

  return promise.then(function() {
    return new Promise(function(resolve, reject) {
      var absIndex = getAbsIndex(current, -count, info);
      assertion = getAssertion(absIndex);
      resolve();
    });
  }).then(function() {
    if (assertion) {
      var clickNext = (id === 'customize') ? 
          repeat(function() { simulateClick(info.nextButton); }, count) : 
          repeat(function() { info.nextButton.click(); }, count);

      return clickNext.then(function() {
        return new Promise(function(resolve, reject) {
          assertion = getAssertion(0);
          resolve();
        });
      });
    } else {
      return Promise.resolve();
    }
  }).then(function() {
    return Promise.resolve().then(function() {
      updateTest(test, assertion);
    });
  });
}

function checkPositionEdgePadding (id, vertical) {
  var opt = options[id],
      info = sliders[id].getInfo();

  padding = opt.edgePadding ? opt.edgePadding : 0;
  gap = opt.gutter ? opt.gutter : 0;
  vertical = vertical || false;

  var slideItems = info.slideItems,
      cloneCount = info.cloneCount,
      wrapper = info.container.parentNode,
      first = slideItems[cloneCount],
      last = slideItems[cloneCount + info.items - 1],
      edge1 = (vertical) ? 'top' : 'left',
      edge2 = (vertical) ? 'bottom' : 'right',
      gutterAdjust = (vertical) ? 0 : (padding) ? gap : 0;

  if (!vertical) { wrapper = wrapper.parentNode; }
  var wrapperRect = wrapper.getBoundingClientRect();

  return compare2Nums(first.getBoundingClientRect()[edge1] - (padding + gap), wrapperRect[edge1]) &&
    compare2Nums(last.getBoundingClientRect()[edge2] - gutterAdjust, wrapperRect[edge2] - (padding + gap));
}

function testAutoplayFn (id, el, timeout, equal) {
  var assertion,
      current = sliders[id].getInfo().index;

  return wait(timeout).then(function() {
    return new Promise(function(resolve) {
      assertion = current === sliders[id].getInfo().index;
      assertion = (equal) ? assertion : !assertion;
      updateTest(el, assertion);
      resolve();
    });
  });
}

initFns = {
  'base': testBase,
  'few-items': testFewitems,
  'mouse-drag': testMouseDrag,
  'gutter': testGutter,
  'edgePadding': testEdgePadding,
  'edgePadding-gutter': testEdgePaddingGutter,
  'non-loop': testNonLoop,
  'rewind': testRewind,
  'slide-by-page': testSlideByPage,
  'fixedWidth': testFixedWidth,
  'fixedWidth-gutter': testFixedWidthGutter,
  'fixedWidth-edgePadding': testFixedWidthEdgePadding,
  'fixedWidth-edgePadding-gutter': testFixedWidthEdgePaddingGutter,
  'responsive1': testResponsive1,
  'responsive2': testResponsive2,
  'responsive3': testResponsive3,
  'responsive4': testResponsive4,
  'responsive5': testResponsive5,
  'responsive6': testResponsive6,
  'arrowKeys': testArrowKeys,
  'autoplay': testAutoplay,
  'vertical': testVertical,
  'vertical-gutter': testVerticalGutter,
  'vertical-edgePadding': testVerticalEdgePadding,
  'vertical-edgePadding-gutter': testVerticalEdgePaddingGutter,
  'animation1': testAnimation1,
  'animation2': testAnimation2,
  'lazyload': testLazyload,
  'customize': testCustomize,
  'autoHeight': testAutoHeight,
  'nested': testNested,
};