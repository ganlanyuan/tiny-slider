// DEVELOPMENT

// from go-native
import "../../go-native/src/utilities/childNode.remove";
import "../../go-native/src/vendors/requestAnimationFrame";
import "../../go-native/src/vendors/token-list";

import { extend } from "../../go-native/src/gn/extend";
import { indexOf } from "../../go-native/src/gn/indexOf";
import { getSupportedProp } from "../../go-native/src/gn/getSupportedProp";
import { append } from "../../go-native/src/gn/append";
import { wrap } from "../../go-native/src/gn/wrap";
import { unwrap } from "../../go-native/src/gn/unwrap";

// helper functions
import { getSlideId } from './helpers/getSlideId';
import { toDegree } from './helpers/toDegree';
import { getTouchDirection } from './helpers/getTouchDirection';
import { hasAttr } from './helpers/hasAttr';
import { getAttr } from './helpers/getAttr';
import { setAttrs } from './helpers/setAttrs';
import { removeAttrs } from './helpers/removeAttrs';
import { removeEventsByClone } from './helpers/removeEventsByClone';
import { hideElement } from './helpers/hideElement';
import { showElement } from './helpers/showElement';
import { imageLoaded } from './helpers/imageLoaded';
import { whichProperty } from './helpers/whichProperty';
import { addEvents } from './helpers/addEvents';
import { removeEvents } from './helpers/removeEvents';
import { Events } from './helpers/events';
import { jsTransform } from './helpers/jsTransform';

