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

  function panDir(angle, range) {
    if ( Math.abs(90 - Math.abs(angle)) >= (90 - range) ) {
      return 'horizontal';
    } else if ( Math.abs(90 - Math.abs(angle)) <= range ) {
      return 'vertical';
    } else {
      return false;
    }
  }

  function getMapKeys (el) {
    if (el && typeof(el) === 'object') {
      return Object.keys(el);
    } else {
      return false;
    }
  }
  function getMapValues (el, keys) {
    if (el && typeof(el) === 'object') {
      var values = [];
      for (var i = 0; i < keys.length; i++) {
        var pro = keys[i];
        values.push(el[pro]);
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
  function tinySlider(options) {
    var containers = document.querySelectorAll(options.container);
    if (containers.length === 0) { return; }
    for (var i = containers.length; i--;) {
      var newOptions = options;
      newOptions.container = containers[i];

      var a = new TinySliderCore(newOptions);
    }
  }

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

    // cl: childrenLength, cul: childrenUpdatedLength
    this.container = options.container;
    this.children = this.container.children;
    this.cl = this.cul = this.children.length;
    this.fw = options.fixedWidth;
    this.nav = options.nav;
    this.navText = options.navText;
    this.navContainer = options.navContainer;
    this.dots = options.dots;
    this.dotContainer = options.dotContainer;
    this.arrowKeys = options.arrowKeys;
    this.speed = (!getTD) ? 0 : options.speed;
    this.autoplay = options.autoplay;
    this.autoplayTimeout = options.autoplayTimeout;
    this.autoplayDirection = (options.autoplayDirection === 'forward') ? 1 : -1;
    this.loop = options.loop;
    this.slideByPage = options.slideByPage;
    this.responsive = (this.fw) ? false : options.responsive;
    this.lazyload = options.lazyload;
    this.touch = options.touch;

    this.bp = getMapKeys(this.responsive);
    this.vals = getMapValues(this.responsive, this.bp);
    this.itemsMax = (this.vals.length !== undefined) ? Math.max.apply(Math, this.vals) : options.items;
    this.items = (!this.fw) ? getItem(this.bp, this.vals, options.items) : Math.floor(this.container.parentNode.offsetWidth / this.fw);

    // fixed width
    if (this.fw && options.maxContainerWidth) {
      this.itemsMax = Math.ceil(options.maxContainerWidth / this.fw);
    } else if (this.fw) {
      this.loop = false;
    }

    // if cl are less than items
    this.itemsMax = Math.min(this.cl, this.itemsMax);
    this.items = Math.min(this.cl, this.items);
    this.dotsCount = (this.dotContainer) ? this.cl : Math.ceil(this.cl / this.items);
    
    this.animating = false;
    this.index = 0;

    if (this.lazyload) {
      this.offset = options.offset;
      this.viewport = {};
      this.sliderRect = {};
      this.viewport.top = 0 - this.offset;
      this.viewport.left = 0 - this.offset;
      this.inview = false;
    }

    if (this.touch) {
      this.startX = 0;
      this.startY = 0;
      this.translateX = 0;
      this.distX = 0;
      this.distY = 0;
      this.rt = 0;
      this.panDir = false;
      this.run = false;
      this.animating = false;
      this.slideEventAdded = false;

    }


    this.getAbsIndex = function (el) {
      if (el.index < 0) {
        return el.index + el.cl;
      } else if (el.index >= el.cl) {
        return el.index - el.cl;
      } else {
        return el.index;
      }
    };

    this.setTransitionDuration = function (el, indexGap) {
      if (!getTD) { return; }
      el.container.style[getTD] = (el.speed * indexGap / 1000) + 's';
      el.animating = true;
    };

    this.setDotCurrent = function (el) {
      el.dotCurrent = (el.dotContainer) ? el.getAbsIndex(el) : Math.floor(el.getAbsIndex(el) / el.items);

      // non-loop & reach the edge
      if (!el.loop && !el.dotContainer) {
        var re=/^-?[0-9]+$/, integer = re.test(el.cl / el.items);
        if(!integer && el.index === el.cl - el.items) {
          el.dotCurrent += 1;
        }
      }
    };

    // initialize:
    // 1. add .tiny-content to container
    // 2. wrap container with .tiny-slider
    // 3. add dots and nav if needed, set allDots, prev, next
    // 4. clone items for loop if needed, update childrenCount
    this.init = function () {
      this.container.classList.add('tiny-content');

      // wrap slider with ".tiny-slider"
      var sliderWrapper = document.createElement('div');
      sliderWrapper.className = 'tiny-slider';
      gn.wrap(this.container, sliderWrapper);

      // for IE10
      if (navigator.msMaxTouchPoints) {
        sliderWrapper.classList.add('ms-touch');

        var that = this;
        sliderWrapper.addEventListener('scroll', function () {
          if (getTD) { that.container.style[getTD] = '0s'; }
          that.container.style.transform = 'translate3d(-' + - that.container.scrollLeft() + 'px,0,0)';
        });
      }

      // add dots
      if (this.dots) {
        if (this.dotContainer) {
          this.allDots = this.dotContainer.children;
          this.allDots[0].classList.add('tiny-active');
        } else {
          var dotHtml = '';
          for (var i = this.cl; i--;) {
            dotHtml += '<div class="tiny-dot"></div>';
          }
          dotHtml = '<div class="tiny-dots">' + dotHtml + '</div>';
          gn.append(sliderWrapper, dotHtml);

          this.allDots = sliderWrapper.querySelectorAll('.tiny-dot');
        }
      }

      // add nav
      if (this.nav) {
        if (this.navContainer) {
          this.prev = this.navContainer.firstElementChild;
          this.next = this.navContainer.lastElementChild;
        } else {
          gn.append(sliderWrapper, '<div class="tiny-nav"><div class="tiny-prev">' + this.navText[0] + '</div><div class="tiny-next">' + this.navText[1] + '</div></div>');

          this.prev = sliderWrapper.querySelector('.tiny-prev');
          this.next = sliderWrapper.querySelector('.tiny-next');
        }
      }

      // clone items
      if (this.loop) {
        var fragmentBefore = document.createDocumentFragment(), 
            fragmentAfter = document.createDocumentFragment(); 

        for (var j = this.itemsMax; j--;) {
          var 
              cloneFirst = this.children[j].cloneNode(true),
              cloneLast = this.children[this.children.length - 1 - j].cloneNode(true);

          fragmentBefore.insertBefore(cloneFirst, fragmentBefore.firstChild);
          fragmentAfter.insertBefore(cloneLast, fragmentAfter.firstChild);
        }

        this.container.appendChild(fragmentBefore);
        this.container.insertBefore(fragmentAfter, this.container.firstChild);

        this.cul = this.container.children.length;
        this.children = this.container.children;
      }

      var tiny = this;
      this.setDotCurrent(this);
      this.makeLayout(this);
      this.setSnapInterval(this);
      this.translate(this);
      this.itemActive(this);
      if (this.nav) {
        this.disableNav(this);
        this.next.addEventListener('click', function () { tiny.onNavClick(tiny, 1); });
        this.prev.addEventListener('click', function () { tiny.onNavClick(tiny, -1); });
      }

      if (this.dots) {
        if (!this.dotContainer) {
          this.displayDots(this);
          this.dotActive(this);
        }
        for (var i = 0; i < this.allDots.length; i++) {
          this.allDots[i].addEventListener('click', this.fireDotClick(this));
        }
      }


      if (this.lazyload) {
        this.saveViewport(this);
        this.sliderInView(this);
        this.lazyLoad(this);
      }

      if (this.arrowKeys) {
        document.addEventListener('keydown', function (e) {
          e = e || window.event;
          if (e.keyCode === 37) {
            tiny.onNavClick(tiny, -1);
          } else if (e.keyCode === 39) {
            tiny.onNavClick(tiny, 1);
          }
        });
      }

      if (this.autoplay) {
        setInterval(function () {
          tiny.onNavClick(tiny, tiny.autoplayDirection);
        }, tiny.autoplayTimeout);
      }

      if (this.touch) {
        var panFn = this;
        if (!this.slideEventAdded && this.container.addEventListener) {
          this.container.addEventListener('touchstart', panFn.onPanStart(panFn), false);
          this.container.addEventListener('touchmove', panFn.onPanMove(panFn), false);
          this.container.addEventListener('touchend', panFn.onPanEnd(panFn), false);
          this.container.addEventListener('touchcancel', panFn.onPanEnd(panFn), false);

          this.slideEventAdded = true;
        }
      }
    };

    this.makeLayout = function (el) {
      el.itemWidth = (el.fw) ? el.fw : el.container.parentNode.offsetWidth / el.items;
      el.container.style.width = el.itemWidth * el.cul + 'px';
      for (var b = 0; b < el.cul; b++) {
        el.children[b].style.width = el.itemWidth + 'px';
      }

      if (el.loop) {
        var marginLeft = - (el.itemsMax * el.itemWidth);
        el.container.style.marginLeft = marginLeft + 'px';
      }
    };

    this.setSnapInterval = function (el) {
      if (!navigator.msMaxTouchPoints) { return; }
      el.container.parentNode.style.msScrollSnapPointsX = 'snapInterval(0%, ' + el.itemWidth + ')';
    };

    this.itemActive = function (el) {
      var current = (el.loop) ? el.index + el.itemsMax : el.index;
      for (var i = 0; i < el.cul; i++) {
        if (i === current) {
          el.children[i].classList.add('tiny-current', 'tiny-visible');
        } else if (i > current && i < current + el.items) {
          el.children[i].classList.remove('tiny-current');
          el.children[i].classList.add('tiny-visible');
        } else {
          el.children[i].classList.remove('tiny-current', 'tiny-visible');
        }
      }
    };

    this.disableNav = function (el) {
      if (el.loop) { return; }
      if (el.index === 0) {
        el.prev.classList.add('disabled');
      } else {
        el.prev.classList.remove('disabled');
      }
      if (el.index === el.cl - el.items) {
        el.next.classList.add('disabled');
      } else {
        el.next.classList.remove('disabled');
      }
    };

    this.displayDots = function (el) {
      for (var i = 0; i < el.allDots.length; i++) {
        if (i < el.dotsCount) {
          el.allDots[i].classList.remove('tiny-hide');
        } else {
          el.allDots[i].classList.add('tiny-hide');
        }
      }
    };

    this.dotActive = function (el) {
      if (!el.dots) { return; }

      for (var i = 0; i < el.dotsCount; i++) {
        if (i === el.dotCurrent) {
          el.allDots[i].classList.add('tiny-active');
        } else {
          el.allDots[i].classList.remove('tiny-active');
        }
      }
    };

    this.translate = function (el) {
      var vw = el.container.parentNode.offsetWidth, translateX;

      translateX = - el.itemWidth * el.index;
      if (el.fw && !el.loop) {
        translateX = Math.max( translateX, - (el.cul * el.itemWidth - vw) );
      }

      if (getTransform) {
        el.container.style[getTransform] = 'translate3d(' + translateX + 'px, 0, 0)';
      } else {
        el.container.style.left = translateX + 'px';
      }
    };

    this.fallback = function (el) {
      if (!el.loop) { return; }

      var reachLeftEdge = (el.slideByPage) ? el.index < - (el.itemsMax - el.items) : el.index <= - el.itemsMax,
          reachRightEdge = (el.slideByPage) ? el.index > (el.cl + el.itemsMax - el.items * 2 - 1) : el.index >= (el.cl + el.itemsMax - el.items);

      // fix fixed-width
      if (el.fw && el.itemsMax && !el.slideByPage) {
        reachRightEdge = el.index >= (el.cl + el.itemsMax - el.items - 1);
      }

      if (reachLeftEdge) { el.index += el.cl; }
      if (reachRightEdge) { el.index -= el.cl; }

      if (getTD) { el.container.style[getTD] = '0s'; }
      el.translate(el);
    };

    this.update = function (el) {
      el.fallback(el);
      el.itemActive(el);
      el.disableNav(el);
      el.dotActive(el);
      el.lazyLoad(el);

      el.animating = false;
    };

    this.onNavClick = function (el, dir) {
      if (!el.animating) {
        var index, indexGap;

        dir = (el.slideByPage) ? dir * el.items : dir;
        indexGap = Math.abs(dir);
        index = el.index + dir;
        el.index = (el.loop) ? index : Math.max(0, Math.min(index, el.cl - el.items));

        el.setTransitionDuration(el, indexGap);
        el.translate(el);

        el.setDotCurrent(el);
        setTimeout(function () {
          el.update(el);
        }, el.speed * indexGap);
      }
    };

    this.fireDotClick = function (el) {
      return function () {
        var index;
        for (var i = 0; i < el.allDots.length; i++) {
          if (el.allDots[i] === this) { index = i; }
        }
        el.onDotClick(el, index);
      };
    };

    this.onDotClick = function (el, ind) {
      if (!el.animating) {
        var index, indexGap;

        index = (el.dotContainer) ? ind : ind * el.items;
        index = (el.loop) ? index : Math.min(index, el.cl - el.items);
        indexGap = Math.abs(index - el.index);
        el.index = index;

        el.setTransitionDuration(el, indexGap);
        el.translate(el);

        el.dotCurrent = ind;
        setTimeout(function () { 
          el.update(el);
        }, el.speed * indexGap);
      }
    };

    this.saveViewport = function (el) {
      el.viewport.bottom = document.documentElement.clientHeight + el.offset;
      el.viewport.right = document.documentElement.clientWidth + el.offset;
    };

    this.sliderInView = function (el) {
      var rect = el.container.parentNode.getBoundingClientRect();
      el.sliderRect.left = rect.left;
      el.sliderRect.right = rect.right;
      el.sliderRect.top = rect.top;
      el.sliderRect.bottom = rect.bottom;

      el.inview = (rect.right > el.viewport.left && rect.bottom > el.viewport.top && rect.left < el.viewport.right && rect.top < el.viewport.bottom);
    };

    this.elementInView = function (el, viewport) {
      var rect = el.getBoundingClientRect();
      return (rect.right > viewport.left && rect.bottom > viewport.top && rect.left < viewport.right && rect.top < viewport.bottom);
    };

    this.lazyLoad = function (el) {
      if (!el.inview) { return; }

      var imgs = el.container.querySelectorAll('.tiny-lazy');
      if (!imgs) { return; }
      for (var i = 0; i < imgs.length; i++) {
        if (el.elementInView(imgs[i], el.sliderRect) && imgs[i].className.indexOf('loaded') === -1) {
          imgs[i].src = imgs[i].getAttribute('data-src');
          imgs[i].className += ' loaded';
        }
      }
    };

    this.onPanStart = function (el) {
      return function (e) {
        var touchObj = e.changedTouches[0];
        el.startX = parseInt(touchObj.clientX);
        el.startY = parseInt(touchObj.clientY);
      };
    };

    this.onPanMove = function (el) {
      return function (e) {
        var touchObj = e.changedTouches[0];
        el.distX = parseInt(touchObj.clientX) - el.startX;
        el.distY = parseInt(touchObj.clientY) - el.startY;
        el.rt = toDegree(Math.atan2(el.distY, el.distX));
        el.panDir = panDir(el.rt, 15);

        if (el.panDir === 'horizontal' && el.animating === false) { el.run = true; }
        if (el.run) {
          if (getTD) { el.container.style[getTD] = '0s'; }

          var min = (!el.loop) ? - (el.cl - el.items) * el.itemWidth : - (el.cl + el.itemsMax - el.items) * el.itemWidth,
              max = (!el.loop) ? 0 : el.itemsMax * el.itemWidth;

          if (!el.loop && el.fw) { min = - (el.cl * el.itemWidth - el.container.parentNode.offsetWidth); }

          el.translateX = - el.index * el.itemWidth + el.distX;
          el.translateX = Math.max(min, Math.min( el.translateX, max));

          if (getTransform) {
            el.container.style[getTransform] = 'translate3d(' + el.translateX + 'px, 0, 0)';
          } else {
            el.container.style.left = el.translateX + 'px';
          }

          e.preventDefault();
        }
      };
    };

    this.onPanEnd = function (el) {
      return function (e) {
        var touchObj = e.changedTouches[0];
        el.distX = parseInt(touchObj.clientX) - el.startX;

        if (el.run && el.distX !== 0) {
          e.preventDefault();
          el.run = false;
          el.translateX = - el.index * el.itemWidth + el.distX;

          var index,
              min = (!el.loop) ? 0 : -el.itemsMax,
              max = (!el.loop) ? el.cl - el.items : el.cl + el.itemsMax - el.items;

          index = - (el.translateX / el.itemWidth);
          index = (el.distX < 0) ? Math.ceil(index) : Math.floor(index);
          index = Math.max(min, Math.min(index, max));
          el.index = index;

          el.setTransitionDuration(el, 1);
          el.translate(el);

          el.setDotCurrent(el);
          setTimeout(function () {
            el.update(el);
          }, el.speed);
        }
      };
    };

    

    // on initialize
    this.init();

    // on window resize
    var tiny = this, updateIt;
    window.addEventListener('resize', function () {
      // update after resize done
      clearTimeout(updateIt);
      updateIt = setTimeout(function () {
        tiny.items = (tiny.fw) ? Math.floor(tiny.container.parentNode.offsetWidth / tiny.fw) : getItem(tiny.bp, tiny.vals, options.items);
        // if cl are less than items
        tiny.items = Math.min(tiny.cl, tiny.items);
        tiny.dotsCount = (tiny.dotContainer) ? tiny.cl : Math.ceil(tiny.cl / tiny.items);
        tiny.speed = (tiny.slideByPage) ? options.speed * tiny.items : options.speed;

        // tiny.container.parentNode.style.width = '';
        tiny.setDotCurrent(tiny);
        tiny.makeLayout(tiny);
        tiny.setSnapInterval(tiny);
        tiny.translate(tiny);
        if (tiny.dots && !tiny.dotContainer) {
          tiny.displayDots(tiny);
          tiny.dotActive(tiny);
        }
        if (tiny.lazyload) {
          tiny.saveViewport(tiny);
          tiny.sliderInView(tiny);
          tiny.lazyLoad(tiny);
        }
      }, 100);
    });

    // on window scroll
    window.addEventListener('scroll', function () {
      if (tiny.lazyload) {
        tiny.saveViewport(tiny);
        tiny.sliderInView(tiny);
        tiny.lazyLoad(tiny);
      }
    });
  }

  return tinySlider;
});
