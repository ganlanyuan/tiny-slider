/**
  * tiny-slider
  * @version 0.3.1
  * @author William Lin
  * @license The MIT License (MIT)
  * @github https://github.com/ganlanyuan/tiny-slider/
  * 
  * DEPENDENCIES:
  * firstElementChild, lastElementChild
  * addEventListener
  * extend
  * wrap
  * append
  * 
  */
;(function (tinySliderJS) {
  window.tinySlider = tinySliderJS();
})(function () {
  'use strict';

  // *** helper functions *** //
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

  // get responsive value
  function getItem (keys, values, def) {
    var ww = document.documentElement.clientWidth;

    if (keys.length !== undefined && values !== undefined && keys.length === values.length) {
      if (ww < keys[0]) {
        return def;
      } else if (ww >= keys[keys.length - 1]) {
        return values[values.length - 1];
      } else {
        for (var i = 0; i < keys.length - 1; i++) {
          if (ww >= keys[i] && ww <= keys[i+1]) {
            return values[i];
          }
        }
      }
    } else {
      return def;
    }
  }

  // get supported property
  var getTD = gn.getSupportedProp(['transitionDuration', 'WebkitTransitionDuration', 'MozTransitionDuration', 'OTransitionDuration']),
      getTransform = gn.getSupportedProp(['transform', 'WebkitTransform', 'MozTransform', 'OTransform']);

  // *** tinySlider *** //
  // check options.container
  // if it's a NodeList, run slider for each Node
  // if it's null, return
  function tinySlider(options) {
    var containers = document.querySelectorAll(options.container);
    if (containers.length === 0) { return; }
    for (var i = containers.length; i--;) {
      var newOptions = options;
      newOptions.container = containers[i];

      var a = new TinySliderCore(newOptions);
    }
  }

  // Core function:
  // all slider functions run here
  function TinySliderCore(options) {
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
      dotContainer: false,
      arrowKeys: false,
      speed: 250,
      autoplay: false,
      autoplayTimeout: 5000,
      autoplayDirection: 'forward',
      loop: true,
      responsive: false,
      lazyload: false,
      offset: 0,
      touch: true,
    }, options || {});

    var that = this;

    var 
        slideContainer = options.container,
        slideItems = slideContainer.children,
        slideCount = slideItems.length,
        slideCountUpdated = slideItems.length,
        fixedWidth = options.fixedWidth,
        nav = options.nav,
        navText = options.navText,
        navContainer = options.navContainer,
        dots = options.dots,
        dotContainer = options.dotContainer,
        arrowKeys = options.arrowKeys,
        speed = (!getTD) ? 0 : options.speed,
        autoplay = options.autoplay,
        autoplayTimeout = options.autoplayTimeout,
        autoplayDirection = (options.autoplayDirection === 'forward') ? 1 : -1,
        loop = options.loop,
        slideByPage = options.slideByPage,
        responsive = (fixedWidth) ? false : options.responsive,
        lazyload = options.lazyload,
        touch = options.touch,

        bp = getMapKeys(responsive),
        vals = getMapValues(responsive, bp),
        itemsMax = (vals.length !== undefined) ? Math.max.apply(Math, vals) : options.items,
        items = (!fixedWidth) ? getItem(bp, vals, options.items) : Math.floor(slideContainer.parentNode.offsetWidth / fixedWidth);

    // fixed width
    if (fixedWidth && options.maxContainerWidth) {
      itemsMax = Math.ceil(options.maxContainerWidth / fixedWidth);
    } else if (fixedWidth) {
      loop = false;
    }

    // if slideCount are less than items
    itemsMax = Math.min(slideCount, itemsMax);
    items = Math.min(slideCount, items);

    var
        itemWidth,
        allDots;

    var dotsCount = (dotContainer) ? slideCount : Math.ceil(slideCount / items);
    var dotCurrent;
    
    var animating = false;
    var index = 0;
    var current;
    var prev;
    var next;

    if (lazyload) {
      var offset = options.offset;
      var viewport = {};
      var sliderRect = {};
      var inview = false;
      viewport.top = 0 - offset;
      viewport.left = 0 - offset;
    }

    if (touch) {
      var 
        startX = 0,
        startY = 0,
        translateX = 0,
        distX = 0,
        distY = 0,
        rt = 0,
        panDir = false,
        run = false,
        animating = false,
        slideEventAdded = false;

    }


    this.getAbsIndex = function () {
      if (index < 0) {
        return index + slideCount;
      } else if (index >= slideCount) {
        return index - slideCount;
      } else {
        return index;
      }
    };

    this.setTransitionDuration = function (indexGap) {
      if (!getTD) { return; }
      slideContainer.style[getTD] = (speed * indexGap / 1000) + 's';
      animating = true;
    };

    this.setDotCurrent = function () {
      dotCurrent = (dotContainer) ? this.getAbsIndex() : Math.floor(this.getAbsIndex() / items);

      // non-loop & reach the edge
      if (!loop && !dotContainer) {
        var re=/^-?[0-9]+$/, integer = re.test(slideCount / items);
        if(!integer && index === slideCount - items) {
          dotCurrent += 1;
        }
      }
    };

    // initialize:
    // 1. add .tiny-content to container
    // 2. wrap container with .tiny-slider
    // 3. add dots and nav if needed, set allDots, prev, next
    // 4. clone items for loop if needed, update childrenCount
    this.init = function () {
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
        if (dotContainer) {
          allDots = dotContainer.children;
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
      }

      // add nav
      if (nav) {
        if (navContainer) {
          prev = navContainer.firstElementChild;
          next = navContainer.lastElementChild;
        } else {
          gn.append(sliderWrapper, '<div class="tiny-nav"><div class="tiny-prev">' + navText[0] + '</div><div class="tiny-next">' + navText[1] + '</div></div>');

          prev = sliderWrapper.querySelector('.tiny-prev');
          next = sliderWrapper.querySelector('.tiny-next');
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
          fragmentAfter.insertBefore(cloneLast, fragmentAfter.firstChild);
        }

        slideContainer.appendChild(fragmentBefore);
        slideContainer.insertBefore(fragmentAfter, slideContainer.firstChild);

        slideCountUpdated = slideContainer.children.length;
        slideItems = slideContainer.children;
      }

      this.setDotCurrent();
      this.makeLayout();
      this.setSnapInterval();
      this.translate();
      this.itemActive();
      if (nav) {
        this.disableNav();
        next.addEventListener('click', function () { that.onNavClick(1); });
        prev.addEventListener('click', function () { that.onNavClick(-1); });
      }

      if (dots) {
        if (!dotContainer) {
          this.displayDots();
          this.dotActive();
        }
        for (var a = 0; a < allDots.length; a++) {
          allDots[a].addEventListener('click', this.fireDotClick());
        }
      }


      if (lazyload) {
        this.lazyLoad();
      }

      if (arrowKeys) {
        document.addEventListener('keydown', function (e) {
          e = e || window.event;
          if (e.keyCode === 37) {
            that.onNavClick(-1);
          } else if (e.keyCode === 39) {
            that.onNavClick(1);
          }
        });
      }

      if (autoplay) {
        setInterval(function () {
          that.onNavClick(autoplayDirection);
        }, autoplayTimeout);
      }

      if (touch) {
        if (!slideEventAdded && slideContainer.addEventListener) {
          slideContainer.addEventListener('touchstart', that.onPanStart(), false);
          slideContainer.addEventListener('touchmove', that.onPanMove(), false);
          slideContainer.addEventListener('touchend', that.onPanEnd(), false);
          slideContainer.addEventListener('touchcancel', that.onPanEnd(), false);

          slideEventAdded = true;
        }
      }
    };

    this.makeLayout = function () {
      itemWidth = (fixedWidth) ? fixedWidth : slideContainer.parentNode.offsetWidth / items;
      slideContainer.style.width = itemWidth * slideCountUpdated + 'px';
      for (var b = 0; b < slideCountUpdated; b++) {
        slideItems[b].style.width = itemWidth + 'px';
      }

      if (loop) {
        var marginLeft = - (itemsMax * itemWidth);
        slideContainer.style.marginLeft = marginLeft + 'px';
      }
    };

    this.setSnapInterval = function () {
      if (!navigator.msMaxTouchPoints) { return; }
      slideContainer.parentNode.style.msScrollSnapPointsX = 'snapInterval(0%, ' + itemWidth + ')';
    };

    this.itemActive = function () {
      current = (loop) ? index + itemsMax : index;
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
    };

    this.disableNav = function () {
      if (loop) { return; }
      if (index === 0) {
        prev.classList.add('disabled');
      } else {
        prev.classList.remove('disabled');
      }
      if (index === slideCount - items) {
        next.classList.add('disabled');
      } else {
        next.classList.remove('disabled');
      }
    };

    this.displayDots = function () {
      for (var i = 0; i < allDots.length; i++) {
        if (i < dotsCount) {
          allDots[i].classList.remove('tiny-hide');
        } else {
          allDots[i].classList.add('tiny-hide');
        }
      }
    };

    this.dotActive = function () {
      if (!dots) { return; }

      for (var i = 0; i < dotsCount; i++) {
        if (i === dotCurrent) {
          allDots[i].classList.add('tiny-active');
        } else {
          allDots[i].classList.remove('tiny-active');
        }
      }
    };

    this.translate = function () {
      var vw = slideContainer.parentNode.offsetWidth;

      translateX = - itemWidth * index;
      if (fixedWidth && !loop) {
        translateX = Math.max( translateX, - (slideCountUpdated * itemWidth - vw) );
      }

      if (getTransform) {
        slideContainer.style[getTransform] = 'translate3d(' + translateX + 'px, 0, 0)';
      } else {
        slideContainer.style.left = translateX + 'px';
      }
    };

    this.fallback = function () {
      if (!loop) { return; }

      var reachLeftEdge = (slideByPage) ? index < - (itemsMax - items) : index <= - itemsMax,
          reachRightEdge = (slideByPage) ? index > (slideCount + itemsMax - items * 2 - 1) : index >= (slideCount + itemsMax - items);

      // fix fixed-width
      if (fixedWidth && itemsMax && !slideByPage) {
        reachRightEdge = index >= (slideCount + itemsMax - items - 1);
      }

      if (reachLeftEdge) { index += slideCount; }
      if (reachRightEdge) { index -= slideCount; }

      if (getTD) { slideContainer.style[getTD] = '0s'; }
      this.translate();
    };

    this.update = function () {
      this.fallback();
      this.itemActive();
      this.disableNav();
      this.dotActive();
      this.lazyLoad();

      animating = false;
    };

    this.onNavClick = function (dir) {
      if (!animating) {
        var indexTem, indexGap;

        dir = (slideByPage) ? dir * items : dir;
        indexGap = Math.abs(dir);
        indexTem = index + dir;
        index = (loop) ? indexTem : Math.max(0, Math.min(indexTem, slideCount - items));

        this.setTransitionDuration(indexGap);
        this.translate();

        this.setDotCurrent();
        setTimeout(function () {
          that.update();
        }, speed * indexGap);
      }
    };

    this.fireDotClick = function () {
      return function () {
        var dotIndex;
        for (var i = 0; i < allDots.length; i++) {
          if (allDots[i] === this) { dotIndex = i; }
        }
        that.onDotClick(dotIndex);
      };
    };

    this.onDotClick = function (ind) {
      if (!animating) {
        var indexTem, indexGap;

        indexTem = (dotContainer) ? ind : ind * items;
        indexTem = (loop) ? indexTem : Math.min(indexTem, slideCount - items);
        indexGap = Math.abs(indexTem - index);
        index = indexTem;

        this.setTransitionDuration(indexGap);
        this.translate();

        dotCurrent = ind;

        setTimeout(function () { 
          that.update();
        }, speed * indexGap);
      }
    };

    this.lazyLoad = function () {
      if (!gn.isInViewport(slideContainer)) { return; }

      var imgs = slideContainer.querySelectorAll('.tiny-visible .tiny-lazy');
      if (!imgs.length === 0) { return; }
      for (var i = 0, len = imgs.length; i < len; i++) {
        if (!imgs[i].classList.contains('loaded')) {
          imgs[i].src = imgs[i].getAttribute('data-src');
          imgs[i].classList.add('loaded');
        }
      }
    };

    this.onPanStart = function () {
      return function (e) {
        var touchObj = e.changedTouches[0];
        startX = parseInt(touchObj.clientX);
        startY = parseInt(touchObj.clientY);
      };
    };

    this.onPanMove = function () {
      return function (e) {
        var touchObj = e.changedTouches[0];
        distX = parseInt(touchObj.clientX) - startX;
        distY = parseInt(touchObj.clientY) - startY;
        rt = toDegree(Math.atan2(distY, distX));
        panDir = getPanDir(rt, 15);

        if (panDir === 'horizontal' && animating === false) { run = true; }
        if (run) {
          if (getTD) { slideContainer.style[getTD] = '0s'; }

          var min = (!loop) ? - (slideCount - items) * itemWidth : - (slideCount + itemsMax - items) * itemWidth,
              max = (!loop) ? 0 : itemsMax * itemWidth;

          if (!loop && fixedWidth) { min = - (slideCount * itemWidth - slideContainer.parentNode.offsetWidth); }

          translateX = - index * itemWidth + distX;
          translateX = Math.max(min, Math.min( translateX, max));

          if (getTransform) {
            slideContainer.style[getTransform] = 'translate3d(' + translateX + 'px, 0, 0)';
          } else {
            slideContainer.style.left = translateX + 'px';
          }

          e.preventDefault();
        }
      };
    };

    this.onPanEnd = function () {
      return function (e) {
        var touchObj = e.changedTouches[0];
        distX = parseInt(touchObj.clientX) - startX;

        if (run && distX !== 0) {
          e.preventDefault();
          run = false;
          translateX = - index * itemWidth + distX;

          var indexTem,
              min = (!loop) ? 0 : -itemsMax,
              max = (!loop) ? slideCount - items : slideCount + itemsMax - items;

          indexTem = - (translateX / itemWidth);
          indexTem = (distX < 0) ? Math.ceil(indexTem) : Math.floor(indexTem);
          indexTem = Math.max(min, Math.min(indexTem, max));
          index = indexTem;

          that.setTransitionDuration(1);
          that.translate();

          that.setDotCurrent();
          setTimeout(function () {
            that.update();
          }, speed);
        }
      };
    };

    

    // on initialize
    this.init();

    // on window resize
    var updateIt;
    window.addEventListener('resize', function () {
      // update after resize done
      clearTimeout(updateIt);
      updateIt = setTimeout(function () {
        items = (fixedWidth) ? Math.floor(slideContainer.parentNode.offsetWidth / fixedWidth) : getItem(bp, vals, options.items);
        // if slideCount are less than items
        items = Math.min(slideCount, items);
        dotsCount = (dotContainer) ? slideCount : Math.ceil(slideCount / items);
        speed = (slideByPage) ? options.speed * items : options.speed;

        // container.parentNode.style.width = '';
        that.setDotCurrent();
        that.makeLayout();
        that.setSnapInterval();
        that.translate();
        if (dots && !dotContainer) {
          that.displayDots();
          that.dotActive();
        }
        if (lazyload) {
          that.lazyLoad();
        }
      }, 100);
    });

    // on window scroll
    window.addEventListener('scroll', function () {
      if (lazyload) {
        that.lazyLoad();
      }
    });
  }

  return tinySlider;
});
