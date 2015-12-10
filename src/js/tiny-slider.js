// @codekit-prepend "helper.js"

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
    byPage: false,
    hasNav: true,
    hasDots: true,
    navText: ['prev', 'next'],
    loop: true,
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
  this.byPage = options.byPage;
  this.index = options.index;
  this.responsive = options.responsive; 
  this.bp = (this.responsive && typeof(this.responsive) === 'object') ? Object.keys(this.responsive) : false;
  this.vals = (this.responsive && typeof(this.responsive) === 'object') ? getMapValues(this.responsive, this.bp) : false;
  this.itemsMax = (this.vals.length !== undefined) ? Math.max.apply(Math, this.vals) : this.items;
  this.items = getItem (this.bp, this.vals, options.items);

  this.init();

  var tinyFn = this;
  windowResize(function () {
    tinyFn.items = getItem (tinyFn.bp, tinyFn.vals, options.items);
    tinyFn.updateContainer(tinyFn);
  });
  eventListen('click', function () { tinySliderCore.prototype.onNavClick(tinyFn, 1); }, this.next);
  eventListen('click', function () { tinySliderCore.prototype.onNavClick(tinyFn, -1); }, this.prev);
}

tinySliderCore.prototype = {
  init: function () {
    addClass(this.container, 'tiny-container');

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
  },

  updateContainer: function (obj) {
    if (obj.loop) {
      obj.container.style.marginLeft = - (obj.itemsMax * 100 / obj.items) + '%';
    } 
    obj.container.style.width = (obj.childrenUpdatedLength * 100 / obj.items) + '%';
  },

  onNavClick: function (obj, dir) {
    addClass(obj.container, 'tiny-animate');

    if (obj.byPage) { 
      dir = dir * obj.items;
    } else {
      obj.index += dir;

      obj.container.style.left = - (100 * obj.index / obj.items) + '%';
    }

    setTimeout(function () {
      tinySliderCore.prototype.fallback(obj, dir);
    }, 300);
  },

  fallback: function (obj, dir) {
    removeClass(obj.container, 'tiny-animate');

    if (obj.byPage) {
    } else {
      if (obj.index <= - obj.itemsMax) {
        obj.index += obj.childrenLength;
      } else if (obj.index >= obj.childrenLength + obj.itemsMax - obj.items) {
        obj.index -= obj.childrenLength;
      }

      obj.container.style.left = - (100 * obj.index / obj.items) + '%';
    }
  },

  // new: function () {
  // },
  // new2: function () {
  // }
};

tinySlider({
  container: document.querySelector('.slider'),
  byPage: false
});