/**
  * tiny-slider
  * @version 0.6.2
  * @author William Lin
  * @license The MIT License (MIT)
  * @github https://github.com/ganlanyuan/tiny-slider/
  */

var tns = (function () {
  'use strict';

  // get supported property, KEYs
  var TRANSFORM = gn.getSupportedProp([
        'transform', 
        'WebkitTransform', 
        'MozTransform', 
        'OTransform'
      ]),
      transitions = {
        'transitionDuration': ['transitionDelay', 'transitionend'],
        'WebkitTransitionDuration': ['WebkitTransitionDelay', 'oTransitionEnd'],
        'MozTransitionDuration': ['MozTransitionDelay', 'transitionend'],
        'OTransitionDuration': ['OTransitionDelay', 'webkitTransitionEnd']
      },
      animations = {
        'animationDuration': ['animationDelay', 'animationend'],
        'WebkitAnimationDuration': ['WebkitAnimationDelay', 'oAnimationEnd'],
        'MozAnimationDuration': ['MozAnimationDelay', 'animationend'],
        'OAnimationDuration': ['OAnimationDelay', 'webkitAnimationEnd']
      },
      TRANSITIONDURATION = whichProperty(transitions)[0],
      TRANSITIONDELAY = whichProperty(transitions)[1],
      TRANSITIONEND = whichProperty(transitions)[2],
      ANIMATIONDURATION = whichProperty(animations)[0],
      ANIMATIONDELAY = whichProperty(animations)[1],
      ANIMATIONEND = whichProperty(animations)[2],
      KEY = {
        ENTER: 13,
        SPACE: 32,
        PAGEUP: 33,
        PAGEDOWN: 34,
        END: 35,
        HOME: 36,
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40
      };
// console.log(
//   TRANSITIONDURATION,
//   TRANSITIONDELAY,
//   TRANSITIONEND,
//   ANIMATIONDURATION,
//   ANIMATIONDELAY,
//   ANIMATIONEND
//   );

  function core (options) {
    options = gn.extend({
      container: document.querySelector('.slider'),
      mode: 'carousel',
      axis: 'horizontal',
      items: 1,
      gutter: 0,
      edgePadding: 0,
      fixedWidth: false,
      slideBy: 1,
      controls: true,
      controlsText: ['prev', 'next'],
      controlsContainer: false,
      nav: true,
      navContainer: false,
      arrowKeys: false,
      speed: 300,
      autoplay: false,
      autoplayTimeout: 5000,
      autoplayDirection: 'forward',
      autoplayText: ['start', 'pause'],
      animateIn: 'tns-fadeIn',
      animateOut: 'tns-fadeOut',
      animateNormal: 'tns-normal',
      animateDelay: false,
      loop: true,
      autoHeight: false,
      responsive: false,
      lazyload: false,
      touch: true,
      rewind: false
    }, options || {});

    // make sure slide container exists
    if (typeof options.container !== 'object' || options.container === null) {
      return {
        init: function () {},
        destory: function () {}
      }; 
    }

    // === define and set variables ===
    var mode = options.mode,
        axis = options.axis,
        items = options.items,
        container = options.container,
        wrapper = document.createElement('div'),
        contentWrapper = document.createElement('div'),
        slideItems = container.children,
        slideCount = slideItems.length,
        gutter = options.gutter,
        edgePadding = (mode === 'vertical') ? false : options.edgePadding,
        indexAdjust = (edgePadding) ? 1 : 0,
        fixedWidth = options.fixedWidth,
        controls = options.controls,
        controlsText = options.controlsText,
        controlsContainer = (!options.controlsContainer) ? false : options.controlsContainer,
        nav = options.nav,
        navContainer = (!options.navContainer) ? false : options.navContainer,
        arrowKeys = options.arrowKeys,
        speed = options.speed,
        autoplay = options.autoplay,
        autoplayTimeout = options.autoplayTimeout,
        autoplayDirection = (options.autoplayDirection === 'forward') ? 1 : -1,
        autoplayText = options.autoplayText,
        rewind = options.rewind,
        // gallery
        animateIn = (ANIMATIONDURATION) ? options.animateIn : 'tns-fadeIn',
        animateOut = (ANIMATIONDURATION) ? options.animateOut : 'tns-fadeOut',
        animateNormal = (ANIMATIONDURATION) ? options.animateNormal : 'tns-normal',
        animateDelay = (ANIMATIONDURATION) ? options.animateDelay : false,
        loop = (options.rewind) ? false : options.loop,
        autoHeight = (mode === 'gallery') ? true : options.autoHeight,
        responsive = (fixedWidth) ? false : options.responsive,
        slideBy = getSlideBy(),
        lazyload = options.lazyload,
        touch = options.touch,

        slideId = container.id || _getSlideId(),
        slideWidth = fixedWidth || 0,
        slideTopEdges, // collection of slide top edges
        slideItemsOut = [],
        cloneCount = (mode === 'gallery') ? slideCount * 2: (loop) ? Math.ceil(slideCount*1.5) : (edgePadding) ? 1 : 0,
        slideCountNew = (mode === 'gallery') ? slideCount + cloneCount : slideCount + cloneCount * 2,
        prevButton,
        nextButton,
        navItems,
        navCountVisible,
        navCountVisibleCached = slideCount,
        navClicked = -1,
        navCurrent = 0,
        navCurrentCached = 0,
        index = (mode === 'gallery') ? 0 : cloneCount,
        indexCached = index,
        indexMin = indexAdjust,
        indexMax,
        vw,
        // autoplay
        autoplayTimer,
        autoplayButton,
        animating = false,
        // touch
        startX = 0,
        startY = 0,
        translateInit,
        disX,
        disY,
        touchStarted,
        // resize and scroll
        resizeTimer,
        ticking = false;

    // === COMMON FUNCTIONS === //
    function getSlideBy () {
      return (mode === 'gallery' || options.slideBy === 'page') ? items : options.slideBy;
    }

    var getItems = (function () {
      if (!fixedWidth) {
        return function () {
          var itemsTem = options.items,
              // ww = document.documentElement.clientWidth,
              bpKeys = (typeof responsive === 'object') ? Object.keys(responsive) : false;

          if (bpKeys) {
            for (var i = 0; i < bpKeys.length; i++) {
              if (vw >= bpKeys[i]) { itemsTem = responsive[bpKeys[i]]; }
            }
          }
          return Math.max(1, Math.min(slideCount, itemsTem));
        };

      } else {
        return function () { return Math.max(1, Math.min(slideCount, Math.floor(vw / fixedWidth))); };
      }
    })();

    var getSlideWidth = (function () {
      if (navigator.appVersion.indexOf("MSIE 8") > 0) {
        return function () { return Math.round((vw + gutter) / items); };
      } else {
        return function () { return (vw + gutter) / items; };
      }
    })();

    var getVisibleNavCount = (function () {
      if (options.navContainer) {
        return function () { return slideCount; };
      } else {
        return function () { return Math.ceil(slideCount / items); };
      }
    })();

    var getViewWidth = (function () {
      // horizantal carousel: fluid width && edge padding
      //  => inner wrapper view width
      if (axis === 'horizontal' && !fixedWidth && edgePadding) { 
        return function () { return wrapper.clientWidth - (edgePadding + gutter) * 2; };
      // horizantal carousel: fixed width || fluid width but no edge padding
      // vertical carousel
      //  => wrapper view width
      } else {
        return function () { return wrapper.clientWidth; };
      }
    })();

    // compare slide count & items
    // (items) => nav, controls, autoplay
    function checkSlideCount() {
      // a. slide count < items
      //  => disable nav, controls, autoplay
      if (slideCount <= items) { 
        nav = controls = autoplay = loop = rewind = false; 
        index = cloneCount;

        if (navContainer) { _hideElement(navContainer); }
        if (controlsContainer) { _hideElement(controlsContainer); }
        if (autoplayButton) { _hideElement(autoplayButton); }
      // b. slide count > items
      //  => enable nav, controls, autoplay
      } else {
        nav = options.nav;
        controls = options.controls;
        autoplay = options.autoplay;
        loop = (options.rewind) ? false : options.loop;
        rewind = options.rewind;

        if (nav) { _showElement(navContainer); }
        if (controls) { _showElement(controlsContainer); }
        if (autoplay) { _showElement(autoplayButton); }
      }
    }

    // === INITIALIZATION FUNCTIONS === //
    function wrapperInit() {
      _setAttrs(wrapper, {'data-tns-role': 'wrapper'});
      _setAttrs(contentWrapper, {'data-tns-role': 'content-wrapper'});
      if (axis === 'vertical') { 
        _setAttrs(contentWrapper, {'data-tns-hidden': 'y'}); 
      } else {
        _setAttrs(wrapper, {'data-tns-hidden': 'x'}); 
      }

      if (mode === 'carousel') {
        var gap = (fixedWidth && edgePadding) ? getFixedWidthEdgePadding() : (edgePadding) ? edgePadding + gutter : 0;
        contentWrapper.style.cssText = (axis === 'horizontal') ? 'margin: 0 ' + gap + 'px;' : 'padding: ' + gap + 'px 0 ' + edgePadding + 'px; height: ' + getVerticalWrapperHeight() + 'px;'; 
      }
    }

    // vw => items => indexMax, slideWidth, navCountVisible, slideBy
    function getVariables() {
      vw = getViewWidth();
      items = getItems();
      indexMax = slideCountNew - items - indexAdjust;

      if (axis === 'horizontal' && !fixedWidth) { slideWidth = getSlideWidth(); }
      navCountVisible = getVisibleNavCount();
      slideBy = getSlideBy();
    }

    function containerInit() {
      // add id
      if (container.id === '') { 
        container.id = slideId = _getSlideId(); 
      } else {
        slideId = container.id;
      }

      // add attributes
      var features = '';
      if (axis) { features += axis + ' '; }
      if (autoHeight) { features += 'autoheight'; }
      _setAttrs(container, {
        'data-tns-role': 'content', 
        'data-tns-mode': mode, 
        'data-tns-features': features
      });

      // init transform
      if (mode === 'carousel') {
        if (axis === 'horizontal') {
          var size = 'width: ' + (slideWidth + 1) * slideCountNew + 'px; ',
              x = (-index * slideWidth),
              transforms = (TRANSFORM) ? TRANSFORM + ': translate3d(' + x + 'px, 0px, 0px)' : 'left: ' + x + 'px';
          container.style.cssText += size + transforms;
        } else {
          var y = -slideTopEdges[index];
          container.style.cssText += (TRANSFORM) ? TRANSFORM + ': translate3d(0px, ' + y + 'px, 0px)' : 'top: ' + y + 'px';
        }
      }
    }

    // for IE10
    function msInit() {
      if (navigator.msMaxTouchPoints) {
        wrapper.classList.add('ms-touch');
        wrapper.addEventListener('scroll', ie10Scroll, false);
      }
    }

    function slideItemsInit() {
      for (var x = 0; x < slideCount; x++) {
        var item = slideItems[x];

        // add slide id
        item.id = slideId + '-item' + x;

        // add class
        if (mode === 'gallery' && animateNormal) { item.classList.add(animateNormal); }

        // add aria-hidden attribute
        _setAttrs(item, {'aria-hidden': 'true'});

        // set slide width & gutter
        var gutterPosition = (axis === 'horizontal') ? 'right' : 'bottom', 
            styles = '';
        if (mode === 'carousel') { styles = 'margin-' + gutterPosition + ': ' + gutter + 'px;'; }
        if (axis === 'horizontal') { styles = 'width: ' + (slideWidth - gutter) + 'px; ' + styles; }
        item.style.cssText += styles;
      }

      // clone slides
      if (loop || edgePadding) {
        var fragmentBefore = document.createDocumentFragment(), 
            fragmentAfter = document.createDocumentFragment();

        for (var j = cloneCount; j--;) {
          var num = j%slideCount,
              cloneFirst = slideItems[num].cloneNode(true);
          _removeAttrs(cloneFirst, 'id');
          fragmentAfter.insertBefore(cloneFirst, fragmentAfter.firstChild);

          if (mode === 'carousel') {
            var cloneLast = slideItems[slideCount - 1 - num].cloneNode(true);
            _removeAttrs(cloneLast, 'id');
            fragmentBefore.appendChild(cloneLast);
          }
        }

        container.insertBefore(fragmentBefore, container.firstChild);
        container.appendChild(fragmentAfter);
        slideItems = container.children;
      }
    }

    function controlsInit() {
      if (controls) {
        if (!options.controlsContainer) {
          gn.append(wrapper, '<div data-tns-role="controls" aria-label="Carousel Navigation"><button data-controls="prev" tabindex="-1" aria-controls="' + slideId +'" type="button">' + controlsText[0] + '</button><button data-controls="next" tabindex="0" aria-controls="' + slideId +'" type="button">' + controlsText[1] + '</button></div>');

          controlsContainer = wrapper.querySelector('[data-tns-role="controls"]');
        }

        prevButton = controlsContainer.querySelector('[data-controls="prev"]');
        nextButton = controlsContainer.querySelector('[data-controls="next"]');

        if (!_hasAttr(controlsContainer, 'tabindex')) {
          _setAttrs(controlsContainer, {'aria-label': 'Carousel Navigation'});
          _setAttrs(controlsContainer.children, {
            'aria-controls': slideId,
            'tabindex': '-1',
          });
        }
      }
    }

    function navInit() {
      if (nav) {
        if (!options.navContainer) {
          var navHtml = '';
          for (var i = 0; i < slideCount; i++) {
            navHtml += '<button data-slide="' + i +'" tabindex="-1" aria-selected="false" aria-controls="' + slideId + '-item' + i +'" type="button"></button>';
          }
          if (autoplay) {
            navHtml += '<button data-action="stop" type="button"><span hidden>Stop Animation</span>' + autoplayText[0] + '</button>';
          }
          navHtml = '<div data-tns-role="nav" aria-label="Carousel Pagination">' + navHtml + '</div>';
          gn.append(wrapper, navHtml);
          navContainer = wrapper.querySelector('[data-tns-role="nav"]');
        }
        navItems = navContainer.querySelectorAll('[data-slide]');

        // for customized nav container
        if (!_hasAttr(navContainer, 'aria-label')) {
          _setAttrs(navContainer, {'aria-label': 'Carousel Pagination'});
          for (var y = 0; y < slideCount; y++) {
            _setAttrs(navItems[y], {
              'tabindex': '-1',
              'aria-selected': 'false',
              'aria-controls': slideId + '-item' + y,
            });
          }
        }

        for (var j = navCountVisible; j < slideCount; j++) {
          _setAttrs(navItems[j], {'hidden': ''});
        }
        navCountVisibleCached = navCountVisible;
      }
    }

    function autoplayInit() {
      if (autoplay) {
        if (!navContainer) {
          gn.append(wrapper, '<div data-tns-role="nav" aria-label="Carousel Pagination"><button data-action="stop" type="button"><span hidden>Stop Animation</span>' + autoplayText[0] + '</button></div>');
          navContainer = wrapper.querySelector('[data-tns-role="nav"]');
        }
        autoplayButton = navContainer.querySelector('[data-action]');
        startAction();
      }
    }

    function activateSlider() {
      for (var i = index; i < index + items; i++) {
        var item = slideItems[i];
        _setAttrs(item, {'aria-hidden': 'false'});
        if (mode === 'gallery') { 
          item.style.marginLeft = slideWidth * (i - index) + 'px'; 
          item.classList.remove(animateNormal);
          item.classList.add(animateIn);
        }
      }
      if (controls) {
        _setAttrs(nextButton, {'tabindex': '0'});
        if (index === indexMin && !loop || rewind) {
          prevButton.disabled = true;
        }
      }
      if (nav) {
        _setAttrs(navItems[0], {'tabindex': '0', 'aria-selected': 'true'});
      }
    }

    function addSliderEvents() {
      if (mode === 'carousel') {
        if (TRANSITIONEND) {
          container.addEventListener(TRANSITIONEND, onTransitionEnd, false);
        }
        if (touch) {
          container.addEventListener('touchstart', onPanStart, false);
          container.addEventListener('touchmove', onPanMove, false);
          container.addEventListener('touchend', onPanEnd, false);
          container.addEventListener('touchcancel', onPanEnd, false);
        }
      }
      if (nav) {
        for (var y = 0; y < slideCount; y++) {
          navItems[y].addEventListener('click', onClickNav, false);
          navItems[y].addEventListener('keydown', onKeydownNav, false);
        }
      }
      if (controls) {
        prevButton.addEventListener('click', onClickPrev, false);
        nextButton.addEventListener('click', onClickNext, false);
        prevButton.addEventListener('keydown', onKeydownControl, false);
        nextButton.addEventListener('keydown', onKeydownControl, false);
      }
      if (autoplay) {
        autoplayButton.addEventListener('click', toggleAnimation, false);

        if (controls) {
          prevButton.addEventListener('click', stopAnimation, false );
          nextButton.addEventListener('click', stopAnimation, false );
        }

        if (nav) {
          for (var b = 0; b < slideCount; b++) {
            navItems[b].addEventListener('click', stopAnimation, false);
          }
        }
      }
      if (arrowKeys) {
        document.addEventListener('keydown', onKeydownDocument, false);
      }
      window.addEventListener('resize', onResize, false);
      window.addEventListener('scroll', onScroll, false);
    }

    // lazyload
    function lazyLoad() {
      if (lazyload && gn.isInViewport(container)) {
        var arr = [];
        for(var i = index - 1; i < index + items + 1; i++) {
          var imgsTem = slideItems[i].querySelectorAll('[data-tns-role="lazy-img"]');
          for(var j = imgsTem.length; j--; arr.unshift(imgsTem[j]));
          arr.unshift();
        }

        for (var h = arr.length; h--;) {
          var img = arr[h];
          if (!img.classList.contains('loaded')) {
            img.src = _getAttr(img, 'data-src');
            img.classList.add('loaded');
          }
        }
      }
    }

    // check if all visible images are loaded
    // and update container height if it's done
    function runAutoHeight() {
      if (autoHeight) {
        // get all images inside visible slide items
        var images = [];

        for (var i = index; i < index + items; i++) {
          var imagesTem = slideItems[i].querySelectorAll('img');
          for (var j = imagesTem.length; j--;) {
            images.push(imagesTem[j]);
          }
        }

        if (images.length === 0) {
          updateContainerHeight(); 
        } else {
          checkImagesLoaded(images);
        }
      }
    }

    function checkImagesLoaded(images) {
      for (var i = images.length; i--;) {
        if (imageLoaded(images[i])) {
          images.splice(i, 1);
        }
      }

      if (images.length === 0) {
        updateContainerHeight();
      } else {
        setTimeout(function () { 
          checkImagesLoaded(images); 
        }, 16);
      }
    } 

    function sliderInit() {
      // First thing first, wrap container with "wrapper > contentWrapper",
      // to get the correct view width
      gn.wrap(container, contentWrapper);
      gn.wrap(contentWrapper, wrapper);

      getVariables(); // vw => items => indexMax, slideWidth, navCountVisible, slideBy
      slideItemsInit();
      if (axis === 'vertical') { getSlideTopEdges(); } // (init) => slideTopEdges

      wrapperInit();
      containerInit();
      msInit();
      controlsInit();
      navInit();
      autoplayInit();


      activateSlider();
      addSliderEvents();
      checkSlideCount(); // (items) => nav, controls, autoplay

      lazyLoad();
      runAutoHeight();
    }
    sliderInit();

    // (vw) => edgePadding
    function getFixedWidthEdgePadding() {
      return (vw%fixedWidth + gutter) / 2;
    }

    // update container height
    // 1. get the max-height of the visible slides
    // 2. set transitionDuration to speed
    // 3. update container height to max-height
    // 4. set transitionDuration to 0s after transition done
    function updateContainerHeight() {
      var heights = [], maxHeight;
      for (var i = index; i < index + items; i++) {
        heights.push(slideItems[i].offsetHeight);
      }
      maxHeight = Math.max.apply(null, heights);

      if (container.style.height !== maxHeight) {
        if (TRANSITIONDURATION) { setDurations(1); }
        container.style.height = maxHeight + 'px';
      }
    }

    // === VERTICAL CAROUSEL FUNCTIONS === //
    // get the distance from the top edge of the first slide to each slide
    // (init) => slideTopEdges
    function getSlideTopEdges() {
      slideTopEdges = [0];
      var topFirst = slideItems[0].getBoundingClientRect().top, top;
      for (var i = 1; i < slideCountNew; i++) {
        top = slideItems[i].getBoundingClientRect().top;
        slideTopEdges.push(top - topFirst);
      }
    }

    // get wrapper height
    // (slideTopEdges, index, items) => vertical_conentWrapper.height
    function getVerticalWrapperHeight() {
      return slideTopEdges[index + items] - slideTopEdges[index];
    }

    // set snapInterval (for IE10)
    function setSnapInterval() {
      wrapper.style.msScrollSnapPointsX = 'snapInterval(0%, ' + slideWidth + ')';
    }

    // update slide
    function updateSlideStatus() {
      var h1, h2, v1, v2;
      if (index !== indexCached) {
        if (index > indexCached) {
          h1 = indexCached;
          h2 = Math.min(indexCached + items, index);
          v1 = Math.max(indexCached + items, index);
          v2 = index + items;
        } else {
          h1 = Math.max(index + items, indexCached);
          h2 = indexCached + items;
          v1 = index;
          v2 = Math.min(index + items, indexCached);
        }
      }

      if (slideBy%1 !== 0) {
        h1 = Math.round(h1);
        h2 = Math.round(h2);
        v1 = Math.round(v1);
        v2 = Math.round(v2);
      }

      for (var i = h1; i < h2; i++) {
        _setAttrs(slideItems[i], {'aria-hidden': 'true'});
      }
      for (var j = v1; j < v2; j++) {
        _setAttrs(slideItems[j], {'aria-hidden': 'false'});
      }
    }

    // get current nav
    function getNavCurrent() {
      var navCurrentTem;
      if (navClicked === -1) {
        var absoluteIndex = (index < cloneCount) ? index + slideCount : index%slideCount;
        if (options.navContainer) {
          return absoluteIndex;
        } else {
          navCurrentTem = Math.floor(absoluteIndex / items);
          // non-loop & reach the edge
          if (!loop && slideCount%items !== 0 && index === slideCount - items) { navCurrentTem += 1; }
          return navCurrentTem;
        }
      } else {
        navCurrentTem = navClicked;
        navClicked = -1;
      }

      return navCurrentTem;
    }

    // set tabindex & aria-selected on Nav
    function updateNavStatus() {
      if (nav) {
        if (navClicked === -1) {
          var absIndex = index;
          while (absIndex < cloneCount) { absIndex += slideCount; }
          absIndex = (absIndex - cloneCount)%slideCount;

          if (options.navContainer) {
            navCurrent = absIndex;
          } else {
            navCurrent = Math.floor(absIndex / items);
            // non-loop & reach the edge
            if (!loop && slideCount%items !== 0 && index === indexMax) { navCurrent += 1; }
          }
        } else {
          navCurrent = navClicked;
          navClicked = -1;
        }

        if (navCurrent !== navCurrentCached) {
          _setAttrs(navItems[navCurrentCached], {
            'tabindex': '-1',
            'aria-selected': 'false'
          });

          _setAttrs(navItems[navCurrent], {
            'tabindex': '0',
            'aria-selected': 'true'
          });
          navCurrentCached = navCurrent;
        }
      }
    }

    // set 'disabled' to true on controls when reach the edge
    function updateControlsStatus() {
      if (controls && !loop) {
        if (index === indexMin || !rewind && index === indexMax) {
          var inactive = (index === indexMin) ? prevButton : nextButton,
              active = (index === indexMin) ? nextButton : prevButton;

          changeFocus(inactive, active);

          inactive.disabled = true;
          _setAttrs(inactive, {'tabindex': '-1'});

          active.disabled = false;
          _setAttrs(active, {'tabindex': '0'});
        } else {
          prevButton.disabled = false;
          nextButton.disabled = false;
        }
      }
    }

    // set duration
    function setDurations (indexGap, target) {
      var duration = (indexGap)? speed * indexGap / 1000 + 's' : '';
      target = target || container;
      target.style[TRANSITIONDURATION] = duration;

      if (mode === 'gallery') {
        target.style[ANIMATIONDURATION] = duration;
      }
      if (axis === 'vertical') {
        contentWrapper.style[TRANSITIONDURATION] = duration;
      }
    }

    function checkFixedWidthRightEdge(indexGap) {
      if (fixedWidth && !loop && !edgePadding && index === indexMax) {
        doTransform(indexGap, -slideCountNew * slideWidth + vw + gutter);
      } else {
        doTransform(indexGap);
      }
    }

    // make transfer after click/drag:
    // 1. change 'transform' property for mordern browsers
    // 2. change 'left' property for legacy browsers
    var transformCore = (function () {
      if (mode === 'carousel') {
        return function (distance) {
          var d = (distance) ? distance : (axis === 'horizontal') ? -slideWidth * index : -slideTopEdges[index],
              tran = 'translate3d(',
              data = {
                x: [TRANSFORM, tran, d, 'px, 0px, 0px)'],
                y: [TRANSFORM, tran + '0px, ', d, 'px, 0px)'],
                l: ['left', '', d, 'px'],
                t: ['top', '', d, 'px'],
              },
              a = (axis === 'horizontal') ? (TRANSFORM) ? 'x' : 'l' : (TRANSFORM) ? 'y' : 't';
          container.style[data[a][0]] = data[a][1] + data[a][2] + data[a][3];
          if (axis === 'vertical') { contentWrapper.style.height = getVerticalWrapperHeight() + 'px'; }
        };
      } else {
        return function () {
          slideItemsOut = [];
          slideItems[indexCached].removeEventListener(TRANSITIONEND, onTransitionEnd, false);
          slideItems[indexCached].removeEventListener(ANIMATIONEND, onTransitionEnd, false);
          slideItems[index].addEventListener(TRANSITIONEND, onTransitionEnd, false);
          slideItems[index].addEventListener(ANIMATIONEND, onTransitionEnd, false);

          (function () {
            for (var i = indexCached, l = indexCached + items; i < l; i++) {
              var a = (i < slideCountNew) ? i : i - slideCount,
                  item = slideItems[a];
              if (TRANSITIONDURATION) { setDurations(1, item); }
              if (animateDelay && TRANSITIONDELAY) {
                var d = animateDelay * (i - indexCached) / 1000; 
                item.style[TRANSITIONDELAY] = d + 's'; 
                item.style[ANIMATIONDELAY] = d + 's'; 
              }
              item.classList.remove(animateIn);
              item.classList.add(animateOut);
              slideItemsOut.push(item);
            }
          })();

          (function () {
            for (var i = index, l = index + items; i < l; i++) {
              var a = (i < slideCountNew) ? i : i - slideCount,
                  item = slideItems[a];
              if (TRANSITIONDURATION) { setDurations(1, item); }
              if (animateDelay && TRANSITIONDELAY) {
                var d = animateDelay * (i - index) / 1000; 
                item.style[TRANSITIONDELAY] = d + 's'; 
                item.style[ANIMATIONDELAY] = d + 's'; 
              }
              item.classList.remove(animateNormal);
              item.classList.add(animateIn);
              if (i > index) { item.style.marginLeft = (i - index) * slideWidth + 'px'; }
            }
          })();
        };
      }
    })();

    function doTransform (indexGap, distance) {
      if (TRANSITIONDURATION) { setDurations(indexGap); }
      transformCore(distance);
    }

    // check index after click/drag:
    // if there is not enough room for next transfering,
    // move slide container to a new location without animation
    // |-----|-----|----------|-----|-----|
    // |items|items|slideCount|items|items|
    function checkIndexCarouselLoop() {
      var leftEdge = slideBy + indexMin,
          rightEdge = indexMax - slideBy; // -1: index starts form 0

      if (index < leftEdge || index > rightEdge) {
        updateIndexCache();
        var newIndex1 = index - slideCount,
            newIndex2 = index + slideCount;
        index = (newIndex1 >= leftEdge && newIndex1 <= rightEdge) ? newIndex1 : newIndex2;

        doTransform(0);
      }
    }

    function render(indexGap) {
      _setAttrs(container, {'aria-busy': 'true'});
      doTransform(indexGap);
      if (!TRANSITIONEND) { onTransitionEnd(); }
    }

    // AFTER TRANSFORM
    // Things need to be done after a transfer:
    // 1. check index
    // 2. add classes to visible slide
    // 3. disable controls buttons when reach the first/last slide in non-loop slider
    // 4. update nav status
    // 5. lazyload images
    // 6. update container height
    function onTransitionEnd(e) {
      if (mode === 'gallery' && slideItemsOut.length > 0) {
        for (var i = 0; i < items; i++) {
          var item = slideItemsOut[i];
          if (TRANSITIONDURATION) { setDurations(0, item); }
          if (animateDelay && TRANSITIONDELAY) { 
            item.style[TRANSITIONDELAY] = item.style[ANIMATIONDELAY] = '';
          }
          item.classList.remove(animateOut);
          item.classList.add(animateNormal);
          item.style.marginLeft = '';
        }
      }

      if (!TRANSITIONEND || e && e.propertyName !== 'height') {
        if (loop && mode === 'carousel') { checkIndexCarouselLoop(); }
        updateSlideStatus();
        updateNavStatus();
        updateControlsStatus();
        lazyLoad();
        runAutoHeight();

        _removeAttrs(container, 'aria-busy');
        updateIndexCache();
      }
    }

    function updateIndexCache() {
      indexCached = index;
    }

    // # ACTIONS
    // on controls click
    function move(dir) {
      if (_getAttr(container, 'aria-busy') !== 'true') {
        index = index + dir * slideBy;

        if (!loop || mode === 'gallery') { checkIndex(); }
        var indexGap = Math.abs(index - indexCached);
        checkFixedWidthRightEdge(indexGap);
      }
    }

    function onClickPrev() {
      move(-1);
    }

    function onClickNext() {
      if(rewind && index === indexMax){
        move(-(indexMax - indexMin) / slideBy);
      }else{
        move(1);
      }
    }

    // on doc click
    function onClickNav(e) {
      if (_getAttr(container, 'aria-busy') !== 'true') {
        var clickTarget = e.target || e.srcElement, navIndex, indexGap;

        while (gn.indexOf(navItems, clickTarget) === -1) {
          clickTarget = clickTarget.parentNode;
        }

        navIndex = navClicked = Number(_getAttr(clickTarget, 'data-slide'));

        index = (options.navContainer) ? navIndex + cloneCount : navIndex * items + cloneCount;
        if (!loop || mode === 'gallery') { checkIndex(); }

        indexGap = Math.abs(index - indexCached);
        checkFixedWidthRightEdge(indexGap);
      }
    }

    function startAction() {
      autoplayTimer = setInterval(function () {
        move(autoplayDirection);
      }, autoplayTimeout);
      autoplayButton.setAttribute('data-action', 'stop');
      autoplayButton.innerHTML = '<span hidden>Stop Animation</span>' + autoplayText[1];

      animating = true;
    }

    function stopAction() {
      clearInterval(autoplayTimer);
      autoplayButton.setAttribute('data-action', 'start');
      autoplayButton.innerHTML = '<span hidden>Stop Animation</span>' + autoplayText[0];

      animating = false;
    }

    function toggleAnimation() {
      if (animating) {
        stopAction();
      } else {
        startAction();
      }
    }

    function stopAnimation() {
      if (animating) { stopAction(); }
    }

    // 
    function onKeydownDocument(e) {
      e = e || window.event;
      switch(e.keyCode) {
        case KEY.LEFT:
          onClickPrev();
          break;
        case KEY.RIGHT:
          onClickNext();
      }
    }

    // change focus
    function changeFocus(blur, focus) {
      if (typeof blur === 'object' && 
          typeof focus === 'object' && 
          blur === document.activeElement) {
        blur.blur();
        focus.focus();
      }
    }

    // on key control
    function onKeydownControl(e) {
      e = e || window.event;
      var code = e.keyCode,
          curElement = document.activeElement;

      switch (code) {
        case KEY.LEFT:
        case KEY.UP:
        case KEY.HOME:
        case KEY.PAGEUP:
          if (curElement !== prevButton && prevButton.disabled !== true) {
            changeFocus(curElement, prevButton);
          }
          break;
        case KEY.RIGHT:
        case KEY.DOWN:
        case KEY.END:
        case KEY.PAGEDOWN:
          if (curElement !== nextButton && nextButton.disabled !== true) {
            changeFocus(curElement, nextButton);
          }
          break;
        case KEY.ENTER:
        case KEY.SPACE:
          if (curElement === nextButton) {
            onClickNext();
          } else {
            onClickPrev();
          }
          break;
      }
    }

    // on key nav
    function onKeydownNav(e) {
      e = e || window.event;
      var code = e.keyCode,
          curElement = document.activeElement,
          dataSlide = _getAttr(curElement, 'data-slide');

      switch(code) {
        case KEY.LEFT:
        case KEY.PAGEUP:
          if (dataSlide > 0) { changeFocus(curElement, curElement.previousElementSibling); }
          break;
        case KEY.UP:
        case KEY.HOME:
          if (dataSlide !== 0) { changeFocus(curElement, navItems[0]); }
          break;
        case KEY.RIGHT:
        case KEY.PAGEDOWN:
          if (dataSlide < navCountVisible - 1) { changeFocus(curElement, curElement.nextElementSibling); }
          break;
        case KEY.DOWN:
        case KEY.END:
          if (dataSlide < navCountVisible - 1) { changeFocus(curElement, navItems[navCountVisible - 1]); }
          break;
        case KEY.ENTER:
        case KEY.SPACE:
          onClickNav(e);
          break;
      }
    }

    // IE10 scroll function
    function ie10Scroll() {
      doTransform(0, container.scrollLeft());
      updateIndexCache();
    }

    function onPanStart(e) {
      var touchObj = e.changedTouches[0];
      startX = parseInt(touchObj.clientX);
      startY = parseInt(touchObj.clientY);
      var slicePositions = (axis === 'horizontal') ? [12, -13] : [17, -8];
      translateInit = Number(container.style[TRANSFORM].slice(slicePositions[0], slicePositions[1]));
    }

    function onPanMove(e) {
      var touchObj = e.changedTouches[0];
      disX = parseInt(touchObj.clientX) - startX;
      disY = parseInt(touchObj.clientY) - startY;

      if (_getPanDirection(_toDegree(disY, disX), 15) === axis) { 
        touchStarted = true;
        e.preventDefault();
        var distance = (axis === 'horizontal') ? disX : disY;
        doTransform(0, translateInit + distance);
      }
    }

    function onPanEnd(e) {
      var touchObj = e.changedTouches[0];
      disX = parseInt(touchObj.clientX) - startX;
      disY = parseInt(touchObj.clientY) - startY;

      if (touchStarted) {
        touchStarted = false;
        e.preventDefault();

        if (axis === 'horizontal') {
          index = - (translateInit + disX) / slideWidth;
          index = (disX > 0) ? Math.floor(index) : Math.ceil(index);
        } else {
          var moved = - (translateInit + disY);
          if (moved <= 0) {
            index = indexMin;
          } else if (moved >= slideTopEdges[slideTopEdges.length - 1]) {
            index = indexMax;
          } else {
            var i = 0;
            do {
              i++;
              index = (disY < 0) ? i + 1 : i;
            } while (i < slideCountNew && moved >= Math.round(slideTopEdges[i + 1]));
          }
        }

        if (!loop || mode === 'gallery') { checkIndex(); }
        checkFixedWidthRightEdge(1);
        if (!TRANSITIONEND) { onTransitionEnd(); }
      }
    }

    // === RESIZE FUNCTIONS === //

    var checkIndex = (function () {
      if (mode === 'gallery') {
        return function () {
          if (index > indexMax || index < indexMin) {
            while (index >= slideCount) { index -= slideCount; }
            while (index <= indexMax - slideCount) { index += slideCount; }
          }
        };
      } else if (!loop) {
        return function () {
          index = Math.max(indexMin, Math.min(indexMax, index));
        };
      }
    })();

    // (slideWidth) => container.width, slide.width
    function updateSlideWidth() {
      container.style.width = (slideWidth + 1) * slideCountNew + 'px'; // + 1 => fix half-pixel issue
      for (var i = slideCountNew; i--;) {
        slideItems[i].style.width = (slideWidth - gutter) + 'px';
      }
    }

    // (slideWidth, index, items) => gallery_visible_slide.marginLeft
    function updateSlidePosition() {
      for (var i = index + 1, len = index + items; i < len; i++) {
        slideItems[i].style.marginLeft = slideWidth * (i - index) + 'px';
      }
    }

    // (vw) => fixedWidth_contentWrapper.edgePadding
    function updateFixedWidthEdgePadding() {
      contentWrapper.style.cssText = 'margin: 0px ' + getFixedWidthEdgePadding() + 'px';
    }

    // (slideTopEdges, index, items) => vertical_conentWrapper.height
    function updateWrapperHeight() {
      contentWrapper.style.height = getVerticalWrapperHeight() + 'px';
    }

    // show or hide nav
    // (navCountVisible) => nav.[hidden]
    function updateNavDisplay() {
      if (navCountVisible !== navCountVisibleCached) {
        if (navCountVisible > navCountVisibleCached) {
          for (var i = navCountVisibleCached; i < navCountVisible; i++) {
            _removeAttrs(navItems[i], 'hidden');
          }
        } else {
          for (var j = navCountVisible; j < navCountVisibleCached; j++) {
            _setAttrs(navItems[j], {'hidden': ''});
          }
        }
      }
      navCountVisibleCached = navCountVisible;
    }

    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (vw !== getViewWidth()) {
          getVariables(); // vw => items => indexMax, slideWidth, navCountVisible, slideBy
          if (loop && mode === 'carousel') { checkIndexCarouselLoop(); }

          checkSlideCount(); // (items) => nav, controls, autoplay
          if (!options.navContainer) { updateNavDisplay(); } // (navCountVisible) => nav.[hidden]

          if (axis === 'horizontal') {
            if (fixedWidth) {
              updateFixedWidthEdgePadding(); // (vw) => fixedWidth_contentWrapper.edgePadding
            } else {
              updateSlideWidth(); // (slideWidth) => container.width, slide.width
              if (mode === 'gallery') {
                updateSlidePosition(); // (slideWidth, index, items) => gallery_visible_slide.marginLeft
              }
            }
          } else {
            getSlideTopEdges(); // (init) => slideTopEdges
            updateWrapperHeight(); // (slideTopEdges, index, items) => vertical_conentWrapper.height
          }

          if (navigator.msMaxTouchPoints) { setSnapInterval(); }

          if (mode === 'carousel') {
            doTransform(0);
            onTransitionEnd(); 
            updateIndexCache();
          } else {
            runAutoHeight();
          }
        }
      }, 100); // update after stop resizing for 100 ms
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(function() {
          lazyLoad();
          ticking = false;
        });
      }
      ticking = true;
    }

    return {
      destory: function () {
        // wrapper
        gn.unwrap(wrapper);
        gn.unwrap(contentWrapper);
        wrapper = contentWrapper = null;

        // container
        _removeAttrs(container, ['id', 'style', 'data-tns-role', 'data-tns-features']);

        // cloned items
        if (loop) {
          for (var j = cloneCount; j--;) {
            slideItems[0].remove();
            slideItems[slideItems.length - 1].remove();
          }
        }

        // Slide Items
        _removeAttrs(slideItems, ['id', 'style', 'aria-hidden']);
        slideId = slideCount = null;

        // controls
        if (controls) {
          if (!options.controlsContainer) {
            controlsContainer.remove();
            controlsContainer = prevButton = nextButton = null;
          } else {
            _removeAttrs(controlsContainer, ['aria-label']);
            _removeAttrs(controlsContainer.children, ['aria-controls', 'tabindex']);
            _removeEvents(controlsContainer);
          }
        }

        // nav
        if (nav) {
          if (!options.navContainer) {
            navContainer.remove();
            navContainer = null;
          } else {
            _removeAttrs(navContainer, ['aria-label']);
            _removeAttrs(navItems, ['aria-selected', 'aria-controls', 'tabindex']);
            _removeEvents(navContainer);
          }
          navItems = null;
        }

        // auto
        if (autoplay) {
          if (!options.navContainer && navContainer !== null) {
            navContainer.remove();
            navContainer = null;
          } else {
            _removeEvents(autoplayButton);
          }
        }

        // remove slider container events at the end
        // because this will make container = null
        _removeEvents(container);

        // remove arrowKeys eventlistener
        if (arrowKeys) {
          document.removeEventListener('keydown', onKeydownDocument, false);
        }

        // remove window event listeners
        window.removeEventListener('resize', onResize, false);
        window.removeEventListener('scroll', onScroll, false);
      },
      getIndex: function () { return index; },

      // $ Private methods, for test only
      hasAttr: _hasAttr, 
      getAttr: _getAttr, 
      setAttrs: _setAttrs, 
      removeAttrs: _removeAttrs, 
      removeEvents: _removeEvents, 
      getSlideId: _getSlideId, 
      toDegree: _toDegree, 
      getPanDirection: _getPanDirection, 
      hideElement: _hideElement, 
      showElement: _showElement, 
      
      mode: mode,
      axis: axis,
      gutter: gutter,
      edgePadding: edgePadding,
      fixedWidth: fixedWidth,
      controls: controls,
      nav: nav,
      rewind: rewind,
      loop: loop,
      autoHeight: autoHeight,
      slideBy: slideBy,
      lazyload: lazyload,
      touch: touch,
      speed: speed,
      items: getItems(),
      cloneCount: cloneCount,
      navCountVisible: function () { return navCountVisible; },
      slideWidth: function () { return slideWidth; },
      
      container: container,
      slideItems: slideItems,
      slideCount: slideCount,
      controlsContainer: function () { return controlsContainer; },
      prevButton: function () { return prevButton; }, 
      nextButton: function () { return nextButton; }, 
      navContainer: function () { return navContainer; },
      navItems: function () { return navItems; },
    };
  }

  // === Private helper functions === //
  function _getSlideId() {
    window.tnsNumber = (window.tnsNumber) ? window.tnsNumber++ : 1;
    return 'tns' + window.tnsNumber;
  }

  function _toDegree (y, x) {
    return Math.atan2(y, x) * (180 / Math.PI);
  }

  function _getPanDirection(angle, range) {
    if ( Math.abs(90 - Math.abs(angle)) >= (90 - range) ) {
      return 'horizontal';
    } else if ( Math.abs(90 - Math.abs(angle)) <= range ) {
      return 'vertical';
    } else {
      return false;
    }
  }

  function _hasAttr(el, attr) {
    return el.hasAttribute(attr);
  }

  function _getAttr(el, attr) {
    return el.getAttribute(attr);
  }

  function _setAttrs(els, attrs) {
    els = (gn.isNodeList(els) || els instanceof Array) ? els : [els];
    if (Object.prototype.toString.call(attrs) !== '[object Object]') { return; }

    for (var i = els.length; i--;) {
      for(var key in attrs) {
        els[i].setAttribute(key, attrs[key]);
      }
    }
  }

  function _removeAttrs(els, attrs) {
    els = (gn.isNodeList(els) || els instanceof Array) ? els : [els];
    attrs = (attrs instanceof Array) ? attrs : [attrs];

    var attrLength = attrs.length;
    for (var i = els.length; i--;) {
      for (var j = attrLength; j--;) {
        els[i].removeAttribute(attrs[j]);
      }
    }
  }

  function _removeEvents(el) {
    var elClone = el.cloneNode(true), parent = el.parentNode;
    parent.insertBefore(elClone, el);
    el.remove();
    el = null;
  }

  function _hideElement(el) {
    if (!_hasAttr(el, 'hidden')) {
      _setAttrs(el, {'hidden': ''});
    }
  }

  function _showElement(el) {
    if (_hasAttr(el, 'hidden')) {
      _removeAttrs(el, 'hidden');
    }
  }

  // check if an image is loaded
  // 1. See if "naturalWidth" and "naturalHeight" properties are available.
  // 2. See if "complete" property is available.
  function imageLoaded(img) {
    if (typeof img.complete === 'boolean') {
      return img.complete;
    } else if (typeof img.naturalWidth === 'number') {
      return img.naturalWidth !== 0;
    }
  }

  // From Modernizr
  function whichProperty(obj){
    var t,
        el = document.createElement('fakeelement');

    for(t in obj){
      if( el.style[t] !== undefined ){
        return [t, obj[t][0], obj[t][1]];
      }
    }

    return false; // explicit for ie9-
  }

  return core;
})();