var TRANSFORM = getSupportedProp([
      'transform', 
      'WebkitTransform', 
      'MozTransform', 
      'msTransform',
      'OTransform'
    ]),
    transitions = {
      'transitionDuration': ['transitionDelay', 'transitionend'],
      'WebkitTransitionDuration': ['WebkitTransitionDelay', 'webkitTransitionEnd'],
      'MozTransitionDuration': ['MozTransitionDelay', 'transitionend'],
      'OTransitionDuration': ['OTransitionDelay', 'oTransitionEnd']
    },
    animations = {
      'animationDuration': ['animationDelay', 'animationend'],
      'WebkitAnimationDuration': ['WebkitAnimationDelay', 'webkitAnimationEnd'],
      'MozAnimationDuration': ['MozAnimationDelay', 'animationend'],
      'OAnimationDuration': ['OAnimationDelay', 'oAnimationEnd']
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

export function tns(options) {
  options = extend({
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
    autoplayText: ['start', 'stop'],
    autoplayHoverPause: false,
    autoplayButton: false,
    autoplayResetOnVisibility: true,
    animateIn: 'tns-fadeIn',
    animateOut: 'tns-fadeOut',
    animateNormal: 'tns-normal',
    animateDelay: false,
    loop: true,
    autoHeight: false,
    responsive: false,
    lazyload: false,
    touch: true,
    mouseDrag: false,
    rewind: false,
    nested: false,
    onInit: false
  }, options || {});
  // make sure slide container exists
  if (typeof options.container !== 'object' || options.container === null) { return; }

  // === define and set variables ===
  var mode = options.mode,
      axis = options.axis,
      wrapper = document.createElement('div'),
      contentWrapper = document.createElement('div'),
      container = options.container,
      slideItems = container.children,
      slideCount = slideItems.length,
      items = options.items,
      slideBy = getSlideBy(),
      nested = options.nested,
      gutter = options.gutter,
      edgePadding = (mode === 'gallery') ? false : options.edgePadding,
      fixedWidth = options.fixedWidth,
      arrowKeys = options.arrowKeys,
      speed = options.speed,
      rewind = options.rewind,
      loop = (mode === 'gallery')? true: (options.rewind)? false : options.loop,
      autoHeight = (mode === 'gallery') ? true : options.autoHeight,
      responsive = (fixedWidth) ? false : options.responsive,
      lazyload = options.lazyload,
      slideId = container.id || getSlideId(),
      slideWidth = (fixedWidth)? fixedWidth + gutter : 0,
      slideEdges, // collection of slide edges
      slideItemsOut = [],
      cloneCount = (loop) ? slideCount * 2 : (edgePadding) ? 1 : 0,
      slideCountNew = (mode === 'gallery') ? slideCount + cloneCount : slideCount + cloneCount * 2,
      hasRightDeadZone = (fixedWidth && !loop && !edgePadding)? true : false,
      checkIndexBeforeTransform = (mode === 'gallery' || !loop)? true : false,
      // transform
      transformDir = (axis === 'horizontal')? 'X' : 'Y',
      transformAttrLegacy = (axis === 'horizontal')? 'left' : 'top', 
      transformAttr = transformAttrLegacy,
      transformType = 'translate',
      transformPrefix = '',
      transformPostfix = '',
      // controls
      controls = options.controls,
      controlsText = options.controlsText,
      controlsContainer = (!options.controlsContainer) ? false : options.controlsContainer,
      prevButton,
      nextButton,
      // nav
      nav = options.nav,
      navContainer = options.navContainer || false,
      navItems,
      navCountVisible,
      navCountVisibleCached = slideCount,
      navClicked = -1,
      navCurrent = 0,
      navCurrentCached = 0,
      // index
      index = (mode === 'gallery') ? 0 : cloneCount,
      indexCached = index,
      indexAdjust = (edgePadding) ? 1 : 0,
      indexMin = indexAdjust,
      indexMax,
      vw,
      // autoplay
      autoplay = options.autoplay,
      autoplayTimeout = options.autoplayTimeout,
      autoplayDirection = (options.autoplayDirection === 'forward') ? 1 : -1,
      autoplayText = options.autoplayText,
      autoplayHoverPause = options.autoplayHoverPause,
      autoplayTimer,
      autoplayButton = options.autoplayButton,
      animating = false,
      autoplayHoverStopped = false,
      autoplayHtmlString = '<span hidden>Stop Animation</span>',
      autoplayResetOnVisibility = options.autoplayResetOnVisibility,
      autoplayResetVisibilityState = false,
      // touch
      touch = options.touch,
      startX = null,
      startY = null,
      translateInit,
      disX,
      disY,
      touchedOrDraged,
      //mouse
      mouseDrag = options.mouseDrag,
      mousePressed = false,
      isDragEvent = false,
      // gallery
      animateIn = (ANIMATIONDURATION) ? options.animateIn : 'tns-fadeIn',
      animateOut = (ANIMATIONDURATION) ? options.animateOut : 'tns-fadeOut',
      animateNormal = (ANIMATIONDURATION) ? options.animateNormal : 'tns-normal',
      animateDelay = (ANIMATIONDURATION) ? options.animateDelay : false,
      // resize and scroll
      resizeTimer,
      ticking = false,
      onInit = options.onInit,
      events = new Events();

  if (TRANSFORM) {
    transformAttr = TRANSFORM;
    transformPrefix = transformType + transformDir + '(';
    transformPostfix = ')';
  }

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
          bpKeys.forEach(function (key) {
            if (vw >= key) { itemsTem = responsive[key]; }
          });
        }
        return Math.max(1, Math.min(slideCount, itemsTem));
      };

    } else {
      return function () { return Math.max(1, Math.min(slideCount, Math.floor(vw / fixedWidth))); };
    }
  })();

  function getSlideWidth() {
    return (vw + gutter) / items;
  }

  var getVisibleNavCount = (function () {
    if (options.navContainer) {
      return function () { return slideCount; };
    } else {
      return function () { return Math.ceil(slideCount / items); };
    }
  })();

  var getViewWidth = (function () {
    // horizontal carousel: fluid width && edge padding
    //  => inner wrapper view width
    if (axis === 'horizontal' && !fixedWidth && edgePadding) { 
      return function () { return wrapper.clientWidth - (edgePadding + gutter) * 2; };
    // horizontal carousel: fixed width || fluid width but no edge padding
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
      arrowKeys = false;

      var indexTem;
      index = (mode === 'gallery') ? 0 : cloneCount;
      if (index !== indexTem) { events.emit('indexChanged', info()); }

      if (navContainer) { hideElement(navContainer); }
      if (controlsContainer) { hideElement(controlsContainer); }
      if (autoplayButton) { hideElement(autoplayButton); }
    // b. slide count > items
    //  => enable nav, controls, autoplay
    } else {
      arrowKeys = options.arrowKeys;
      if (nav) { showElement(navContainer); }
      if (controls) { showElement(controlsContainer); }
      if (autoplay) { showElement(autoplayButton); }
    }
  }

  // === INITIALIZATION FUNCTIONS === //
  function wrapperInit() {
    setAttrs(wrapper, {'data-tns-role': 'wrapper'});
    setAttrs(contentWrapper, {'data-tns-role': 'content-wrapper'});
    if (axis === 'vertical') { 
      setAttrs(contentWrapper, {'data-tns-hidden': 'y'}); 
    } else {
      setAttrs(wrapper, {'data-tns-hidden': 'x'}); 
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
    if (container.id === '') { container.id = slideId; }
    // add attributes
    setAttrs(container, {
      'data-tns-role': 'content', 
      'data-tns-mode': mode, 
      'data-tns-axis': axis
    });

    if (axis === 'horizontal') {
      container.style.width = (slideWidth + 1) * slideCountNew + 'px';
    }
  }

  function containerInitStyle() {
    // init width & transform
    if (mode === 'carousel') {
      if (autoHeight) { setAttrs(container, {'data-tns-hidden': 'y'}); }
      container.style[transformAttr] = transformPrefix + Math.round(-slideEdges[index]) + 'px' + transformPostfix;
    }
  }

  // for IE10
  function msInit() {
    if (navigator.msMaxTouchPoints) {
      wrapper.classList.add('ms-touch');
      addEvents(wrapper, {'scroll': ie10Scroll});
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
      setAttrs(item, {'aria-hidden': 'true'});

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
        removeAttrs(cloneFirst, 'id');
        fragmentAfter.insertBefore(cloneFirst, fragmentAfter.firstChild);

        if (mode === 'carousel') {
          var cloneLast = slideItems[slideCount - 1 - num].cloneNode(true);
          removeAttrs(cloneLast, 'id');
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
      if (options.controlsContainer) {
        prevButton = controlsContainer.children[0];
        nextButton = controlsContainer.children[1];
        setAttrs(controlsContainer, {'aria-label': 'Carousel Navigation'});
        setAttrs(prevButton, {'data-controls' : 'prev'});
        setAttrs(nextButton, {'data-controls' : 'next'});
        setAttrs(controlsContainer.children, {
          'aria-controls': slideId,
          'tabindex': '-1',
        });
      } else {
        append(wrapper, '<div data-tns-role="controls" aria-label="Carousel Navigation"><button data-controls="prev" tabindex="-1" aria-controls="' + slideId +'" type="button">' + controlsText[0] + '</button><button data-controls="next" tabindex="0" aria-controls="' + slideId +'" type="button">' + controlsText[1] + '</button></div>');

        [].forEach.call(wrapper.children, function (el) {
          if (el.getAttribute('data-tns-role') === 'controls') { controlsContainer = el; }
        });
        prevButton = controlsContainer.children[0];
        nextButton = controlsContainer.children[1];
      }
    }
  }

  function navInit() {
    if (nav) {
      if (options.navContainer) {
        setAttrs(navContainer, {'aria-label': 'Carousel Pagination'});
        navItems = navContainer.children;
        [].forEach.call(navItems, function (item, index) {
          setAttrs(item, {
            'data-nav': index,
            'tabindex': '-1',
            'aria-selected': 'false',
            'aria-controls': slideId + '-item' + index,
          });
        });
      } else {
        var navHtml = '';
        for (var i = 0; i < slideCount; i++) {
          navHtml += '<button data-nav="' + i +'" tabindex="-1" aria-selected="false" aria-controls="' + slideId + '-item' + i +'" type="button"></button>';
        }
        navHtml = '<div data-tns-role="nav" aria-label="Carousel Pagination">' + navHtml + '</div>';
        append(wrapper, navHtml);

        [].forEach.call(wrapper.children, function (el) {
          if (el.getAttribute('data-tns-role') === 'nav') { navContainer = el; }
        });
        navItems = navContainer.children;

        // hide navs
        for (var j = navCountVisible; j < slideCount; j++) {
          setAttrs(navItems[j], {'hidden': ''});
        }

        // update navCountVisibleCached
        navCountVisibleCached = navCountVisible;
      }

    }
  }

  function autoplayInit() {
    if (autoplay) {
      if (autoplayButton) {
        setAttrs(autoplayButton, {'data-action': 'stop'});
      } else {
        if (!navContainer) {
          append(wrapper, '<div data-tns-role="nav" aria-label="Carousel Pagination"></div>');
          navContainer = wrapper.querySelector('[data-tns-role="nav"]');
        }

        append(navContainer, '<button data-action="stop" type="button">' + autoplayHtmlString + autoplayText[0] + '</button>');
        autoplayButton = navContainer.querySelector('[data-action]');
      }

      // start autoplay
      startAction();
    }
  }

  function activateSlider() {
    for (var i = index; i < index + items; i++) {
      var item = slideItems[i];
      setAttrs(item, {'aria-hidden': 'false'});
      if (mode === 'gallery') { 
        item.style.left = slideWidth * (i - index) + 'px'; 
        item.classList.remove(animateNormal);
        item.classList.add(animateIn);
      }
    }
    if (controls) {
      setAttrs(nextButton, {'tabindex': '0'});
      if (index === indexMin && !loop || rewind) {
        prevButton.disabled = true;
      }
    }
    if (nav) {
      setAttrs(navItems[0], {'tabindex': '0', 'aria-selected': 'true'});
    }
  }

  function addSliderEvents() {
    if (mode === 'carousel') {
      if (TRANSITIONEND) {
        var eve = {};
        eve[TRANSITIONEND] = onTransitionEnd;
        addEvents(container, eve);
      }
      if (touch) {
        addEvents(container, {
          'touchstart': onTouchOrMouseStart,
          'touchmove': onTouchOrMouseMove,
          'touchend': onTouchOrMouseEnd,
          'touchcancel': onTouchOrMouseEnd
        });
      }
      if (mouseDrag) {
        addEvents(container, {
          'mousedown': onTouchOrMouseStart,
          'mousemove': onTouchOrMouseMove,
          'mouseup': onTouchOrMouseEnd,
          'mouseleave': onTouchOrMouseEnd
        });
      }
    }

    if (nav) {
      for (var y = 0; y < slideCount; y++) {
        addEvents(navItems[y],{
          'click': onClickNav,
          'keydown': onKeydownNav
        });
      }
    }

    if (controls) {
      addEvents(prevButton,{
        'click': onClickPrev,
        'keydown': onKeydownControl
      });
      addEvents(nextButton,{
        'click': onClickNext,
        'keydown': onKeydownControl
      });
    }

    if (autoplay) {
      addEvents(autoplayButton, {'click': toggleAnimation});
      if (autoplayHoverPause) {
        addEvents(container, {'mouseover': function () {
          if (animating) { 
            stopAction(); 
            autoplayHoverStopped = true;
          }
        }});
        addEvents(container, {'mouseout': function () {
          if (!animating && autoplayHoverStopped) { 
            startAction(); 
            autoplayHoverStopped = false;
          }
        }});
      }

      if (autoplayResetOnVisibility) {
        addEvents(document, {'visibilitychange': onVisibilityChange});
      }
    }

    if (arrowKeys) {
      addEvents(document, {'keydown': onKeydownDocument});
    }

    if (nested === 'inner') {
      events.on('outerResized', function () {
        resizeTasks();
        events.emit('innerLoaded', info());
      });
    } else {
      addEvents(window, {'resize': onResize});
      if (nested === 'outer') {
        events.on('innerLoaded', runAutoHeight);
      }
    }
  }

  // lazyload
  function lazyLoad() {
    // var arr = [], 
    var i = index, 
        len = index + items;
        
    if (edgePadding) {
      i -=1;
      len +=1;
    }

    for(; i < len; i++) {
      [].forEach.call(slideItems[i].querySelectorAll('[data-tns-role="lazy-img"]'), function (img) {
        // stop propagationl transitionend event to container
        var eve = {};
        eve[TRANSITIONEND] = function (e) { e.stopPropagation(); };
        addEvents(img, eve);

        if (!img.classList.contains('loaded')) {
          img.src = getAttr(img, 'data-src');
          img.classList.add('loaded');
        }
      });
    }
  }

  // check if all visible images are loaded
  // and update container height if it's done
  function runAutoHeight() {
    // get all images inside visible slide items
    var images = [];

    for (var i = index; i < index + items; i++) {
      [].forEach.call(slideItems[i].querySelectorAll('img'), function (img) {
        images.push(img);
      });
    }

    if (images.length === 0) {
      updateContainerHeight(); 
    } else {
      checkImagesLoaded(images);
    }
  }

  function checkImagesLoaded(images) {
    images.forEach(function (img, index) {
      if (imageLoaded(img)) { images.splice(index, 1); }
    });

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
    wrap(container, contentWrapper);
    wrap(contentWrapper, wrapper);

    getVariables();
    containerInit();
    slideItemsInit();
    getSlideEdges();

    wrapperInit();
    containerInitStyle();
    msInit();
    controlsInit();
    navInit();
    autoplayInit();

    activateSlider();
    addSliderEvents();
    checkSlideCount();

    if (lazyload) { lazyLoad(); }
    if (autoHeight) { runAutoHeight(); }

    if (typeof onInit === 'function') {
      onInit(info());
    }

    if (nested === 'inner') { 
      events.emit('innerLoaded', info()); 
    }
  }
  sliderInit();

  // (vw) => edgePadding
  function getFixedWidthEdgePadding() {
    return (vw%slideWidth + gutter) / 2;
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
      if (TRANSITIONDURATION) { setDurations(speed); }
      container.style.height = maxHeight + 'px';
    }
  }

  // get the distance from the top edge of the first slide to each slide
  // (init) => slideEdges
  function getSlideEdges() {
    slideEdges = [0];
    var topFirst = slideItems[0].getBoundingClientRect()[transformAttrLegacy], attr;
    for (var i = 1; i < slideCountNew; i++) {
      attr = slideItems[i].getBoundingClientRect()[transformAttrLegacy];
      slideEdges.push(attr - topFirst);
    }
  }

  // get wrapper height
  // (slideEdges, index, items) => vertical_conentWrapper.height
  function getVerticalWrapperHeight() {
    return slideEdges[index + items] - slideEdges[index];
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
      setAttrs(slideItems[i], {'aria-hidden': 'true'});
    }
    for (var j = v1; j < v2; j++) {
      setAttrs(slideItems[j], {'aria-hidden': 'false'});
    }
  }

  // set tabindex & aria-selected on Nav
  function updateNavStatus() {
    // get current nav
    if (nav) {
      if (navClicked === -1) {
        if (options.navContainer) {
          navCurrent = index%slideCount;
        } else {
          navCurrent = Math.floor(index%slideCount / items);
          // non-loop & reach the edge
          if (!loop && slideCount%items !== 0 && index === indexMax) { navCurrent += 1; }
        }
      } else {
        navCurrent = navClicked;
        navClicked = -1;
      }

      if (navCurrent !== navCurrentCached) {
        setAttrs(navItems[navCurrentCached], {
          'tabindex': '-1',
          'aria-selected': 'false'
        });

        setAttrs(navItems[navCurrent], {
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
      var disable = [], active = [];
      if (index === indexMin) {
        disable.push(prevButton);
        active.push(nextButton);
        changeFocus(prevButton, nextButton);
      } else if (!rewind && index === indexMax) {
        disable.push(nextButton);
        active.push(prevButton);
        changeFocus(nextButton, prevButton);
      } else {
        active.push(prevButton, nextButton);
      }

      if (disable.length > 0) {
        disable.forEach(function (button) {
          if (!button.disabled) {
            button.disabled = true;
            setAttrs(button, {'tabindex': '-1'});
          }
        });
      }

      if (active.length > 0) {
        active.forEach(function (button) {
          if (button.disabled) {
            button.disabled = false;
            setAttrs(button, {'tabindex': '0'});
          }
        });
      }
    }
  }

  // set duration
  function setDurations (duration, target) {
    duration = (!duration)? '' : duration / 1000 + 's';
    target = target || container;
    target.style[TRANSITIONDURATION] = duration;

    if (mode === 'gallery') {
      target.style[ANIMATIONDURATION] = duration;
    }
    if (axis === 'vertical') {
      contentWrapper.style[TRANSITIONDURATION] = duration;
    }
  }

  // make transfer after click/drag:
  // 1. change 'transform' property for mordern browsers
  // 2. change 'left' property for legacy browsers
  var transformCore = (function () {
    if (mode === 'carousel') {
      return function (duration, distance) {
        if (!distance) { distance = -slideEdges[index]; }
        // constrain the distance when non-loop no-edgePadding fixedWidth reaches the right edge
        if (hasRightDeadZone && index === indexMax) {
          distance = Math.max(distance, -slideCountNew * slideWidth + vw + gutter);
        }

        if (TRANSITIONDURATION || !duration) {
          container.style[transformAttr] = transformPrefix + Math.round(distance) + 'px' + transformPostfix;
        } else {
          jsTransform(container, transformAttr, transformPrefix, transformPostfix, distance, speed, onTransitionEnd);
        }

        if (axis === 'vertical') { contentWrapper.style.height = getVerticalWrapperHeight() + 'px'; }
      };
    } else {
      return function () {
        slideItemsOut = [];

        var eve1 = {};
        eve1[TRANSITIONEND] = onTransitionEnd;
        eve1[ANIMATIONEND] = onTransitionEnd;
        removeEvents(slideItems[indexCached], eve1);

        var eve2 = {};
        eve2[TRANSITIONEND] = onTransitionEnd;
        eve2[ANIMATIONEND] = onTransitionEnd;
        addEvents(slideItems[index], eve2);

        (function () {
          for (var i = indexCached, l = indexCached + items; i < l; i++) {
            var item = slideItems[i];
            if (TRANSITIONDURATION) { setDurations(speed, item); }
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
            var item = slideItems[i];
            if (TRANSITIONDURATION) { setDurations(speed, item); }
            if (animateDelay && TRANSITIONDELAY) {
              var d = animateDelay * (i - index) / 1000; 
              item.style[TRANSITIONDELAY] = d + 's'; 
              item.style[ANIMATIONDELAY] = d + 's'; 
            }
            item.classList.remove(animateNormal);
            item.classList.add(animateIn);
            if (i > index) { item.style.left = (i - index) * slideWidth + 'px'; }
          }
        })();
      };
    }
  })();

  function doTransform (duration, distance) {
    if (duration === undefined) { duration = speed; }
    if (TRANSITIONDURATION) { setDurations(duration); }
    transformCore(duration, distance);
  }

  // (slideBy, indexMin, indexMax) => index
  var checkIndex = (function () {
    if (loop) {
      return function () {
        var leftEdge = (mode === 'carousel')? slideBy + indexMin : indexMin, 
            rightEdge = (mode === 'carousel')? indexMax - slideBy : indexMax;

        if (fixedWidth && vw%slideWidth !== 0) { rightEdge -= 1; }

        if (index > rightEdge) {
          while(index >= leftEdge + slideCount) { index -= slideCount; }
        } else if(index < leftEdge) {
          while(index <= rightEdge - slideCount) { index += slideCount; }
        }
      };
    } else {
      return function () {
        index = Math.max(indexMin, Math.min(indexMax, index));
      };
    }
  })();

  function render() {
    setAttrs(container, {'aria-busy': 'true'});
    if (checkIndexBeforeTransform) { checkIndex(); }

    // events
    if (index !== indexCached) { events.emit('indexChanged', info()); }
    events.emit('transitionStart', info());

    doTransform();
  }

  // AFTER TRANSFORM
  // Things need to be done after a transfer:
  // 1. check index
  // 2. add classes to visible slide
  // 3. disable controls buttons when reach the first/last slide in non-loop slider
  // 4. update nav status
  // 5. lazyload images
  // 6. update container height
  function onTransitionEnd(event) {
    events.emit('transitionEnd', info(event));

    if (mode === 'gallery' && slideItemsOut.length > 0) {
      for (var i = 0; i < items; i++) {
        var item = slideItemsOut[i];
        if (TRANSITIONDURATION) { setDurations(0, item); }
        if (animateDelay && TRANSITIONDELAY) { 
          item.style[TRANSITIONDELAY] = item.style[ANIMATIONDELAY] = '';
        }
        item.classList.remove(animateOut);
        item.classList.add(animateNormal);
        item.style.left = '';
      }
    }

    /*
     * Transfer prefixed properties to the same format
     * CSS: -Webkit-Transform => webkittransform
     * JS: WebkitTransform => webkittransform
     * @param {string} str - property
     *
     */
    function strTrans(str) {
      return str.toLowerCase().replace(/-/g, '');
    }

    /*
     * update slides, nav, controls after checking ...
     *
     * => legacy browsers who don't support 'event' 
     *    have to check event first, otherwise event.target will cause an error 
     * 
     * => or 'gallery' mode: 
     *   + event target is slide item
     *
     * => or 'carousel' mode: 
     *   + event target is container, 
     *   + event.property is the same with transform attribute
     *
     */
    if (!event || 
        mode === 'gallery' && event.target.parentNode === container || 
        event.target === container && strTrans(event.propertyName) === strTrans(transformAttr)) {

      if (!checkIndexBeforeTransform) { 
        var indexTem = index;
        checkIndex();
        if (index !== indexTem) { 
          doTransform(0); 
          events.emit('indexChanged', info());
        }
      } 

      updateSlideStatus();
      updateNavStatus();
      updateControlsStatus();
      if (lazyload) { lazyLoad(); }
      if (autoHeight) { runAutoHeight(); }

      if (nested === 'inner') { 
        events.emit('innerLoaded', info()); 
      } 
      removeAttrs(container, 'aria-busy');
      updateIndexCache();
    }

  }

  function updateIndexCache() {
    indexCached = index;
  }

  // # ACTIONS
  // on controls click
  function onClickControl(dir) {
    if (getAttr(container, 'aria-busy') !== 'true') {
      index = index + dir * slideBy;

      render();
    }
  }

  function onClickPrev() {
    onClickControl(-1);
  }

  function onClickNext() {
    if(rewind && index === indexMax){
      onClickControl(-(indexMax - indexMin) / slideBy);
    }else{
      onClickControl(1);
    }
  }

  // on doc click
  function onClickNav(e) {
    if (getAttr(container, 'aria-busy') !== 'true') {
      var clickTarget = e.target || e.srcElement, navIndex, indexGap;

      while (indexOf(navItems, clickTarget) === -1) {
        clickTarget = clickTarget.parentNode;
      }

      navIndex = navClicked = Number(getAttr(clickTarget, 'data-nav'));
      var adjust = (mode === 'gallery')? 0 : cloneCount;
      index = (options.navContainer) ? navIndex + adjust : navIndex * items + adjust;

      if (index !== indexCached) { render(); }
    }
  }

  function startAction() {
    resetActionTimer();
    setAttrs(autoplayButton, {'data-action': 'stop'});
    autoplayButton.innerHTML = autoplayHtmlString + autoplayText[1];

    animating = true;
  }

  function stopAction() {
    pauseActionTimer();
    setAttrs(autoplayButton, {'data-action': 'start'});
    autoplayButton.innerHTML = autoplayHtmlString.replace('Stop', 'Start') + autoplayText[0];

    animating = false;
  }

  function pauseActionTimer() {
    animating = 'paused';
    clearInterval(autoplayTimer);
  }

  function resetActionTimer() {
    if (animating === true) { return; }
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(function () {
      onClickControl(autoplayDirection);
    }, autoplayTimeout);
  }

  function toggleAnimation() {
    if (animating) {
      stopAction();
    } else {
      startAction();
    }
  }

  function onVisibilityChange() {
    if (autoplayResetVisibilityState != document.hidden && animating !== false) {
      document.hidden ? pauseActionTimer() : resetActionTimer();
    }
    autoplayResetVisibilityState = document.hidden;
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
        dataSlide = getAttr(curElement, 'data-nav');

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

  function getTarget(e) {
    return e.target || e.srcElement;
  }

  function isLinkElement(el) {
    return el.tagName.toLowerCase() === 'a';
  }

  function preventDefaultBehavior(e) {
      if (e.preventDefault) {
        e.preventDefault();
      } else {
        e.returnValue = false;
      }
  }

  function onTouchOrMouseStart(e) {
    e = e || window.event;
    if (isLinkElement(getTarget(e))) { preventDefaultBehavior(e); }

    var ev = (e.type === 'touchstart') ? e.changedTouches[0] : e;
    startX = parseInt(ev.clientX);
    startY = parseInt(ev.clientY);
    var slices = (TRANSFORM)? [11, -3] : [0, -2];
    translateInit = Number(container.style[transformAttr].slice(slices[0], slices[1]));

    if (e.type === 'touchstart') {
      events.emit('touchStart', info(e));
    } else {
      events.emit('dragStart', info(e));
      mousePressed = true;
    }
  }

  function onTouchOrMouseMove(e) {
    e = e || window.event;

    // "mousemove" event after "mousedown" indecate it's "drag", not "click"
    // set isDragEvent to true
    if (mousePressed && e.type === 'mousemove' && !isDragEvent) {
      isDragEvent = true;
    }
    
    // console.log(e.type, mousePressed, isDragEvent, e.clientX);
    // make sure touch started or mouse draged
    if (startX !== null) {
      if (isLinkElement(getTarget(e))) { preventDefaultBehavior(e); }

      var ev = (e.type === 'touchmove') ? e.changedTouches[0] : e;
      disX = parseInt(ev.clientX) - startX;
      disY = parseInt(ev.clientY) - startY;

      if (getTouchDirection(toDegree(disY, disX), 15) === axis) { 
        touchedOrDraged = true;

        if (e.type === 'touchmove') {
          events.emit('touchMove', info(e));
        } else {
          events.emit('dragMove', info(e));
        }

        var x = (axis === 'horizontal')? (translateInit + disX) : (translateInit + disY);
            x += 'px';

        if (TRANSFORM) {
          x = 'translate' + transformDir + '(' + x + ')';
          setDurations(0);
        }
        container.style[transformAttr] = x;
      }
    }
  }

  function onTouchOrMouseEnd(e) {
    e = e || window.event;

    // reset mousePressed
    if (mousePressed) { mousePressed = false; }

    if (touchedOrDraged) {
      touchedOrDraged = false;

      var ev = (e.type.indexOf('touch') === 0) ? e.changedTouches[0] : e;
      disX = parseInt(ev.clientX) - startX;
      disY = parseInt(ev.clientY) - startY;

      // reset startX, startY
      startX = startY = null;

      if (axis === 'horizontal') {
        index = - (translateInit + disX) / slideWidth;
        index = (disX > 0) ? Math.floor(index) : Math.ceil(index);
      } else {
        var moved = - (translateInit + disY);
        if (moved <= 0) {
          index = indexMin;
        } else if (moved >= slideEdges[slideEdges.length - 1]) {
          index = indexMax;
        } else {
          var i = 0;
          do {
            i++;
            index = (disY < 0) ? i + 1 : i;
          } while (i < slideCountNew && moved >= Math.round(slideEdges[i + 1]));
        }
      }
      
      if (e.type.indexOf('touch') === 0) {
        events.emit('touchEnd', info(e));
      } else {
        events.emit('dragEnd', info(e));
      }

      render();
    }

    // drag vs click?
    if (isDragEvent) { 
      // reset isDragEvent
      isDragEvent = false;

      // prevent "click"
      var target = getTarget(e);
      if (isLinkElement(target)) {
        addEvents(target, {'click': function preventClick(e) {
          preventDefaultBehavior(e);
          removeEvents(target, {'click': preventClick});
        }}); 
      }
    } 
  }

  // === RESIZE FUNCTIONS === //
  // (slideWidth) => container.width, slide.width
  function updateSlideWidth() {
    container.style.width = (slideWidth + 1) * slideCountNew + 'px'; // + 1 => fix half-pixel issue
    for (var i = slideCountNew; i--;) {
      slideItems[i].style.width = (slideWidth - gutter) + 'px';
    }
  }

  // (slideWidth, index, items) => gallery_visible_slide.left
  function updateSlidePosition() {
    for (var i = index + 1, len = index + items; i < len; i++) {
      slideItems[i].style.left = slideWidth * (i - index) + 'px';
    }
  }

  // (vw) => fixedWidth_contentWrapper.edgePadding
  function updateFixedWidthEdgePadding() {
    contentWrapper.style.cssText = 'margin: 0px ' + getFixedWidthEdgePadding() + 'px';
  }

  // (slideEdges, index, items) => vertical_conentWrapper.height
  function updateContentWrapperHeight() {
    contentWrapper.style.height = getVerticalWrapperHeight() + 'px';
  }

  // show or hide nav
  // (navCountVisible) => nav.[hidden]
  function updateNavDisplay() {
    if (navCountVisible !== navCountVisibleCached) {
      if (navCountVisible > navCountVisibleCached) {
        for (var i = navCountVisibleCached; i < navCountVisible; i++) {
          removeAttrs(navItems[i], 'hidden');
        }
      } else {
        for (var j = navCountVisible; j < navCountVisibleCached; j++) {
          setAttrs(navItems[j], {'hidden': ''});
        }
      }
    }
    navCountVisibleCached = navCountVisible;
  }

  function info(e) {
    return {
      container: container,
      slideItems: slideItems,
      navItems: navItems,
      prevButton: prevButton,
      nextButton: nextButton,
      items: items,
      index: index,
      indexCached: indexCached,
      navCurrent: navCurrent,
      navCurrentCached: navCurrentCached,
      slideCount: slideCount,
      cloneCount: cloneCount,
      slideCountNew: slideCountNew,
      event: e || {},
    };
  }

  function resizeTasks() {
    var indexTem = index,
        itemsTem = items;
    getVariables();
    checkSlideCount();
    checkIndex();

    if (axis === 'horizontal') {
      if (fixedWidth && edgePadding) {
        updateFixedWidthEdgePadding();
      } else {
        updateSlideWidth();

        if (mode === 'gallery') {
          updateSlidePosition(); 
        }
      }
      getSlideEdges();
    } else {
      getSlideEdges();
      updateContentWrapperHeight();
    }

    if (index !== indexTem) { 
      events.emit('indexChanged', info());
      updateSlideStatus();
      if (controls && !loop) { updateControlsStatus(); }
    }

    if (nav && items !== itemsTem && !options.navContainer) { 
      updateNavDisplay(); 
      updateNavStatus();
    } 

    if (index !== indexTem || mode === 'carousel' && !fixedWidth) { doTransform(0); }
    if (autoHeight) { runAutoHeight(); }
    if (lazyload && index !== indexTem || items !== itemsTem) { lazyLoad(); }

    if (navigator.msMaxTouchPoints) { setSnapInterval(); }
  }

  function onResize(e) {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (vw !== getViewWidth()) {
        resizeTasks();
        if (nested === 'outer') { 
          events.emit('outerResized', info(e)); 
        }
      }
    }, 100); // update after stop resizing for 100 ms
  }

  return {
    getInfo: info,
    events: events,
    goTo: function (targetIndex) {
      // ** goal: renew index and render smoothly **

      // if target is prev or next, 
      // get the index right away
      if (targetIndex === 'next') {
        index += 1;
      } else if (targetIndex === 'prev' || targetIndex === 'previous' ) {
        index -= 1;
      } else {
      // if target is not prev or next, 
      // get index by comparing absolute target index and absolute index

        // get: absolute index
        var absIndex = index%slideCount, absTargetIndex;
        if (absIndex < 0) { absIndex += slideCount; }

        // get: absolute target index
        if (targetIndex === 'first') {
          absTargetIndex = 0;
        } else if (targetIndex === 'last') {
          absTargetIndex = slideCount - 1;
        } else if (typeof targetIndex === 'number') {
          absTargetIndex = targetIndex%slideCount;
        }
        if (absTargetIndex < 0) { absTargetIndex += slideCount; }

        // get index
        index += absTargetIndex - absIndex;
      }

      // if index is changed, check it and render
      if (index !== indexCached) {
        checkIndex();
        render();
      }

    },

    destory: function () {
      // wrapper
      unwrap(wrapper);
      unwrap(contentWrapper);
      wrapper = contentWrapper = null;

      // container
      removeAttrs(container, ['id', 'style', 'data-tns-role', 'data-tns-features']);

      // cloned items
      if (loop) {
        for (var j = cloneCount; j--;) {
          slideItems[0].remove();
          slideItems[slideItems.length - 1].remove();
        }
      }

      // Slide Items
      removeAttrs(slideItems, ['id', 'style', 'aria-hidden']);
      slideId = slideCount = null;

      // controls
      if (controls) {
        if (!options.controlsContainer) {
          controlsContainer.remove();
          controlsContainer = prevButton = nextButton = null;
        } else {
          removeAttrs(controlsContainer, ['aria-label']);
          removeAttrs(controlsContainer.children, ['aria-controls', 'tabindex']);
          removeEventsByClone(controlsContainer);
        }
      }

      // nav
      if (nav) {
        if (!options.navContainer) {
          navContainer.remove();
          navContainer = null;
        } else {
          removeAttrs(navContainer, ['aria-label']);
          removeAttrs(navItems, ['aria-selected', 'aria-controls', 'tabindex']);
          removeEventsByClone(navContainer);
        }
        navItems = null;
      }

      // auto
      if (autoplay) {
        if (!options.navContainer && navContainer !== null) {
          navContainer.remove();
          navContainer = null;
        } else {
          removeEventsByClone(autoplayButton);
        }
        removeEvents(document, {'visibilitychange': onVisibilityChange});
      }

      // remove slider container events at the end
      // because this will make container = null
      removeEventsByClone(container);

      // remove arrowKeys eventlistener
      if (arrowKeys) {
        removeEvents(document, {'keydown': onKeydownDocument});
      }

      // remove window event listeners
      removeEvents(window, {'resize': onResize});
    },

    // $ Private methods, for test only
    // hasAttr: hasAttr, 
    // getAttr: getAttr, 
    // setAttrs: setAttrs, 
    // removeAttrs: removeAttrs, 
    // removeEventsByClone: removeEventsByClone, 
    // getSlideId: getSlideId, 
    // toDegree: toDegree, 
    // getTouchDirection: getTouchDirection, 
    // hideElement: hideElement, 
    // showElement: showElement,
  };
}
