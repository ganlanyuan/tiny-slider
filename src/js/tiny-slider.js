// @codekit-prepend "helper.js"

var tdProp = getSupportedProp(['transitionDuration', 'MozTransitionDuration', 'WebkitTransitionDuration']);

function tinySlider(options) {
  // make sure container is a list
  var containers = (options.container.length === undefined) ? [options.container] : options.container;

  for (var i = 0; i < containers.length; i++) {
    var newOptions = options;
    newOptions.container = containers[i];
    var a = new tinySliderCore(newOptions);
  };
}

function tinySliderCore(options) {
  options = extend({ 
    container: document.querySelector('.tiny-slider'),
    child: '.item',
    mode: 'carousel',
    items: 1,
    slideByPage: false,
    speed: 250,
    hasNav: true,
    hasDots: true,
    navText: ['prev', 'next'],
    loop: true,
    autoplay: false,
    autoplayTimeout: 5000,
    autoplayDirection: 'forward',
    index: 0,
    responsive: {
      500: 2,
      800: 3,
    },
    callback: false,
  }, options || {});

  this.container = options.container;
  this.child = options.child;
  this.children = this.container.querySelectorAll(this.child);
  this.childrenLength = this.childrenUpdatedLength = options.childrenLength = this.children.length;
  this.hasNav = options.hasNav;
  this.hasDots = options.hasDots;
  this.navText = options.navText;
  this.loop = options.loop;
  this.autoplay = options.autoplay;
  this.autoplayTimeout = options.autoplayTimeout;
  this.autoplayDirection = (options.autoplayDirection === 'forward') ? 1 : -1;
  this.slideByPage = options.slideByPage;
  this.index = options.index;
  this.responsive = options.responsive; 
  this.bp = (this.responsive && typeof(this.responsive) === 'object') ? Object.keys(this.responsive) : false;
  this.vals = (this.responsive && typeof(this.responsive) === 'object') ? getMapValues(this.responsive, this.bp) : false;
  this.itemsMax = (this.vals.length !== undefined) ? Math.max.apply(Math, this.vals) : this.items;
  this.items = getItem (this.bp, this.vals, options.items);
  this.speed = (this.slideByPage) ? options.speed * this.items : options.speed;
  this.animating = false;

  if (this.childrenLength >= this.itemsMax) {

    // on initialize
    this.init();

    var tinyFn = this;

    // on window resize
    var updateIt;
    windowResize(function () {
      clearTimeout(updateIt);
      updateIt = setTimeout(function () {
        // update after resize done
        tinyFn.items = getItem (tinyFn.bp, tinyFn.vals, options.items);
        tinyFn.speed = (tinyFn.slideByPage) ? options.speed * tinyFn.items : options.speed;
        tinyFn.updateContainer(tinyFn);
        tinyFn.updateDots(tinyFn);
      }, 100);
    });

    // on nav click
    eventListen('click', function () { tinySliderCore.prototype.onNavClick(tinyFn, 1); }, this.next);
    eventListen('click', function () { tinySliderCore.prototype.onNavClick(tinyFn, -1); }, this.prev);

    // on dot click
    for (var i = 0; i < this.dots.length; i++) {
      eventListen('click', function (e) { 
        var index;
        for (var i = 0; i < tinyFn.dots.length; i++) {
          target = (e.currentTarget) ? e.currentTarget : e.srcElement;
          if (tinyFn.dots[i] === target) { index = i; }
        }
        tinySliderCore.prototype.onDotClick(tinyFn, index); 
      }, this.dots[i]);
    };

    // autoplay
    if (this.autoplay) { 
      setInterval(function () {
        tinySliderCore.prototype.onNavClick(tinyFn, tinyFn.autoplayDirection);
      }, tinyFn.autoplayTimeout);
    }
  } else {
    throw new TypeError('items are not enough to show on 1 page');
  }
}

