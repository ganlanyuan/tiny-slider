/**
  * tiny-slider
  * @version 0.3.1
  * @author William Lin
  * @license The MIT License (MIT)
  * @github https://github.com/ganlanyuan/tiny-slider/
  */

var tinySlider = (function () {
  'use strict';

  // get supported property
  var getTD = gn.getSupportedProp(['transitionDuration', 'WebkitTransitionDuration', 'MozTransitionDuration', 'OTransitionDuration']),
      getTransform = gn.getSupportedProp(['transform', 'WebkitTransform', 'MozTransform', 'OTransform']);

  var KEY = {
      PAGEUP: 33,
      PAGEDOWN: 34,
      END: 35,
      HOME: 36,
      LEFT: 37,
      UP: 38,
      RIGHT: 39,
      DOWN: 40
  };

  function core (options) {
    options = gn.extend({
      container: document.querySelector('.slider'),
      items: 1,
      fixedWidth: false,
      maxContainerWidth: false,
      slideByPage: false,
      controls: true,
      controlsText: ['prev', 'next'],
      controlsContainer: false,
      nav: true,
      navContainer: false,
      arrowKeys: false,
      speed: 250,
      autoplay: false,
      autoplayTimeout: 5000,
      autoplayDirection: 'forward',
      autoplayText: ['start', 'stop'],
      loop: true,
      autoHeight: false,
      responsive: false,
      lazyload: false,
      touch: true,
    }, options || {});

    // === define and set variables ===
    var sliderContainer = options.container,
        sliderItems = sliderContainer.children,
        sliderCount = sliderItems.length,
        sliderCountUpdated = sliderItems.length,
        fixedWidth = options.fixedWidth,
        controls = options.controls,
        controlsText = options.controlsText,
        controlsContainer = (!options.controlsContainer) ? false : options.controlsContainer,
        nav = options.nav,
        navContainer = (!options.navContainer) ? false : options.navContainer,
        arrowKeys = options.arrowKeys,
        speed = (!getTD) ? 0 : options.speed,
        autoplay = options.autoplay,
        autoplayTimeout = options.autoplayTimeout,
        autoplayDirection = (options.autoplayDirection === 'forward') ? 1 : -1,
        autoplayText = options.autoplayText,
        loop = (fixedWidth && !options.maxContainerWidth) ? false : options.loop,
        autoHeight = options.autoHeight,
        slideByPage = options.slideByPage,
        lazyload = options.lazyload,
        touch = options.touch,

        sliderId,
        slideWidth,
        itemsMax,
        items,
        prevButton,
        nextButton,
        allDots,
        navCount,
        navCountVisible,
        index = 0,
        running = false,
        dotClicked = -1;

    if (autoplay) {
      var actionButton,
          animating = false;
    }

    if (touch) {
      var startX = 0,
          startY = 0,
          translateX = 0,
          distX = 0,
          distY = 0,
          run = false,
          slideEventAdded = false;
    }

    // get items, itemsMax, slideWidth, navCountVisible
    var responsive = (fixedWidth) ? false : options.responsive,
        bpKeys = (typeof responsive !== 'object') ? false : Object.keys(responsive),
        bpVals = getMapValues(responsive);

    var getItems = (function () {
      if (!fixedWidth) {
        return function () {
          var itemsTem;
          var ww = document.documentElement.clientWidth;

          if (bpKeys.length !== undefined && bpVals !== undefined && bpKeys.length === bpVals.length) {
            if (ww < bpKeys[0]) {
              itemsTem = options.items;
            } else if (ww >= bpKeys[bpKeys.length - 1]) {
              itemsTem = bpVals[bpVals.length - 1];
            } else {
              for (var i = 0; i < bpKeys.length - 1; i++) {
                if (ww >= bpKeys[i] && ww <= bpKeys[i+1]) {
                  itemsTem = bpVals[i];
                }
              }
            }
          } else {
            itemsTem = options.items;
          }

          return Math.max(Math.min(sliderCount, itemsTem), 1);
        };
      } else {
        return function () {
          return Math.max(Math.min(sliderCount, Math.floor(sliderContainer.parentNode.offsetWidth / fixedWidth)), 1);
        };
      }
    })();

    var getItemsMax = function () {
      var itemsMaxTem;

      if (!fixedWidth) {
        itemsMaxTem = (bpVals.length !== undefined) ? Math.max.apply(Math, bpVals) : options.items;
      } else {
        if (options.maxContainerWidth) {
          itemsMaxTem = Math.ceil(options.maxContainerWidth / fixedWidth);
        } else {
          itemsMaxTem = false;
        }
      }

      if (itemsMaxTem) {
        return Math.min(sliderCount, itemsMaxTem);
      } else {
        return itemsMaxTem;
      }
    };

    var getSlideWidth = (function () {
      if (fixedWidth) {
        return function () { return fixedWidth; };
      } else {
        return function () { return sliderContainer.parentNode.offsetWidth / items; };
      }
    })();

    var getDotsCount = (function () {
      if (options.navContainer) {
        return function () { return sliderCount; };
      } else {
        return function () { return Math.ceil(sliderCount / items); };
      }
    })();

    items = getItems();
    itemsMax = getItemsMax();
    slideWidth = getSlideWidth();
    navCountVisible = getDotsCount();

    // update layout:
    // update slide container width, margin-left
    // update slides' width
    function updateLayout() {
      sliderContainer.style.width = slideWidth * sliderCountUpdated + 'px';
      if (loop) {
        sliderContainer.style.marginLeft = - (itemsMax * slideWidth) + 'px';
      }
      for (var b = sliderCountUpdated; b--;) {
        sliderItems[b].style.width = slideWidth + 'px';
      }
    }

    // update container height
    // 1. get the max-height of the current slides
    // 2. set transitionDuration to speed
    // 3. update container height to max-height
    // 4. set transitionDuration to 0s after transition is done
    function updateContainerHeight() {
      var current = (loop) ? index + itemsMax : index, 
          heights = [],
          maxHeight;

      for (var i = sliderCountUpdated; i--;) {
        if (i >= current && i < current + items) {
          heights.push(sliderItems[i].offsetHeight);
        }
      }

      maxHeight = Math.max.apply(null, heights);
      if (getTD) { sliderContainer.style[getTD] = speed / 1000 + 's'; }
      sliderContainer.style.height = maxHeight + 'px';
      running = true;
      
      setTimeout(function () {
        if (getTD) { sliderContainer.style[getTD] = '0s'; }
        running = false;
      }, speed);
    }

    // set transition duration
    function setTransitionDuration(indexGap) {
      if (!getTD) { return; }
      sliderContainer.style[getTD] = (speed * indexGap / 1000) + 's';
      running = true;
    }

    // set snapInterval (for IE10)
    function setSnapInterval() {
      if (!navigator.msMaxTouchPoints) { return; }
      sliderContainer.parentNode.style.msScrollSnapPointsX = 'snapInterval(0%, ' + slideWidth + ')';
    }

    // active slide
    // 1. add class '.visible' to visible slides
    // 2. add class '.current' to the first visible slide
    // 3. remove classes '.visible' and '.current' from other slides
    function activeSlide() {
      var current = (loop) ? index + itemsMax : index;

      for (var i = sliderCountUpdated; i--;) {
        // set current and tabindex
        if (i === current) {
          sliderItems[i].classList.add('current');
        } else {
          if (sliderItems[i].classList.contains('current')) {
            sliderItems[i].classList.remove('current');
          }
        }

        // set visible
        if (i >= current && i < current + items) {
          if (!sliderItems[i].hasAttribute('aria-hidden') || sliderItems[i].getAttribute('aria-hidden') === 'true') {
            sliderItems[i].setAttribute('aria-hidden', 'false');
          }
        } else {
          if (!sliderItems[i].hasAttribute('aria-hidden') || sliderItems[i].getAttribute('aria-hidden') === 'false') {
            sliderItems[i].setAttribute('aria-hidden', 'true');
          }
        }
      }
    }

    // non-loop:
    // set 'disabled' to true to controls when reach the edge
    function disableControls() {
      if (loop) { return; }

      if (sliderCount <= items) {
        if (index !== 0) {
          index = 0;
          translate();
        }

        prevButton.disabled = true;
        nextButton.disabled = true;
      } else {
        if (index === 0) {
          prevButton.disabled = true;
          changeFocus(prevButton, nextButton);
        } else {
          prevButton.disabled = false;
        }

        if (index === sliderCount - items) {
          nextButton.disabled = true;
          changeFocus(nextButton, prevButton);
        } else {
          nextButton.disabled = false;
        }
      }
    }

    // show or hide extra nav.
    // doesn't work on customized nav.
    function displayNav() {
      if (!nav || options.navContainer) { return; }

      for (var i = navCount; i--;) {
        var dotTem = allDots[i];

        if (i < navCountVisible) {
          if (dotTem.hasAttribute('hidden')) {
            dotTem.removeAttribute('hidden');
          }
        } else {
          if (!dotTem.hasAttribute('hidden')) {
            dotTem.setAttribute('hidden', '');
          }
        }
      }
    }

    // add class 'active' to active dot
    // remove this class from other nav
    function activeNav() {
      if (!nav) { return; }

      var dotCurrent;

      if (dotClicked === -1) {
        var absoluteIndex = (index < 0) ? index + sliderCount : (index >= sliderCount) ? index - sliderCount : index;
        dotCurrent = (options.navContainer) ? absoluteIndex : Math.floor(absoluteIndex / items);

        // non-loop & reach the edge
        if (!loop && !options.navContainer) {
          var re=/^-?[0-9]+$/, integer = re.test(sliderCount / items);
          if(!integer && index === sliderCount - items) {
            dotCurrent += 1;
          }
        }
      } else {
        dotCurrent = dotClicked;
        dotClicked = -1;
      }

      for (var i = navCountVisible; i--;) {
        var dotTem = allDots[i];

        if (i === dotCurrent) {
          if (!dotTem.classList.contains('current')) {
            dotTem.classList.add('current');
            dotTem.removeAttribute('tabindex');
            dotTem.setAttribute('aria-selected', 'true');
          }
        } else {
          if (dotTem.classList.contains('current')) {
            dotTem.classList.remove('current');
            dotTem.setAttribute('tabindex', -1);
            dotTem.setAttribute('aria-selected', 'false');
          }
        }
      }
    }

    // make transfer after click/drag:
    // 1. change 'transform' property for mordern browsers
    // 2. change 'left' property for legacy browsers
    function translate() {
      var vw = sliderContainer.parentNode.offsetWidth;

      translateX = - slideWidth * index;
      if (fixedWidth && !loop) {
        translateX = Math.max( translateX, - Math.abs(sliderCount * slideWidth - vw) );
      }

      if (getTransform) {
        sliderContainer.style[getTransform] = 'translate3d(' + translateX + 'px, 0, 0)';
      } else {
        sliderContainer.style.left = translateX + 'px';
      }
    }

    // check index after click/drag:
    // if viewport reach the left/right edge of slide container or
    // there is not enough room for next transfer,
    // transfer slide container to a new location without animation
    function fallback() {
      if (!loop) { return; }

      var reachLeftEdge = (slideByPage) ? index < (items - itemsMax) : index <= - itemsMax,
          reachRightEdge = (slideByPage) ? index > (sliderCount + itemsMax - items * 2 - 1) : index >= (sliderCount + itemsMax - items);

      // fix fixed-width
      if (fixedWidth && itemsMax && !slideByPage) {
        reachRightEdge = index >= (sliderCount + itemsMax - items - 1);
      }

      if (reachLeftEdge) { index += sliderCount; }
      if (reachRightEdge) { index -= sliderCount; }

      if (getTD) { sliderContainer.style[getTD] = '0s'; }
      translate();
    }

    // All actions need to be done after a transfer:
    // 1. check index
    // 2. add classes to current/visible slide
    // 3. disable controls buttons when reach the first/last slide in non-loop slider
    // 4. update nav status
    // 5. lazyload images
    // 6. update container height
    function update() {
      fallback();
      activeSlide();
      disableControls();
      activeNav();
      lazyLoad();
      if (autoHeight) {
        updateContainerHeight();
      }

      running = false;
    }

    // on controls click
    function onNavClick(dir) {
      if (!running) {
        dir = (slideByPage) ? dir * items : dir;
        var indexGap = Math.abs(dir);

        index = (loop) ? (index + dir) : Math.max(0, Math.min((index + dir), sliderCount - items));

        setTransitionDuration(indexGap);
        translate();

        setTimeout(function () {
          update();
        }, speed * indexGap);
      }
    }

    // 
    function fireDotClick() {
      return function () {
        var dotIndex = gn.indexOf(allDots, this);
        onDotClick(dotIndex);
      };
    }

    // on doc click
    function onDotClick(dotIndex) {
      if (!running) {
        dotClicked = dotIndex;

        var indexTem, indexGap;
        indexTem = (options.navContainer) ? dotIndex : dotIndex * items;
        indexTem = (loop) ? indexTem : Math.min(indexTem, sliderCount - items);
        indexGap = Math.abs(indexTem - index);
        index = indexTem;

        setTransitionDuration(indexGap);
        translate();

        setTimeout(function () { 
          update();
        }, speed * indexGap);
      }
    }

    // change focus
    function changeFocus(blur, focus) {
      if (typeof blur === 'object' && typeof focus === 'object') {
        if (blur === document.activeElement) {
          blur.blur();
          focus.focus();
        }
        blur.setAttribute('tabindex', '-1');
        focus.removeAttribute('tabindex');
      }
    }

    // on key control
    function onKeyControl(e) {
      e = e || window.event;
      var code = e.keyCode,
          curElement = document.activeElement;

      if (code === KEY.LEFT || code === KEY.UP || code === KEY.HOME || code === KEY.PAGEUP) {
        if (curElement !== prevButton && prevButton.disabled !== true) {
          changeFocus(curElement, prevButton);
        }
      }
      if (code === KEY.RIGHT || code === KEY.DOWN || code === KEY.END || code === KEY.PAGEDOWN) {
        if (curElement !== 'next' && nextButton.disabled !== true) {
          changeFocus(curElement, nextButton);
        }
      }
    }

    // on key nav
    function onKeyNav(e) {
      e = e || window.event;
      var code = e.keyCode,
          curElement = document.activeElement;

      if (code === KEY.LEFT || code === KEY.PAGEUP) {
        if (curElement.getAttribute('data-slide') > 0) {
          changeFocus(curElement, curElement.previousElementSibling);
        }
      }
      if (code === KEY.UP || code === KEY.HOME) {
        if (curElement.getAttribute('data-slide') !== 0) {
          changeFocus(curElement, allDots[0]);
        }
      }
      if (code === KEY.RIGHT || code === KEY.PAGEDOWN) {
        if (curElement.getAttribute('data-slide') < navCountVisible - 1) {
          changeFocus(curElement, curElement.nextElementSibling);
        }
      }
      if (code === KEY.DOWN || code === KEY.END) {
        if (curElement.getAttribute('data-slide') < navCountVisible - 1) {
          changeFocus(curElement, allDots[navCountVisible - 1]);
        }
      }
    }

    // lazyload
    function lazyLoad() {
      if (!gn.isInViewport(sliderContainer)) { return; }

      var imgs = sliderContainer.querySelectorAll('[aria-hidden="false"] .tiny-lazy');
      if (imgs.length === 0) { return; }
      for (var i = 0, len = imgs.length; i < len; i++) {
        if (!imgs[i].classList.contains('loaded')) {
          imgs[i].src = imgs[i].getAttribute('data-src');
          imgs[i].classList.add('loaded');
        }
      }
    }

    function onPanStart() {
      return function (e) {
        var touchObj = e.changedTouches[0];
        startX = parseInt(touchObj.clientX);
        startY = parseInt(touchObj.clientY);
      };
    }

    function onPanMove() {
      return function (e) {
        var touchObj = e.changedTouches[0];
        distX = parseInt(touchObj.clientX) - startX;
        distY = parseInt(touchObj.clientY) - startY;

        var rotate = toDegree(Math.atan2(distY, distX)),
            panDir = getPanDir(rotate, 15);

        if (panDir === 'horizontal' && running === false) { run = true; }
        if (run) {
          if (getTD) { sliderContainer.style[getTD] = '0s'; }

          var min = (!loop) ? - (sliderCount - items) * slideWidth : - (sliderCount + itemsMax - items) * slideWidth,
              max = (!loop) ? 0 : itemsMax * slideWidth;

          if (!loop && fixedWidth) { min = - (sliderCount * slideWidth - sliderContainer.parentNode.offsetWidth); }

          translateX = - index * slideWidth + distX;
          translateX = Math.max(min, Math.min( translateX, max));

          if (getTransform) {
            sliderContainer.style[getTransform] = 'translate3d(' + translateX + 'px, 0, 0)';
          } else {
            sliderContainer.style.left = translateX + 'px';
          }

          e.preventDefault();
        }
      };
    }

    function onPanEnd() {
      return function (e) {
        var touchObj = e.changedTouches[0];
        distX = parseInt(touchObj.clientX) - startX;

        if (run && distX !== 0) {
          e.preventDefault();
          run = false;
          translateX = - index * slideWidth + distX;

          var indexTem,
              min = (!loop) ? 0 : -itemsMax,
              max = (!loop) ? sliderCount - items : sliderCount + itemsMax - items;

          indexTem = - (translateX / slideWidth);
          indexTem = (distX < 0) ? Math.ceil(indexTem) : Math.floor(indexTem);
          indexTem = Math.max(min, Math.min(indexTem, max));
          index = indexTem;

          setTransitionDuration(1);
          translate();

          setTimeout(function () {
            update();
          }, speed);
        }
      };
    }
    
    return {
      // initialize:
      // 1. add .tiny-content to container
      // 2. wrap container with .tiny-slider
      // 3. add nav and controls if needed, set allDots, prevButton, nextButton
      // 4. clone items for loop if needed, update childrenCount
      init: function () {
        sliderContainer.classList.add('tiny-content');
        sliderContainer.id = getSliderId();
        sliderId = sliderContainer.id;

        // wrap slider with ".tiny-slider"
        var sliderWrapper = document.createElement('div');
        sliderWrapper.className = 'tiny-slider';
        gn.wrap(sliderContainer, sliderWrapper);

        // for IE10
        if (navigator.msMaxTouchPoints) {
          sliderWrapper.classList.add('ms-touch');

          sliderWrapper.addEventListener('scroll', function () {
            if (getTD) { sliderContainer.style[getTD] = '0s'; }
            sliderContainer.style.transform = 'translate3d(-' + - sliderContainer.scrollLeft() + 'px,0,0)';
          });
        }

        // add slide id
        for (var x = 0; x < sliderCount; x++) {
          sliderItems[x].id = sliderId + 'item' + x;
        }

        // clone items
        if (loop) {
          var fragmentBefore = document.createDocumentFragment(), 
              fragmentAfter = document.createDocumentFragment(); 

          for (var j = itemsMax; j--;) {
            var cloneFirst = sliderItems[j].cloneNode(true),
                cloneLast = sliderItems[sliderCount - 1 - j].cloneNode(true);

            // remove id from cloned slides
            cloneFirst.id = '';
            cloneLast.id = '';

            fragmentBefore.insertBefore(cloneFirst, fragmentBefore.firstChild);
            fragmentAfter.appendChild(cloneLast);
          }

          sliderContainer.appendChild(fragmentBefore);
          sliderContainer.insertBefore(fragmentAfter, sliderContainer.firstChild);

          sliderCountUpdated = sliderContainer.children.length;
          sliderItems = sliderContainer.children;
        }

        // add nav
        if (nav) {
          if (!navContainer) {
            var navHtml = '';
            for (var i = 0; i < sliderCount; i++) {
              navHtml += '<button data-slide="' + i +'" tabindex="-1" aria-selected="false" aria-controls="' + sliderId + 'item' + i +'" type="button"></button>';
            }

            if (autoplay) {
              navHtml += '<button data-action="stop" type="button"><span hidden>Stop Animation</span>' + autoplayText[0] + '</button>';
            }

            navHtml = '<div class="tiny-nav" aria-label="Carousel Pagination">' + navHtml + '</div>';
            gn.append(sliderWrapper, navHtml);

            navContainer = sliderWrapper.querySelector('.tiny-nav');
          }

          allDots = navContainer.querySelectorAll('[data-slide]');
          navCount = allDots.length;

          if (!navContainer.hasAttribute('aria-label')) {
            navContainer.setAttribute('aria-label', "Carousel Pagination");
            for (var y = 0; y < navCount; y++) {
              var dot = allDots[y];
              dot.setAttribute('aria-selected', 'false');
              dot.setAttribute('aria-controls', sliderId + 'item' + y);
            }
          }
        }

        // add controls
        if (controls) {
          if (!controlsContainer) {
             // tabindex="0"
            gn.append(sliderWrapper, '<div class="tiny-controls" aria-label="Carousel Navigation"><button data-controls="prev" tabindex="-1" aria-controls="' + sliderId +'" type="button">' + controlsText[0] + '</button><button data-controls="next" aria-controls="' + sliderId +'" type="button">' + controlsText[1] + '</button></div>');

            controlsContainer = sliderWrapper.querySelector('.tiny-controls');
          }

          prevButton = controlsContainer.querySelector('[data-controls="prev"]');
          nextButton = controlsContainer.querySelector('[data-controls="next"]');

          if (!controlsContainer.hasAttribute('tabindex')) {
            // controlsContainer.setAttribute('tabindex', 0);
            controlsContainer.setAttribute('aria-label', 'Carousel Navigation');
            prevButton.setAttribute('aria-controls', sliderId);
            nextButton.setAttribute('aria-controls', sliderId);
            prevButton.setAttribute('tabindex', -1);
          }
        }

        // add auto
        if (autoplay) {
          if (!navContainer) {
            gn.append(sliderWrapper, '<div class="tiny-nav" aria-label="Carousel Pagination"><button data-action="stop" type="button"><span hidden>Stop Animation</span>' + autoplayText[0] + '</button></div>');
            navContainer = sliderWrapper.querySelector('.tiny-nav');
          }
          actionButton = navContainer.querySelector('[data-action]');
        }

        updateLayout();
        if (autoHeight) {
          updateContainerHeight();
        }
        setSnapInterval();
        translate();
        activeSlide();
        if (controls) {
          disableControls();
          prevButton.addEventListener('click', function () { onNavClick(-1); });
          nextButton.addEventListener('click', function () { onNavClick(1); });
          prevButton.addEventListener('keydown', onKeyControl, false);
          nextButton.addEventListener('keydown', onKeyControl, false);
        }

        displayNav();
        activeNav();
        if (nav) {
          for (var a = 0; a < navCount; a++) {
            allDots[a].addEventListener('click', fireDotClick(), false);
            allDots[a].addEventListener('keydown', onKeyNav, false);
          }
        }

        if (lazyload) { lazyLoad(); }

        if (arrowKeys) {
          document.addEventListener('keydown', function (e) {
            e = e || window.event;
            if (e.keyCode === KEY.LEFT) {
              onNavClick(-1);
            } else if (e.keyCode === KEY.RIGHT) {
              onNavClick(1);
            }
          });
        }

        if (autoplay) {
          var autoplayTimer;

          var startAction = function () {
            autoplayTimer = setInterval(function () {
              onNavClick(autoplayDirection);
            }, autoplayTimeout);
            actionButton.setAttribute('data-action', 'stop');
            actionButton.innerHTML = '<span hidden>Stop Animation</span>' + autoplayText[1];

            animating = true;
          };
          startAction();

          var stopAction = function () {
            clearInterval(autoplayTimer);
            actionButton.setAttribute('data-action', 'start');
            actionButton.innerHTML = '<span hidden>Stop Animation</span>' + autoplayText[0];

            animating = false;
          };

          var toggleAnimation = function () {
            if (animating) {
              stopAction();
            } else {
              startAction();
            }
          };

          var stopAnimation = function () {
            if (animating) { stopAction(); }
          };

          actionButton.addEventListener('click', toggleAnimation, false );

          if (controls) {
            prevButton.addEventListener('click', stopAnimation, false );
            nextButton.addEventListener('click', stopAnimation, false );
          }

          if (nav) {
            for (var b = 0; b < navCount; b++) {
              allDots[b].addEventListener('click', stopAnimation, false);
            }
          }
        }

        if (touch) {
          if (!slideEventAdded && sliderContainer.addEventListener) {
            sliderContainer.addEventListener('touchstart', onPanStart(), false);
            sliderContainer.addEventListener('touchmove', onPanMove(), false);
            sliderContainer.addEventListener('touchend', onPanEnd(), false);
            sliderContainer.addEventListener('touchcancel', onPanEnd(), false);

            slideEventAdded = true;
          }
        }

        // on window resize
        var resizeTimer;
        window.addEventListener('resize', function () {
          clearTimeout(resizeTimer);

          // update after resize done
          resizeTimer = setTimeout(function () {
            items = getItems();
            slideWidth = getSlideWidth();
            navCountVisible = getDotsCount();

            updateLayout();
            setSnapInterval();
            translate();
            displayNav();
            disableControls();
            activeNav();
            if (autoHeight) {
              updateContainerHeight();
            }
            if (lazyload) {
              lazyLoad();
            }
          }, 100);
        });

        // on window scroll
        var ticking = false;
        window.addEventListener('scroll', function () {
          if (!ticking) {
            window.requestAnimationFrame(function() {
              if (lazyload) { lazyLoad(); }
              ticking = false;
            });
          }
          ticking = true;
        });
      },

      // destory
      destory: function () {
        // if () {} else {}
      }
    };
  }


  // === Private helper functions === //
  function getSliderId() {
    if (window.tinySliderNumber === undefined) {
      window.tinySliderNumber = 1;
    } else {
      window.tinySliderNumber++;
    }
    return 'tinySlider' + window.tinySliderNumber;
  }

  function toDegree (angle) {
    return angle * (180 / Math.PI);
  }

  function getPanDir(angle, range) {
    if ( Math.abs(90 - Math.abs(angle)) >= (90 - range) ) {
      return 'horizontal';
    } else if ( Math.abs(90 - Math.abs(angle)) <= range ) {
      return 'vertical';
    } else {
      return false;
    }
  }

  function getMapValues (obj) {
    if (typeof(obj) === 'object') {
      var values = [],
          keys = Object.keys(obj);

      for (var i = 0, l = keys.length; i < l; i++) {
        var a = keys[i];
        values.push(obj[a]);
      }

      return values;
    } else {
      return false;
    }
  }

  return core;
})();

