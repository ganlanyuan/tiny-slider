/**
  * tiny-slider
  * 
  * @version 0.3.1
  * @author William Lin
  * @license The MIT License (MIT)
  * @github https://github.com/ganlanyuan/tiny-slider/
  * 
  */

var tinySlider = (function () {
  'use strict';

  // get supported property
  var getTD = gn.getSupportedProp(['transitionDuration', 'WebkitTransitionDuration', 'MozTransitionDuration', 'OTransitionDuration']),
      getTransform = gn.getSupportedProp(['transform', 'WebkitTransform', 'MozTransform', 'OTransform']);

  function core (options) {
    options = gn.extend({
      container: '.slider',
      items: 1,
      fixedWidth: false,
      maxContainerWidth: false,
      slideByPage: false,
      nav: true,
      navText: ['prev', 'next'],
      navContainer: false,
      dots: true,
      dotsContainer: false,
      arrowKeys: false,
      speed: 250,
      autoplay: false,
      autoplayTimeout: 5000,
      autoplayDirection: 'forward',
      loop: true,
      responsive: false,
      lazyload: false,
      touch: true,
    }, options || {});

    // === define and set variables ===
    var slideContainer = options.container,
        slideItems = slideContainer.children,
        slideCount = slideItems.length,
        slideCountUpdated = slideItems.length,
        fixedWidth = options.fixedWidth,
        nav = options.nav,
        navText = options.navText,
        navContainer = (!options.navContainer) ? false : options.navContainer,
        dots = options.dots,
        dotsContainer = (!options.dotsContainer) ? false : options.dotsContainer,
        arrowKeys = options.arrowKeys,
        speed = (!getTD) ? 0 : options.speed,
        autoplay = options.autoplay,
        autoplayTimeout = options.autoplayTimeout,
        autoplayDirection = (options.autoplayDirection === 'forward') ? 1 : -1,
        loop = (fixedWidth && !options.maxContainerWidth) ? false : options.loop,
        slideByPage = options.slideByPage,
        lazyload = options.lazyload,
        touch = options.touch,

        slideWidth,
        itemsMax,
        items,
        prevButton,
        nextButton,
        allDots,
        dotsCount,
        dotsCountVisible,
        index = 0,
        animating = false,
        dotClicked = -1;

    if (touch) {
      var startX = 0,
          startY = 0,
          translateX = 0,
          distX = 0,
          distY = 0,
          run = false,
          slideEventAdded = false;
    }

    // get items, itemsMax, slideWidth, dotsCountVisible
    var responsive = (fixedWidth) ? false : options.responsive,
        bpKeys = getMapKeys(responsive),
        bpVals = getMapValues(responsive, bpKeys);

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

          return Math.min(slideCount, itemsTem);
        };
      } else {
        return function () {
          return Math.min(slideCount, Math.floor(slideContainer.parentNode.offsetWidth / fixedWidth));
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
        return Math.min(slideCount, itemsMaxTem);
      } else {
        return itemsMaxTem;
      }
    };

    var getSlideWidth = (function () {
      if (fixedWidth) {
        return function () { return fixedWidth; };
      } else {
        return function () { return slideContainer.parentNode.offsetWidth / items; };
      }
    })();

    var getDotsCount = (function () {
      if (dotsContainer) {
        return function () { return slideCount; };
      } else {
        return function () { return Math.ceil(slideCount / items); };
      }
    })();

    items = getItems();
    itemsMax = getItemsMax();
    slideWidth = getSlideWidth();
    dotsCountVisible = getDotsCount();

    // === Public functions ===
    // update layout:
    // update slide container width, margin-left
    // update slides' width
    function updateLayout() {
      slideContainer.style.width = slideWidth * slideCountUpdated + 'px';
      if (loop) {
        slideContainer.style.marginLeft = - (itemsMax * slideWidth) + 'px';
      }
      for (var b = slideCountUpdated; b--;) {
        slideItems[b].style.width = slideWidth + 'px';
      }
    }

    function setTransitionDuration(indexGap) {
      if (!getTD) { return; }
      slideContainer.style[getTD] = (speed * indexGap / 1000) + 's';
      animating = true;
    }

    // set snapInterval (for IE10)
    function setSnapInterval() {
      if (!navigator.msMaxTouchPoints) { return; }
      slideContainer.parentNode.style.msScrollSnapPointsX = 'snapInterval(0%, ' + slideWidth + ')';
    }

    // slide active
    // 1. add class '.tiny-visible' to visible slides
    // 2. add class '.tiny-current' to the first visible slide
    // 3. remove classes '.tiny-visible' and '.tiny-current' from other slides
    function slideActive() {
      var current = (loop) ? index + itemsMax : index;

      for (var i = slideCountUpdated; i--;) {
        if (i < current || i >= current + items) {
          if (slideItems[i].classList.contains('tiny-visible')) {
            slideItems[i].classList.remove('tiny-current', 'tiny-visible');
          }
        } else if (i === current) {
          slideItems[i].classList.add('tiny-current', 'tiny-visible');
        } else {
          if (!slideItems[i].classList.contains('tiny-visible')) {
            slideItems[i].classList.remove('tiny-current');
            slideItems[i].classList.add('tiny-visible');
          }
        }
      }
    }

    // non-loop:
    // add class 'disabled' to nav 
    // when reach the first/last slide
    function disableNav() {
      if (loop) { return; }

      if (slideCount <= items) {
        if (index !== 0) {
          index = 0;
          translate();
        }
        if (!prevButton.classList.contains('disabled')) {
          prevButton.classList.add('disabled');
        }
        if (!nextButton.classList.contains('disabled')) {
          nextButton.classList.add('disabled');
        }
      } else {
        if (index === 0) {
          prevButton.classList.add('disabled');
        } else {
          prevButton.classList.remove('disabled');
        }
        if (index === slideCount - items) {
          nextButton.classList.add('disabled');
        } else {
          nextButton.classList.remove('disabled');
        }
      }
    }

    // show or hide extra dots.
    // doesn't work on customized dots.
    function displayDots() {
      if (!dots || dotsContainer) { return; }

      for (var i = dotsCount; i--;) {
        var dotTem = allDots[i];

        if (i < dotsCountVisible) {
          if (dotTem.classList.contains('tiny-hide')) {
            dotTem.classList.remove('tiny-hide');
          }
        } else {
          if (!dotTem.classList.contains('tiny-hide')) {
            dotTem.classList.add('tiny-hide');
          }
        }
      }
    }

    // add class 'tiny-active' to active dot
    // remove this class from other dots
    function dotActive() {
      if (!dots) { return; }

      var dotCurrent;

      if (dotClicked === -1) {
        var absoluteIndex = (index < 0) ? index + slideCount : (index >= slideCount) ? index - slideCount : index;
        dotCurrent = (dotsContainer) ? absoluteIndex : Math.floor(absoluteIndex / items);

        // non-loop & reach the edge
        if (!loop && !dotsContainer) {
          var re=/^-?[0-9]+$/, integer = re.test(slideCount / items);
          if(!integer && index === slideCount - items) {
            dotCurrent += 1;
          }
        }
      } else {
        dotCurrent = dotClicked;
        dotClicked = -1;
      }

      for (var i = dotsCountVisible; i--;) {
        var dotTem = allDots[i];

        if (i === dotCurrent) {
          if (!dotTem.classList.contains('tiny-active')) {
            dotTem.classList.add('tiny-active');
          }
        } else {
          if (dotTem.classList.contains('tiny-active')) {
            dotTem.classList.remove('tiny-active');
          }
        }
      }
    }

    // make transfer after click/drag:
    // 1. change 'transform' property for mordern browsers
    // 2. change 'left' property for legacy browsers
    function translate() {
      var vw = slideContainer.parentNode.offsetWidth;

      translateX = - slideWidth * index;
      if (fixedWidth && !loop) {
        translateX = Math.max( translateX, - Math.abs(slideCount * slideWidth - vw) );
      }

      if (getTransform) {
        slideContainer.style[getTransform] = 'translate3d(' + translateX + 'px, 0, 0)';
      } else {
        slideContainer.style.left = translateX + 'px';
      }
    }

    // check index after click/drag:
    // if viewport reach the left/right edge of slide container or
    // there is not enough room for next transfer,
    // transfer slide container to a new location without animation
    function fallback() {
      if (!loop) { return; }

      var reachLeftEdge = (slideByPage) ? index < (items - itemsMax) : index <= - itemsMax,
          reachRightEdge = (slideByPage) ? index > (slideCount + itemsMax - items * 2 - 1) : index >= (slideCount + itemsMax - items);

      // fix fixed-width
      if (fixedWidth && itemsMax && !slideByPage) {
        reachRightEdge = index >= (slideCount + itemsMax - items - 1);
      }

      if (reachLeftEdge) { index += slideCount; }
      if (reachRightEdge) { index -= slideCount; }

      if (getTD) { slideContainer.style[getTD] = '0s'; }
      translate();
    }

    // All actions need to be done after a transfer:
    // 1. check index
    // 2. add classes to current/visible slide
    // 3. disable nav buttons when reach the first/last slide in non-loop slider
    // 4. update dots status
    // 5. lazyload images
    function update() {
      fallback();
      slideActive();
      disableNav();
      dotActive();
      lazyLoad();

      animating = false;
    }

    function onNavClick(dir) {
      if (!animating) {
        dir = (slideByPage) ? dir * items : dir;
        var indexGap = Math.abs(dir);

        index = (loop) ? (index + dir) : Math.max(0, Math.min((index + dir), slideCount - items));

        setTransitionDuration(indexGap);
        translate();

        setTimeout(function () {
          update();
        }, speed * indexGap);
      }
    }

    function fireDotClick() {
      return function () {
        var dotIndex = gn.indexOf(allDots, this);
        onDotClick(dotIndex);
      };
    }

    function onDotClick(dotIndex) {
      if (!animating) {
        dotClicked = dotIndex;

        var indexTem, indexGap;
        indexTem = (dotsContainer) ? dotIndex : dotIndex * items;
        indexTem = (loop) ? indexTem : Math.min(indexTem, slideCount - items);
        indexGap = Math.abs(indexTem - index);
        index = indexTem;

        setTransitionDuration(indexGap);
        translate();

        setTimeout(function () { 
          update();
        }, speed * indexGap);
      }
    }

    function lazyLoad() {
      if (!gn.isInViewport(slideContainer)) { return; }

      var imgs = slideContainer.querySelectorAll('.tiny-visible .tiny-lazy');
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

        if (panDir === 'horizontal' && animating === false) { run = true; }
        if (run) {
          if (getTD) { slideContainer.style[getTD] = '0s'; }

          var min = (!loop) ? - (slideCount - items) * slideWidth : - (slideCount + itemsMax - items) * slideWidth,
              max = (!loop) ? 0 : itemsMax * slideWidth;

          if (!loop && fixedWidth) { min = - (slideCount * slideWidth - slideContainer.parentNode.offsetWidth); }

          translateX = - index * slideWidth + distX;
          translateX = Math.max(min, Math.min( translateX, max));

          if (getTransform) {
            slideContainer.style[getTransform] = 'translate3d(' + translateX + 'px, 0, 0)';
          } else {
            slideContainer.style.left = translateX + 'px';
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
              max = (!loop) ? slideCount - items : slideCount + itemsMax - items;

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
      // 3. add dots and nav if needed, set allDots, prevButton, nextButton
      // 4. clone items for loop if needed, update childrenCount
      init: function () {
        slideContainer.classList.add('tiny-content');

        // wrap slider with ".tiny-slider"
        var sliderWrapper = document.createElement('div');
        sliderWrapper.className = 'tiny-slider';
        gn.wrap(slideContainer, sliderWrapper);

        // for IE10
        if (navigator.msMaxTouchPoints) {
          sliderWrapper.classList.add('ms-touch');

          sliderWrapper.addEventListener('scroll', function () {
            if (getTD) { slideContainer.style[getTD] = '0s'; }
            slideContainer.style.transform = 'translate3d(-' + - slideContainer.scrollLeft() + 'px,0,0)';
          });
        }

        // add dots
        if (dots) {
          if (dotsContainer) {
            allDots = dotsContainer.children;
            allDots[0].classList.add('tiny-active');
          } else {
            var dotHtml = '';
            for (var i = slideCount; i--;) {
              dotHtml += '<div class="tiny-dot"></div>';
            }
            dotHtml = '<div class="tiny-dots">' + dotHtml + '</div>';
            gn.append(sliderWrapper, dotHtml);

            allDots = sliderWrapper.querySelectorAll('.tiny-dot');
          }
          dotsCount = allDots.length;
        }

        // add nav
        if (nav) {
          if (navContainer) {
            prevButton = navContainer.firstElementChild;
            nextButton = navContainer.lastElementChild;
          } else {
            gn.append(sliderWrapper, '<div class="tiny-nav"><div class="tiny-prev">' + navText[0] + '</div><div class="tiny-next">' + navText[1] + '</div></div>');

            prevButton = sliderWrapper.querySelector('.tiny-prev');
            nextButton = sliderWrapper.querySelector('.tiny-next');
          }
        }

        // clone items
        if (loop) {
          var fragmentBefore = document.createDocumentFragment(), 
              fragmentAfter = document.createDocumentFragment(); 

          for (var j = itemsMax; j--;) {
            var 
                cloneFirst = slideItems[j].cloneNode(true),
                cloneLast = slideItems[slideCount - 1 - j].cloneNode(true);

            fragmentBefore.insertBefore(cloneFirst, fragmentBefore.firstChild);
            fragmentAfter.appendChild(cloneLast);
          }

          slideContainer.appendChild(fragmentBefore);
          slideContainer.insertBefore(fragmentAfter, slideContainer.firstChild);

          slideCountUpdated = slideContainer.children.length;
          slideItems = slideContainer.children;
        }

        updateLayout();
        setSnapInterval();
        translate();
        slideActive();
        if (nav) {
          disableNav();
          nextButton.addEventListener('click', function () { onNavClick(1); });
          prevButton.addEventListener('click', function () { onNavClick(-1); });
        }

        displayDots();
        dotActive();
        if (dots) {
          for (var a = 0; a < dotsCount; a++) {
            allDots[a].addEventListener('click', fireDotClick());
          }
        }

        if (lazyload) { lazyLoad(); }

        if (arrowKeys) {
          document.addEventListener('keydown', function (e) {
            e = e || window.event;
            if (e.keyCode === 37) {
              onNavClick(-1);
            } else if (e.keyCode === 39) {
              onNavClick(1);
            }
          });
        }

        if (autoplay) {
          setInterval(function () {
            onNavClick(autoplayDirection);
          }, autoplayTimeout);
        }

        if (touch) {
          if (!slideEventAdded && slideContainer.addEventListener) {
            slideContainer.addEventListener('touchstart', onPanStart(), false);
            slideContainer.addEventListener('touchmove', onPanMove(), false);
            slideContainer.addEventListener('touchend', onPanEnd(), false);
            slideContainer.addEventListener('touchcancel', onPanEnd(), false);

            slideEventAdded = true;
          }
        }

        // on window resize
        gn.optimizedResize.add(function () { 
          items = getItems();
          slideWidth = getSlideWidth();
          dotsCountVisible = getDotsCount();

          updateLayout();
          setSnapInterval();
          translate();
          displayDots();
          disableNav();
          dotActive();
          if (lazyload) {
            lazyLoad();
          }
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
      }
    };
  }


  // === Private helper functions === //
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

  function getMapKeys (obj) {
    if (obj && typeof(obj) === 'object') {
      return Object.keys(obj);
    } else {
      return false;
    }
  }

  function getMapValues (obj, keys) {
    if (obj && typeof(obj) === 'object') {
      var values = [];
      for (var i = 0; i < keys.length; i++) {
        var pro = keys[i];
        values.push(obj[pro]);
      }
      return values;
    } else {
      return false;
    }
  }

  return core;
})();
