/**
 * tiny-slider
 * @version 0.2.2
 * @author William Lin
 * @license The MIT License (MIT)
 * @github https://github.com/ganlanyuan/tiny-slider/
 **/
 ;(function (tinySliderJS) {
  window.tinySlider = tinySliderJS();
})(function () {
  'usr strict';

  // *** helper functions *** //
  if (!Function.prototype.bind) {
    Function.prototype.bind = function(oThis) {
      if (typeof this !== 'function') {
        // closest thing possible to the ECMAScript 5
        // internal IsCallable function
        throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
      }

      var aArgs   = Array.prototype.slice.call(arguments, 1),
          fToBind = this,
          fNOP    = function() {},
          fBound  = function() {
            return fToBind.apply(this instanceof fNOP
                   ? this
                   : oThis,
                   aArgs.concat(Array.prototype.slice.call(arguments)));
          };

      if (this.prototype) {
        // native functions don't have a prototype
        fNOP.prototype = this.prototype; 
      }
      fBound.prototype = new fNOP();

      return fBound;
    };
  }
  
  // extend
  function extend() {
    var obj, name, copy,
    target = arguments[0] || {},
    i = 1,
    length = arguments.length;

    for (; i < length; i++) {
      if ((obj = arguments[i]) !== null) {
        for (name in obj) {
          copy = obj[name];

          if (target === copy) {
            continue;
          } else if (copy !== undefined) {
            target[name] = copy;
          }
        }
      }
    }
    return target;
  }

  // add event listener
  function addEvent(o, t, fn) {
    o = o || window;
    var e = t+Math.round(Math.random()*99999999);
    if ( o.attachEvent ) {
      o['e'+e] = fn;
      o[e] = function(){
        o['e'+e]( window.event );
      };
      o.attachEvent( 'on'+t, o[e] );
    }else{
      o.addEventListener( t, fn, false );
    }
  }

  if (!Array.isArray) {
    Array.isArray = function(arg) {
      return Object.prototype.toString.call(arg) === '[object Array]';
    };
  }

  // handle classes
  function hasClass(el, className) {
    return (' ' + el.className + ' ').indexOf(' ' + className + ' ') !== -1;
  }

  function addClass(el, name) {
    var names = (Array.isArray(name)) ? name : [name];
    
    for (var i = 0; i < names.length; i++) {
      if (!hasClass(el, names[i])) {
        el.className = el.className + ' ' + names[i];
      }
    }
  }

  function removeClass(el, name) {
    var names = (Array.isArray(name)) ? name : [name];

    for (var i = 0; i < names.length; i++) {
      if (hasClass(el, names[i])) {
        el.className = el.className.replace(' ' + names[i], '');
      }
    }
  }

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

  // Object.keys polyfill
  if (!Object.keys) {
    Object.keys = function(o) {
      if (o !== Object(o)) { throw new TypeError('Object.keys called on a non-object'); }
      var k=[],p;
      for (p in o) {
        if (Object.prototype.hasOwnProperty.call(o,p)) { k.push(p); }
      }
      return k;
    };
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

  // get window width
  function getWindowWidth () {
    return winW = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  }

  // get responsive value
  function getItem (keys, values, def) {
    var ww = getWindowWidth();

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
  function getSupportedProp(proparray){
    var root = document.documentElement;
    for (var i=0; i<proparray.length; i++){
      if (proparray[i] in root.style){
        return proparray[i];
      }
    }
  }
  var getTD = getSupportedProp(['transitionDuration', 'WebkitTransitionDuration', 'MozTransitionDuration', 'OTransitionDuration']),
  getTransform = getSupportedProp(['transform', 'WebkitTransform', 'MozTransform', 'OTransform']);

  // *** tinySlider *** //
  function tinySlider(options) {
    var containers;

    if (!options.container) { return; }
    containers = (options.container.length === undefined) ? [options.container] : options.container;

    for (var i = 0; i < containers.length; i++) {
      var newOptions = options;
      newOptions.container = containers[i];

      var a = new TinySliderCore(newOptions);
    }
  }

  function TinySliderCore(options) {
    options = extend({
      container: document.querySelector('.slider'),
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
      // touch: true,
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
    this.dotsContainer = options.dotsContainer;
    this.arrowKeys = options.arrowKeys;
    this.speed = (!getTD) ? 0 : options.speed;
    this.autoplay = options.autoplay;
    this.autoplayTimeout = options.autoplayTimeout;
    this.autoplayDirection = (options.autoplayDirection === 'forward') ? 1 : -1;
    this.loop = options.loop;
    this.slideByPage = options.slideByPage;
    this.responsive = (this.fw) ? false : options.responsive;

    this.bp = getMapKeys(this.responsive);
    this.vals = getMapValues(this.responsive, this.bp);
    this.itemsMax = (this.vals.length !== undefined) ? Math.max.apply(Math, this.vals) : options.items;
    this.items = getItem(this.bp, this.vals, options.items);
    this.animating = false;
    this.index = 0;

    // if (options.touch) {
    //   this.viewWidth = parseInt(this.container.parentNode.offsetWidth);
    //   this.wh = window.innerHeight;
    //   this.threshold = 20;
    //   this.thresholdPx = parseInt(this.viewWidth * this.threshold / 100);
    //   this.startX = 0;
    //   this.startY = 0;
    //   this.translateX = 0;
    //   this.distX = 0;
    //   this.distY = 0;
    //   this.rt = 0;
    //   this.panDir = false;
    //   this.run = false;
    //   this.animating = false;
    //   this.slideEventAdded = false;

    //   var panFn = this;
    //   if (!this.slideEventAdded) {
    //     this.container.addEventListener('touchstart', this.onPanStart(panFn), false);
    //     this.container.addEventListener('touchmove', this.onPanMove(panFn), false);
    //     this.container.addEventListener('touchend', this.onPanEnd(panFn), false);
    //     this.container.addEventListener('touchcancel', this.onPanEnd(panFn), false);

    //     this.slideEventAdded = true;
    //   }
    // }

    // fixed width
    if (this.fw) {
      this.items = Math.floor(this.container.parentNode.offsetWidth / this.fw);
      if (options.maxContainerWidth) {
        this.itemsMax = Math.ceil(options.maxContainerWidth / this.fw);
      } else {
        this.loop = false;
      }
    }

    // if cl are less than items
    this.itemsMax = Math.min(this.cl, this.itemsMax);
    this.items = Math.min(this.cl, this.items);

    // on initialize
    this.init();

    var tiny = this;

    // on window resize
    var updateIt;
    addEvent(window, 'resize', function () {
      // update after resize done
      clearTimeout(updateIt);
      updateIt = setTimeout(function () {
        tiny.items = (tiny.fw) ? Math.floor(tiny.container.parentNode.offsetWidth / tiny.fw) : getItem(tiny.bp, tiny.vals, options.items);
        // if cl are less than items
        tiny.items = Math.min(tiny.cl, tiny.items);
        tiny.speed = (tiny.slideByPage) ? options.speed * tiny.items : options.speed;

        // tiny.container.parentNode.style.width = '';
        tiny.makeLayout(tiny);
        tiny.move(tiny);
        if (tiny.dots && !tiny.dotsContainer) {
          tiny.displayDots(tiny);
          tiny.dotsActive(tiny);
        }
      }, 100);
    });

    // on nav click
    if (this.nav) {
      addEvent(this.next, 'click', function () { tiny.onNavClick(tiny, 1); });
      addEvent(this.prev, 'click', function () { tiny.onNavClick(tiny, -1); });
    }

    // on key down
    if (this.arrowKeys) {
      addEvent(document, 'keydown', function (e) {
        e = e || window.event;
        if (e.keyCode === 37) {
          tiny.onNavClick(tiny, -1);
        } else if (e.keyCode === 39) {
          tiny.onNavClick(tiny, 1);
        }
      });
    }

    // on dot click
    if (this.dots) {
      for (var i = 0; i < this.allDots.length; i++) {
        addEvent(this.allDots[i], 'click', this.fireDotClick(this));
      }
    }

    // autoplay
    if (this.autoplay) {
      setInterval(function () {
        tiny.onNavClick(tiny, tiny.autoplayDirection);
      }, tiny.autoplayTimeout);
    }
  }

  // *** prototype *** //
  TinySliderCore.prototype = {
    init: function () {
      addClass(this.container, 'tiny-content');

      // wrap slider with ".tiny-slider"
      var parent = this.container.parentNode,
      sibling = this.container.nextSibling;

      var div = document.createElement('div'),
      wrapper = div.cloneNode(true);
      wrapper.className = 'tiny-slider';
      wrapper.appendChild(this.container);

      if (sibling) {
        parent.insertBefore(wrapper, sibling);
      } else {
        parent.appendChild(wrapper);
      }

      // add dots
      if (this.dots) {
        if (this.dotsContainer) {
          this.allDots = this.dotsContainer.children;
          addClass(this.allDots[0], 'tiny-active');
        } else {
          var dots = div.cloneNode(true), dot = div.cloneNode(true);
          dots.className = 'tiny-dots';
          dot.className = 'tiny-dot';

          for (var i = this.cl - 1; i >= 0; i--) {
            var dotClone = (i > 0) ? dot.cloneNode(true) : dot;
            dots.appendChild(dotClone);
          }
          wrapper.appendChild(dots);
          this.allDots = dots.querySelectorAll('.tiny-dot');
        }
      }

      // add nav
      if (this.nav) {
        var nav;
        if (this.navContainer) {
          nav = this.navContainer.children;
          this.prev = nav[0];
          this.next = nav[1];
        } else {
          nav = div.cloneNode(true);
          var prev = div.cloneNode(true),
          next = div.cloneNode(true);

          nav.className = 'tiny-nav';
          prev.className = 'tiny-prev';
          next.className = 'tiny-next';
          if (this.navText.length === 2) {
            prev.innerHTML = this.navText[0];
            next.innerHTML = this.navText[1];
          }

          nav.appendChild(prev);
          nav.appendChild(next);
          wrapper.appendChild(nav);

          this.prev = prev;
          this.next = next;
        }
      }

      // clone items
      if (this.loop) {
        var before = [], after = [], first = this.container.children[0];

        for (var j = 0; j < this.itemsMax; j++) {
          var cloneFirst = this.children[j].cloneNode(true),
          cloneLast = this.children[this.children.length - 1 - j].cloneNode(true);

          before.push(cloneFirst);
          after.push(cloneLast);
        }

        for (var g = 0; g < before.length; g++) {
          this.container.appendChild(before[g]);
        }
        for (var a = after.length - 1; a >= 0; a--) {
          this.container.insertBefore(after[a], first);
        }

        this.cul = this.container.children.length;
        this.children = this.container.children;
      }

      this.makeLayout(this);
      this.move(this);
      this.itemActive(this);
      if (this.dots && !this.dotsContainer) {
        this.displayDots(this);
        this.dotsActive(this);
      }
    },

    makeLayout: function (el) {
      el.itemWidth = (el.fw) ? el.fw : el.container.parentNode.offsetWidth / el.items;
      el.container.style.width = el.itemWidth * el.cul + 'px';
      // if (!el.fw) { el.container.parentNode.style.width = el.itemWidth * el.items + 'px'; }
      for (var b = 0; b < el.cul; b++) {
        el.children[b].style.width = el.itemWidth + 'px';
      }

      if (el.loop) {
        var marginLeft = - (el.itemsMax * el.itemWidth);
        el.container.style.marginLeft = marginLeft + 'px';
      }
    },

    // get fixed-width item container left
    getFCL: function (el) {
      var absIndex = el.getAbsIndex(el),
      vw = el.container.parentNode.offsetWidth;

      if ((absIndex + el.items + 1) >= el.cul) {
        return - (el.cul * el.fw - vw);
      } else {
        return - (el.fw * el.index);
      }
    },

    move: function (el) {
      var containerLeft = (el.fw) ? el.getFCL(el) : - el.itemWidth * el.index;
      if (getTransform) {
        el.container.style[getTransform] = 'translate3d(' + containerLeft + 'px, 0, 0)';
      } else {
        el.container.style.left = containerLeft + 'px';
      }
    },

    getAbsIndex: function (el) {
      var absIndex = el.index;

      if (absIndex < 0) {
        absIndex += el.cl;
      } else if (absIndex >= el.cl) {
        absIndex -= el.cl;
      }

      return absIndex;
    },

    fireDotClick: function (el) {
      return function () {
        var index;
        for (var i = 0; i < el.allDots.length; i++) {
          if (el.allDots[i] === this) { index = i; }
        }
        el.onDotClick(el, index);
      };
    },

    itemActive: function (el) {
      for (var i = 0; i < el.cul; i++) {
        removeClass(el.children[i], ['tiny-current', 'tiny-visible']);
      }
      var current = (el.loop) ? el.index + el.itemsMax : el.index;
      for (var j = current; j < (current + el.items); j++) {
        addClass(el.children[j], 'tiny-visible');
      }
      addClass(el.children[current], 'tiny-current');
    },

    addStatus: function (el, dir) {
      if (!el.slideByPage && !el.fw) {
        var current = (el.loop) ? el.index + el.itemsMax : el.index;
        if (dir === -1) {
          addClass(el.children[current], 'tiny-left-in');
          addClass(el.children[current + el.items], 'tiny-right-out');
        } else {
          addClass(el.children[current - 1], 'tiny-left-out');
          addClass(el.children[current + el.items - 1], 'tiny-right-in');
        }
      }
    },

    removeStatus: function (el) {
      if (!el.slideByPage && !el.fw) {
        for (var i = 0; i < el.cul; i++) {
          removeClass(el.children[i], ['tiny-left-in', 'tiny-left-out', 'tiny-right-in', 'tiny-right-out']);
        }
      }
    },

    displayDots: function (el) {
      var dotCount = Math.ceil(el.cl / el.items),
      dots = el.allDots;

      for (var i = 0; i < dots.length; i++) {
        if (i < dotCount) {
          removeClass(dots[i], 'tiny-hide');
        } else {
          addClass(dots[i], 'tiny-hide');
        }
      }
    },

    dotsActive: function (el) {
      var current,
      absIndex = el.getAbsIndex(el),
      dots = el.allDots,
      dotCount = (el.dotsContainer) ? el.cl : Math.ceil(el.cl / el.items);

      if (el.dotsContainer) {
        current = absIndex;
      } else {
        if (el.fw) {
          if ((absIndex + el.items + 1) >= el.cul) {
            current = dotCount - 1;
          } else {
            current = Math.floor((absIndex / el.items));
          }
        } else {
          current = Math.floor(absIndex / el.items);
        }
      }

      // non-loop & reach the end
      if (!el.loop && !el.dotsContainer) {
        var re=/^-?[0-9]+$/, whole = re.test(el.cl / el.items);
        if(!whole && el.index === el.cl - el.items) {
          current += 1;
        }
      }

      for (var i = 0; i < dotCount; i++) {
        if (i === current) {
          addClass(dots[i], 'tiny-active');
        } else {
          removeClass(dots[i], 'tiny-active');
        }
      }
    },

    onNavClick: function (el, dir) {
      if (!el.animating) {
        var prevIndex = el.index;

        if (el.slideByPage) { dir = dir * el.items; }
        el.index += dir;
        if (!el.loop) {
          el.index = Math.max(0, Math.min(el.index, el.cl - el.items));
        }

        var gap = Math.abs(el.index - prevIndex);
        if (getTD) {
          el.container.style[getTD] = (el.speed * gap / 1000) + 's';
          el.animating = true;
          el.addStatus(el, dir);
        }
        el.move(el);

        setTimeout(function () {
          if (el.loop) { el.clickFallback(el); }
          if (el.dots) { el.dotsActive(el); }
          if (getTD) { el.removeStatus(el); }
          el.itemActive(el);
          el.animating = false;
        }, el.speed * gap);
      }
    },

    clickFallback: function (el) {
      var reachLeftEdge =
      (el.slideByPage) ?
      el.index < - (el.itemsMax - el.items) :
      el.index <= - el.itemsMax,
      reachRightEdge =
      (el.slideByPage) ?
      el.index > (el.cl + el.itemsMax - el.items * 2 - 1) :
      el.index >= (el.cl + el.itemsMax - el.items);

      // fix fixed-width
      if (el.fw && el.itemsMax && !el.slideByPage) {
        reachRightEdge = el.index >= (el.cl + el.itemsMax - el.items - 1);
      }

      if (reachLeftEdge) { el.index += el.cl; }
      if (reachRightEdge) { el.index -= el.cl; }

      if (getTD) { el.container.style[getTD] = '0s'; }
      var containerLeft = - el.itemWidth * el.index;
      if (getTransform) {
        el.container.style[getTransform] = 'translate3d(' + containerLeft + 'px, 0, 0)';
      } else {
        el.container.style.left = containerLeft + 'px';
      }
    },

    onDotClick: function (el, index) {
      if (!el.animating) {
        var prevIndex = el.index;

        if (el.loop) {
          el.index = (el.dotsContainer) ? index : index * el.items;
        } else {
          if (el.dotsContainer) {
            el.index = Math.min(index, el.cl - el.items);
          } else {
            el.index = Math.min(index * el.items, el.cl - el.items);
          }
        }

        var gap = Math.abs(el.index - prevIndex);
        if (getTD) {
          el.container.style[getTD] = (el.speed * gap / 1000) + 's';
          el.animating = true;
        }
        el.move(el);

        setTimeout(function () { 
          for (var i = 0; i < el.allDots.length; i++) {
            if (i === index) {
              addClass(el.allDots[i], 'tiny-active');
            } else {
              removeClass(el.allDots[i], 'tiny-active');
            }
          }

          el.clickFallback(el);
          el.itemActive(el);
          el.animating = false;
        }, el.speed * gap);
      }
    },

    // onPan: function (deltaX) {
    //   this.translateX = - this.index * this.viewWidth + deltaX + 'px';
    //   if (getTransform) {
    //     this.container.style[getTransform] = 'translate3d(' + this.translateX + ', 0, 0)';
    //   } else {
    //     this.container.style.left = this.translateX;
    //   }
    // },

    // onPanStart: function (el) {
    //   return function (e) {
    //     var touchObj = e.changedTouches[0];
    //     el.startX = parseInt(touchObj.clientX);
    //     el.startY = parseInt(touchObj.clientY);
    //   };
    // },

    // onPanMove: function (el) {
    //   return function (e) {
    //     var touchObj = e.changedTouches[0];
    //     el.distX = parseInt(touchObj.clientX) - el.startX;
    //     el.distY = parseInt(touchObj.clientY) - el.startY;
    //     el.rt = toDegree(Math.atan2(el.distY, el.distX));
    //     el.panDir = panDir(el.rt, 15);

    //     if (el.panDir === 'horizontal' && el.animating === false) { el.run = true; }
    //     if (el.run) {
    //       if (getTD) { el.container.style[getTD] = '0s'; }
    //       el.onPan(el.distX);

    //       e.preventDefault();
    //     }
    //   };
    // },

    // onPanEnd: function (el) {
    //   return function (e) {
    //     var touchObj = e.changedTouches[0];
    //     el.distX = parseInt(touchObj.clientX) - el.startX;

    //     if (el.run && el.distX !== 0) {
    //       e.preventDefault();
    //       el.run = false;
    //       el.animating = true;
    //       if (getTD) { el.container.style[getTD] = el.speed / 1000 + 's'; }

    //       if (Math.abs(el.distX) >= el.thresholdPx) {
    //         if (el.distX > 0) {
    //           el.index -= 1;
    //         } else {
    //           el.index += 1;
    //         }
    //       }
    //       el.index = Math.max(0, Math.min(el.index, el.cl - 1));
    //       el.move(el);
          
    //       setTimeout(function () {
    //         el.animating = false;
    //       }, el.speed);
    //     }
    //   };
    // }

  };


  return tinySlider;
});