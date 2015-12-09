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

function eventListen(t, fn, o) {
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

function addClass(el, name) {
  var name = ' ' + name;
  if(el.className.indexOf(name) === -1) {
    el.className += name;
  }
}

function removeClass(el, name) {
  var name = ' ' + name;
  if(el.className.indexOf(name) !== -1) {
    el.className = el.className.replace(name, '');
  }
}


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
    callback: false,
  }, options || {});

  this.container = options.container;
  this.child = options.child;
  this.children = this.container.querySelectorAll(options.child);
  this.childrenLength = this.childrenLengthCloned = options.childrenLength = this.children.length;
  this.items = options.items;
  this.hasNav = options.hasNav;
  this.hasDots = options.hasDots;
  this.navText = options.navText;
  this.loop = options.loop;
  this.byPage = options.byPage;
  this.index = options.index;

  this.init();

  var tinyFn = this;
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

    // clone items
    if (this.loop) {
      for (var i = 0; i < this.childrenLength; i++) {
        var allItems = this.container.querySelectorAll(this.child),
            firstItemClone = allItems[i].cloneNode(true);

        this.container.appendChild(firstItemClone);
      }
      this.childrenLengthCloned = this.childrenLength * 2;
      this.children = this.container.querySelectorAll(this.child);
      this.container.style.marginLeft = - (this.childrenLength * 100 / this.items) + '%';
    } 

    // calculate width
    this.container.style.width = (this.childrenLengthCloned * 100 / this.items) + '%';
    for (var i = 0; i < this.childrenLengthCloned; i++) {
      this.children[i].style.width = (100 / this.childrenLengthCloned) + '%';
    }
  },

  onNavClick: function (obj, dir) {
    addClass(obj.container, 'tiny-animate');
    if (obj.byPage) { dir = dir * obj.items }

    obj.index += dir;
    obj.container.style.left = - (100 * obj.index / obj.items) + '%';

    if (obj.index >= (obj.childrenLength - obj.items) || obj.index <= -1) {
      setTimeout(function () {
        tinySliderCore.prototype.onUpdate(obj, dir);
      }, 300);
    }
  },

  onUpdate: function (obj, dir) {
    removeClass(obj.container, 'tiny-animate');

    if (obj.byPage) {
      for (var i = 0; i < obj.items; i++) {
        var allItems = obj.container.querySelectorAll(obj.child),
            firstItem = allItems[0],
            lastItem = allItems[obj.childrenLengthCloned - 1];
        if (dir === -1) {
          obj.container.insertBefore(lastItem, firstItem);
        } else if (dir === 1) {
          obj.container.appendChild(firstItem);
        }
      }
    } else {
      var allItems = obj.container.querySelectorAll(obj.child),
          firstItem = allItems[0],
          lastItem = allItems[obj.childrenLengthCloned - 1];
      if (dir === -1) {
        obj.container.insertBefore(lastItem, firstItem);
      } else if (dir === 1) {
        obj.container.appendChild(firstItem);
      }
    }

    obj.index = (obj.index === -1) ? 0 : (obj.childrenLength - obj.items - 1);
    obj.container.style.left = - (100 * obj.index / obj.items) + '%';
  },

  // new: function () {
  // },
  // new2: function () {
  // }
};

tinySlider({
  container: document.querySelector('.slider'),
  items: 2,
  byPage: false
});