tinySliderCore.prototype = {
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
    if (this.hasDots) {
      var dots = div.cloneNode(true),
      dot = div.cloneNode(true);
      dots.className = 'tiny-dots';
      dot.className = 'tiny-dot';

      for (var i = this.childrenLength - 1; i >= 0; i--) {
        var dotClone = (i > 0) ? dot.cloneNode(true) : dot;
        dots.appendChild(dotClone);
      }
      wrapper.appendChild(dots);
      this.dots = dots.querySelectorAll('.tiny-dot');
      // addClass(this.dots[0], 'tiny-active');
    }

    // add nav
    if (this.hasNav) {
      var nav = div.cloneNode(true),
      prev = div.cloneNode(true),
      next = div.cloneNode(true);
      nav.className = 'tiny-nav';
      prev.className = 'tiny-prev';
      next.className = 'tiny-next';

      if (this.navText.length = 2) {
        prev.innerHTML = this.navText[0];
        next.innerHTML = this.navText[1];
      }
      nav.appendChild(prev);
      nav.appendChild(next);
      wrapper.appendChild(nav);

      this.prev = prev;
      this.next = next;
    }

    // clone items
    if (this.loop) {
      for (var i = 0; i < this.itemsMax; i++) {
        var cloneFirst = this.children[i].cloneNode(true),
            cloneLast = this.children[this.children.length - 1 - i].cloneNode(true),
            first = this.container.querySelectorAll(this.child)[0];

        this.container.appendChild(cloneFirst);
        this.container.insertBefore(cloneLast, first);
      }

      this.childrenUpdatedLength = this.container.querySelectorAll(this.child).length;
      this.children = this.container.querySelectorAll(this.child);
    } 

    // calculate width
    for (var i = 0; i < this.childrenUpdatedLength; i++) {
      this.children[i].style.width = (100 / this.childrenUpdatedLength) + '%';
    }

    this.updateContainer(this);
    this.updateDots(this);
    this.updateDotsStatus(this);
  },

  updateContainer: function (obj) {
    if (obj.loop) {
      obj.container.style.marginLeft = - (obj.itemsMax * 100 / obj.items) + '%';
    } 
    obj.container.style.width = (obj.childrenUpdatedLength * 100 / obj.items) + '%';
    obj.container.style.left = - (100 * obj.index / obj.items) + '%';
  },

  updateDots: function (obj) {
    var dotCount = Math.ceil(obj.childrenLength / obj.items),
        dots = obj.dots;
    for (var i = 0; i < dots.length; i++) {
      (i < dotCount) ? removeClass(dots[i], 'tiny-hide') : addClass(dots[i], 'tiny-hide');
    }
  },

  updateDotsStatus: function (obj) {
    var current, absIndex = obj.index, dots = obj.dots,
        dotCount = Math.ceil(obj.childrenLength / obj.items);

    if (absIndex < 0) {
      absIndex += obj.childrenLength;
    } else if (absIndex >= obj.childrenLength) {
      absIndex -= obj.childrenLength;
    }

    current = Math.floor(absIndex / obj.items);
    // non-loop & reach the end
    if (!obj.loop) {
      var re=/^-?[0-9]+$/, whole = re.test(obj.childrenLength / obj.items);
      if(!whole && obj.index === obj.childrenLength - obj.items) {
        current += 1;
      }
    }

    for (var i = 0; i < dotCount; i++) {
      (i === current) ? addClass(dots[i], 'tiny-active') : removeClass(dots[i], 'tiny-active');
    }
  },

  onNavClick: function (obj, dir) {
    if (!obj.animating) {
      if (tdProp) { 
        obj.container.style[tdProp] = (obj.speed / 1000) + 's'; 
        obj.animating = true;
      }
      if (obj.slideByPage) { dir = dir * obj.items; }

      obj.index += dir;
      if (!obj.loop) {
        obj.index = Math.max(0, Math.min(obj.index, obj.childrenLength - obj.items)); 
      }

      obj.container.style.left = - (100 * obj.index / obj.items) + '%';

      if (obj.loop) {
        setTimeout(function () { 
          tinySliderCore.prototype.fallback(obj, dir);
        }, obj.speed);
      }

      setTimeout(function () { 
        tinySliderCore.prototype.updateDotsStatus(obj);
        obj.animating = false;
      }, obj.speed);
    }
  },

  fallback: function (obj, dir) {
    if (tdProp) { obj.container.style[tdProp] = '0s'; }

    var leftEdge = (obj.slideByPage) ? obj.index < - (obj.itemsMax - obj.items) : obj.index <= - obj.itemsMax,
        rightEdge = (obj.slideByPage) ? obj.index > (obj.childrenLength + obj.itemsMax - obj.items * 2 - 1) : obj.index >= (obj.childrenLength + obj.itemsMax - obj.items);

    if (leftEdge) { obj.index += obj.childrenLength; }
    if (rightEdge) { obj.index -= obj.childrenLength; }

    obj.container.style.left = - (100 * obj.index / obj.items) + '%';
  },

  onDotClick: function (obj, index) {
    if (!obj.animating) {
      if (tdProp) {
        obj.container.style[tdProp] = (obj.speed / 1000) + 's'; 
        obj.animating = true;
      }

      obj.index = index * obj.items;
      if (!obj.loop) {
        obj.index = Math.min(obj.index, obj.childrenLength - obj.items); 
      }

      obj.container.style.left = - (100 * obj.index / obj.items) + '%';

      setTimeout(function () { 
        tinySliderCore.prototype.updateDotsStatus(obj);
        obj.animating = false;
      }, obj.speed);
    }
  },

};

tinySlider({
  container: document.querySelector('.slider'),
  slideByPage: false,
  loop: false,
});