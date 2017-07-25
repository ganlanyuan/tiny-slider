// DEVELOPMENT

// from go-native
import "../../go-native/src/utilities/childNode.remove";
import "../../go-native/src/vendors/token-list";
import { extend } from "../../go-native/src/gn/extend";

// helper functions
import { checkStorageValue } from './helpers/checkStorageValue';
import { setLocalStorage } from './helpers/setLocalStorage';
import { getSlideId } from './helpers/getSlideId';
import { calc } from './helpers/calc';
import { subpixelLayout } from './helpers/subpixelLayout';
import { mediaquerySupport } from './helpers/mediaquerySupport';
import { createStyleSheet } from './helpers/createStyleSheet';
import { addCSSRule } from './helpers/addCSSRule';
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
import { getEndProperty } from './helpers/getEndProperty';
import { addEvents } from './helpers/addEvents';
import { removeEvents } from './helpers/removeEvents';
import { Events } from './helpers/events';
import { jsTransform } from './helpers/jsTransform';

// check browser version and local storage
// if browser upgraded, 
// 1. delete browser ralated data from local storage and 
// 2. recheck these options and save them to local storage
var browserInfo = navigator.userAgent,
    tnsStorage = localStorage;
if (!tnsStorage['tnsApp']) {
  tnsStorage['tnsApp'] = browserInfo;
} else if (tnsStorage['tnsApp'] !== browserInfo) {
  tnsStorage['tnsApp'] = browserInfo;

  ['tnsCalc', 'tnsSubpixel', 'tnsCSSMQ', 'tnsTf', 'tnsTsDu', 'tnsTsDe', 'tnsAnDu', 'tnsAnDe', 'tnsTsEn', 'tnsAnEn'].forEach(function (item) {
    tnsStorage.removeItem(item);
  })
}

// get browser related data from local storage if they exist
// otherwise, run the functions again and save these data to local storage
// checkStorageValue() convert non-string value to its original value: "true" > true
var doc = document,
    KEYS = {
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
    },
    CALC = checkStorageValue(tnsStorage['tnsCalc'] || setLocalStorage('tnsCalc', calc())),
    SUBPIXEL = checkStorageValue(tnsStorage['tnsSubpixel'] || setLocalStorage('tnsSubpixel', subpixelLayout())),
    CSSMQ = checkStorageValue(tnsStorage['tnsCSSMQ'] || setLocalStorage('tnsCSSMQ', mediaquerySupport())),
    TRANSFORM = checkStorageValue(tnsStorage['tnsTf'] || setLocalStorage('tnsTf', whichProperty([
      'transform', 
      'WebkitTransform', 
      'MozTransform', 
      'msTransform', 
      'OTransform'
    ]))),
    TRANSITIONDURATION = checkStorageValue(tnsStorage['tnsTsDu'] || setLocalStorage('tnsTsDu', whichProperty([
      'transitionDuration', 
      'WebkitTransitionDuration', 
      'MozTransitionDuration', 
      'OTransitionDuration'
    ]))),
    TRANSITIONDELAY = checkStorageValue(tnsStorage['tnsTsDe'] || setLocalStorage('tnsTsDe', whichProperty([
      'transitionDelay', 
      'WebkitTransitionDelay', 
      'MozTransitionDelay', 
      'OTransitionDelay'
    ]))),
    ANIMATIONDURATION = checkStorageValue(tnsStorage['tnsAnDu'] || setLocalStorage('tnsAnDu', whichProperty([
      'animationDuration', 
      'WebkitAnimationDuration', 
      'MozAnimationDuration', 
      'OAnimationDuration'
    ]))),
    ANIMATIONDELAY = checkStorageValue(tnsStorage['tnsAnDe'] || setLocalStorage('tnsAnDe', whichProperty([
      'animationDelay', 
      'WebkitAnimationDelay', 
      'MozAnimationDelay', 
      'OAnimationDelay'
    ]))),
    TRANSITIONEND = checkStorageValue(tnsStorage['tnsTsEn'] || setLocalStorage('tnsTsEn', getEndProperty(TRANSITIONDURATION, 'Transition'))),
    ANIMATIONEND = checkStorageValue(tnsStorage['tnsAnEn'] || setLocalStorage('tnsAnEn', getEndProperty(ANIMATIONDURATION, 'Animation')));

// reset SUBPIXEL for IE8
if (!CSSMQ) { SUBPIXEL = false; }

export var tns = function(options) {
  options = extend({
    container: doc.querySelector('.slider'),
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
    rewind: false,
    autoHeight: false,
    responsive: false,
    lazyload: false,
    touch: true,
    mouseDrag: false,
    nested: false,
    onInit: false
  }, options || {});
  
  // make sure slide container exists
  if (typeof options.container !== 'object' || options.container === null) { return; }

  // === define and set variables ===
  if (options.mode === 'gallery') {
    options.axis = 'horizontal';
    options.edgePadding = false;
    options.loop = true;
    options.autoHeight = true;
    options.slideBy = 'page';

    var animateIn = 'tns-fadeIn',
        animateOut = 'tns-fadeOut',
        animateNormal = 'tns-normal',
        animateDelay = false;

    if (ANIMATIONDURATION) {
      animateIn = options.animateIn;
      animateOut = options.animateOut;
      animateNormal = options.animateNormal;
      animateDelay = options.animateDelay;
    }
  }

  var carousel = (options.mode === 'carousel') ? true : false,
      horizontal = (options.axis === 'horizontal') ? true : false,
      outerWrapper = doc.createElement('div'),
      innerWrapper = doc.createElement('div'),
      container = options.container,
      containerParent = container.parentNode,
      slideItems = container.children,
      slideCount = slideItems.length,
      items = Math.min(options.items, slideCount),
      slideBy = (options.slideBy === 'page') ? items : options.slideBy,
      nested = options.nested,
      gutter = options.gutter,
      edgePadding = options.edgePadding,
      fixedWidth = (options.fixedWidth) ? options.fixedWidth + Number(options.gutter) : false,
      arrowKeys = options.arrowKeys,
      speed = options.speed,
      rewind = options.rewind,
      loop = (options.rewind)? false : options.loop,
      autoHeight = options.autoHeight,
      responsive = (fixedWidth) ? false : options.responsive,
      breakpoints = false,
      sheet = createStyleSheet(),
      lazyload = options.lazyload,
      slideOffsetTops, // collection of slide offset tops
      slideItemsOut = [],
      cloneCount = (loop) ? slideCount * 2 : (edgePadding) ? 1 : 0,
      slideCountNew = (!carousel) ? slideCount + cloneCount : slideCount + cloneCount * 2,
      hasRightDeadZone = (fixedWidth && !loop && !edgePadding)? true : false,
      checkIndexBeforeTransform = (!carousel || !loop)? true : false,
      // transform
      transformAttr = (horizontal)? 'left' : 'top',
      transformPrefix = '',
      transformPostfix = '',
      // index
      index = (!carousel) ? 0 : cloneCount,
      indexCached = index,
      indexAdjust = (edgePadding) ? 1 : 0,
      indexMin = indexAdjust,
      indexMax = slideCountNew - items - indexAdjust,
      // resize
      vw,
      resizeTimer,
      touchedOrDraged,
      running = false,
      onInit = options.onInit,
      events = new Events(),
      // id, class
      containerIdCached = container.id,
      containerClassCached = container.className,
      slideItemIdCached = slideItems[0].id,
      slideItemClassCached = slideItems[0].className,
      slideId = container.id || getSlideId();

  if (responsive) {
    if (!responsive[0]) { responsive[0] = Math.min(options.items, slideCount); }
    breakpoints = Object.keys(responsive).sort(function (a, b) { return a - b; });
  } 

  // controls
  if (options.controls) {
    var controls = options.controls,
        controlsText = options.controlsText,
        controlsContainer = (!options.controlsContainer) ? false : options.controlsContainer,
        prevButton,
        nextButton;
  }

  // nav
  if (options.nav) {
    var nav = options.nav,
        navContainer = options.navContainer || false,
        navItems,
        // navCountVisible = (options.navContainer) ? slideCount : Math.ceil(slideCount / items),
        visibleNavIndexes = [],
        visibleNavIndexesCached = visibleNavIndexes,
        navClicked = -1,
        navCurrent = 0,
        navCurrentCached = 0;
  }

  // autoplay
  if (options.autoplay) {
    var autoplay = options.autoplay,
        autoplayTimeout = options.autoplayTimeout,
        autoplayDirection = (options.autoplayDirection === 'forward') ? 1 : -1,
        autoplayText = options.autoplayText,
        autoplayHoverPause = options.autoplayHoverPause,
        autoplayTimer,
        autoplayButton = options.autoplayButton,
        animating = false,
        autoplayHoverStopped = false,
        autoplayHtmlString = '<span class="tns-visually-hidden">Stop Animation</span>',
        autoplayResetOnVisibility = options.autoplayResetOnVisibility,
        autoplayResetVisibilityState = false;
  }

  // touch
  if (options.touch) {
    var touch = options.touch,
        startX = null,
        startY = null,
        translateInit,
        disX,
        disY;
  }

  //mouse
  if (options.mouseDrag) {
    var mouseDrag = options.mouseDrag,
        mousePressed = false,
        isDragEvent = false;
  }

  if (TRANSFORM) {
    transformAttr = TRANSFORM;
    transformPrefix = 'translate';
    transformPrefix += (horizontal)? 'X(' : 'Y(';
    transformPostfix = ')';
  }

  // === COMMON FUNCTIONS === //
  var getItems = (function () {
    if (fixedWidth) {
      return function () { return Math.max(1, Math.min(slideCount, Math.floor(vw / fixedWidth))); };
    } else {
      return function () {
        var itemsTem;
        breakpoints.forEach(function (key) {
          if (vw >= key) { itemsTem = responsive[key]; }
        });
        return Math.max(1, Math.min(slideCount, itemsTem));
      };
    }
  })();

  events.on('itemsChanged', function () {
    indexMax = slideCountNew - items - indexAdjust;
    if (options.slideBy === 'page') { slideBy = items; }
    // if (nav && !options.navContainer) { navCountVisible = Math.ceil(slideCount / items); }
    updateSlideStatus();
  });

  (function sliderInit() {
    // First thing first, wrap container with "outerWrapper > innerWrapper",
    // to get the correct view width
    outerWrapper.appendChild(innerWrapper);
    containerParent.insertBefore(outerWrapper, container);
    innerWrapper.appendChild(container);

    var dataOuter = 'tns-outer',
        dataInner = 'tns-inner',
        dataContainer = ' tns-slider tns-' + options.mode;

    if (carousel) {
      if (horizontal) {
        if (edgePadding || gutter && !fixedWidth) {
          dataOuter += ' tns-ovh';
        } else {
          dataInner += ' tns-ovh';
        }
      } else {
        dataInner += ' tns-ovh';
      }
    } else {
      dataOuter += ' tns-hdx';
    }

    outerWrapper.className = dataOuter;
    innerWrapper.className = dataInner;

    // set container properties
    if (container.id === '') { container.id = slideId; }
    dataContainer += (SUBPIXEL) ? ' tns-subpixel' : ' tns-no-subpixel';
    dataContainer += (CALC) ? ' tns-calc' : ' tns-no-calc';
    if (carousel) { dataContainer += ' tns-' + options.axis; }
    container.className += dataContainer;

    // delete datas after init
    dataOuter = dataInner = dataContainer = null;

    // set edge padding on innerWrapper
    if (edgePadding) {
      if (fixedWidth) {
        updateFixedWidthEdgePadding();
      } else {
        var gap1 = edgePadding + gutter,
            gap2 = edgePadding;

        innerWrapper.style.cssText += (horizontal) ?
            'margin: 0 ' + gap2 + 'px 0 ' + gap1 + 'px' :
            'padding: ' + gap1 + 'px 0 ' + gap2 + 'px 0';
      }
    }

    // get vw after setting edge padding
    vw = getViewWidth();

    // add id, class, aria attributes 
    // before clone slides
    for (var x = 0; x < slideCount; x++) {
      var item = slideItems[x];
      item.id = slideId + '-item' + x;
      item.classList.add('tns-item');
      if (!carousel && animateNormal) { item.classList.add(animateNormal); }
      setAttrs(item, {
        'aria-hidden': 'true',
        'tabindex': '-1'
      });
    }

    // clone slides
    if (loop || edgePadding) {
      var fragmentBefore = doc.createDocumentFragment(), 
          fragmentAfter = doc.createDocumentFragment();

      for (var j = cloneCount; j--;) {
        var num = j%slideCount,
            cloneFirst = slideItems[num].cloneNode(true);
        removeAttrs(cloneFirst, 'id');
        fragmentAfter.insertBefore(cloneFirst, fragmentAfter.firstChild);

        if (carousel) {
          var cloneLast = slideItems[slideCount - 1 - num].cloneNode(true);
          removeAttrs(cloneLast, 'id');
          fragmentBefore.appendChild(cloneLast);
        }
      }

      container.insertBefore(fragmentBefore, container.firstChild);
      container.appendChild(fragmentAfter);
      slideItems = container.children;
    }

    // update the items before activate visible slides
    if (responsive || fixedWidth) { 
      items = getItems();
      events.emit('itemsChanged');
    }

    // activate visible slides
    // add aria attrs
    // set animation classes and left value for gallery slider
    for (var i = index; i < index + items; i++) {
      var item = slideItems[i];
      setAttrs(item, {'aria-hidden': 'false'});
      removeAttrs(item, ['tabindex']);

      if (!carousel) { 
        item.style.left = (i - index) * 100 / items + '%';
        item.classList.remove(animateNormal);
        item.classList.add(animateIn);
      }
    }

    // append stylesheet
    // == horizontal slider ==
    if (horizontal) {
      var stringSlideLeft =
          stringSlideFontSize = 
          stringSlideGutter = '',
          stringSlideWidth = 'width:';

      // * carousel *
      if (carousel) {
        var stringContainerWidth = 
            stringContainerFontSize = ''; 

        // get container width, slide width
        stringContainerWidth += 'width:';
        if (fixedWidth) {
            stringContainerWidth += fixedWidth * slideCountNew + 'px';
            stringSlideWidth += fixedWidth + 'px';
        } else {
          if (CSSMQ) {
            stringContainerWidth += (CALC) ? 
                CALC + '(' + slideCountNew * 100 + '% / ' + items + ')' : 
                slideCountNew * 100 / items + '%';
          } else {
            updateContainerWidthNonMediaquery();
          }

          stringSlideWidth += (CALC) ? 
              CALC + '(100% / ' + slideCountNew + ')' : 
              100 / slideCountNew + '%';
        }
        stringContainerWidth += ';';

        // get font-size string
        if (SUBPIXEL) {
          var cssFontSize = window.getComputedStyle(slideItems[0]).fontSize;
          // em, rem to px (for IE8-)
          if (cssFontSize.indexOf('em') !== -1) { cssFontSize = Number(cssFontSize.replace(/r?em/, '')) * 16 + 'px'; }

          stringContainerFontSize = ' font-size: 0;';
          stringSlideFontSize = ' font-size: ' + cssFontSize + ';';
        }

        addCSSRule(sheet, '#' + slideId, stringContainerWidth + stringContainerFontSize, getCssRulesLength(sheet));

      // * gallery *
      } else {
        // get slide width
        stringSlideWidth += (CALC) ? 
            CALC + '(100% / ' + items + ')' :
            100 / items + '%';
      }
      stringSlideWidth += ';';

      // set gutter
      if (gutter) {
        if (!edgePadding && !fixedWidth) { innerWrapper.style.marginRight = - gutter + 'px';}
        stringSlideGutter = 'padding-right: ' + gutter + 'px;';
      }

      addCSSRule(sheet, '#' + slideId + ' .tns-item',  stringSlideWidth + stringSlideGutter + stringSlideFontSize, getCssRulesLength(sheet));

      // insert margin-left styles
      // for non-subpixel browsers (webkit)
      // after insert container and slide styles
      if (carousel && !SUBPIXEL) {
        for (var q = 0; q < slideItems.length; q++) {
          var marginLeft = (CALC) ? 
              CALC + '(' + q * 100 + '% / ' + slideCountNew + ')' : 
              q * 100 / slideCountNew + "%";
          // webkit
          if (CSSMQ) {
            sheet.insertRule('#' + slideId + ' .tns-item:nth-child(' + (q + 1) + ') { margin-left: ' + marginLeft + '; }', sheet.cssRules.length);
            
          // IE8
          } else {
            slideItems[q].style.marginLeft = marginLeft;
          }
        }
      }

      // media queries
      if (responsive && CSSMQ) {
        var bpLen = breakpoints.length;
        for (var i = 0; i < bpLen; i++) {
          var bp = breakpoints[i],
              itemsTem = responsive[bp],
              strContainer;

          strContainer = (CALC) ? CALC + '(100% * ' + slideCountNew + ' / ' + itemsTem + ')' : 100 * slideCountNew / itemsTem + '%',
          strContainer = '#' + slideId + '{width: ' + strContainer + '}';

          sheet.insertRule('@media (min-width: ' + bp / 16 + 'em) {' + strContainer + '}', sheet.cssRules.length);
        }
      }

    // vertical slider
    } else {
      // set slide gutter
      if (gutter) {
        if (!edgePadding) { innerWrapper.style.marginBottom = - gutter + 'px';}
        addCSSRule(sheet, '#' + slideId + ' .tns-item', 'margin-bottom: ' + gutter + 'px;', 0);
      }

      getSlideOffsetTops();
      updateContentWrapperHeight();
    }

    // set container transform property
    if (carousel) {
      doContainerTransform();
    }


    // == msInit ==
    // for IE10
    if (navigator.msMaxTouchPoints) {
      outerWrapper.classList.add('ms-touch');
      addEvents(outerWrapper, {'scroll': ie10Scroll});
      setSnapInterval();
    }


    // == navInit ==
    if (nav) {
      // customized nav
      // will not hide the navs in case they're thumbnails
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

      // generated nav 
      } else {
        var navHtml = '';
        for (var i = 0; i < slideCount; i++) {
          // hide nav items by default
          navHtml += '<button data-nav="' + i +'" tabindex="-1" aria-selected="false" aria-controls="' + slideId + '-item' + i +'" hidden type="button"></button>';
        }
        navHtml = '<div class="tns-nav" aria-label="Carousel Pagination">' + navHtml + '</div>';
        outerWrapper.insertAdjacentHTML('afterbegin', navHtml);

        [].forEach.call(outerWrapper.children, function (el) {
          if (el.classList.contains('tns-nav')) { navContainer = el; }
        });
        navItems = navContainer.children;

        updateNavVisibility();
      }

      setAttrs(navItems[0], {'tabindex': '0', 'aria-selected': 'true'});
    }


    // == autoplayInit ==
    if (autoplay) {
      if (autoplayButton) {
        setAttrs(autoplayButton, {'data-action': 'stop'});
      } else {
        if (!navContainer) {
          outerWrapper.insertAdjacentHTML('afterbegin', '<div class="tns-nav" aria-label="Carousel Pagination"></div>');
          navContainer = outerWrapper.querySelector('.tns-nav');
        }

        navContainer.insertAdjacentHTML('beforeend', '<button data-action="stop" type="button">' + autoplayHtmlString + autoplayText[0] + '</button>');
        autoplayButton = navContainer.querySelector('[data-action]');
      }

      // start autoplay
      startAction();
    }


    // == controlsInit ==
    if (controls) {
      if (options.controlsContainer) {
        prevButton = controlsContainer.children[0];
        nextButton = controlsContainer.children[1];
        setAttrs(controlsContainer, {
          'aria-label': 'Carousel Navigation',
          'tabindex': '0'
        });
        setAttrs(prevButton, {'data-controls' : 'prev'});
        setAttrs(nextButton, {'data-controls' : 'next'});
        setAttrs(controlsContainer.children, {
          'aria-controls': slideId,
          'tabindex': '-1',
        });
      } else {
        outerWrapper.insertAdjacentHTML('afterbegin', '<div class="tns-controls" aria-label="Carousel Navigation" tabindex="0"><button data-controls="prev" tabindex="-1" aria-controls="' + slideId +'" type="button">' + controlsText[0] + '</button><button data-controls="next" tabindex="-1" aria-controls="' + slideId +'" type="button">' + controlsText[1] + '</button></div>');

        [].forEach.call(outerWrapper.children, function (el) {
          if (el.classList.contains('tns-controls')) { controlsContainer = el; }
        });
        prevButton = controlsContainer.children[0];
        nextButton = controlsContainer.children[1];
      }

      if (!loop) { prevButton.disabled = true; }
    }


    // == addSliderEvents ==
    if (carousel) {
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
          'click': onNavClick,
          'keydown': onNavKeydown
        });
      }
    }

    if (controls) {
      addEvents(controlsContainer, {'keydown': onControlKeydown});
      addEvents(prevButton,{'click': onPrevClick});
      addEvents(nextButton,{'click': onNextClick});
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
      addEvents(document, {'keydown': onDocumentKeydown});
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

    checkSlideCount();

    lazyLoad();
    runAutoHeight();

    if (typeof onInit === 'function') {
      onInit(info());
    }

    if (nested === 'inner') { 
      events.emit('innerLoaded', info()); 
    }
  })();





// === ON RESIZE ===
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

  function resizeTasks() {
    vw = getViewWidth();
    var indexTem = index, itemsTem = items;
    if (responsive || fixedWidth) { items = getItems(); }

    // things always do 
    // regardless of items changing
    if (!horizontal) {
      getSlideOffsetTops();
      updateContentWrapperHeight();
      doContainerTransform();
    }
    if (fixedWidth && edgePadding) { updateFixedWidthEdgePadding(); }
    runAutoHeight(); 
    
    // things do only when items changed
    if (responsive && items !== itemsTem) {
      events.emit('itemsChanged');
      checkSlideCount();
      checkIndex();

      // update container width on non-mediaquery browser
      if (!fixedWidth && !CSSMQ) {
        updateContainerWidthNonMediaquery();
      }

      doTransform(0); 
      lazyLoad(); 
      updateNavVisibility();
      updateNavStatus();

      if (index !== indexTem) { 
        events.emit('indexChanged', info());
        updateControlsStatus();
      }
      if (navigator.msMaxTouchPoints) { setSnapInterval(); }
    }
  }





  // === INITIALIZATION FUNCTIONS === //
  function getViewWidth () {
    return outerWrapper.clientWidth;
  }

  // compare slide count & items
  // (items) => nav, controls, autoplay
  function checkSlideCount() {
    // a. slide count < items
    //  => disable nav, controls, autoplay
    if (slideCount <= items) { 
      arrowKeys = false;

      var indexTem;
      index = (!carousel) ? 0 : cloneCount;
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

  function getCssRulesLength (sheet) {
    return (sheet.cssRules) ? sheet.cssRules.length : sheet.rules.length;
  }

  function updateContainerWidthNonMediaquery () {
    container.style.width = slideCountNew * 100 / items + '%';
  }

  // (slideBy, indexMin, indexMax) => index
  var checkIndex = (function () {
    if (loop) {
      return function () {
        var leftEdge = indexMin, rightEdge = indexMax;
        if (carousel) {
          leftEdge += slideBy;
          rightEdge -= slideBy;
        }

        if (fixedWidth && vw%(fixedWidth + gutter) !== 0) { rightEdge -= 1; }

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

  // lazyload
  function lazyLoad() {
    if (lazyload) {
      var i = index, 
          len = index + items;
          
      if (edgePadding) {
        i -=1;
        len +=1;
      }

      for(; i < len; i++) {
        [].forEach.call(slideItems[i].querySelectorAll('.tns-lazy-img'), function (img) {
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
  }

  // check if all visible images are loaded
  // and update container height if it's done
  function runAutoHeight() {
    if (autoHeight) {
      // get all images inside visible slide items
      var images = [];

      for (var i = index; i < index + items; i++) {
        [].forEach.call(slideItems[i].querySelectorAll('img'), function (img) {
          images.push(img);
        });
      }

      if (images.length === 0) {
        updateInnerWrapperHeight(); 
      } else {
        checkImagesLoaded(images);
      }
    }
  }

  function checkImagesLoaded(images) {
    images.forEach(function (img, index) {
      if (imageLoaded(img)) { images.splice(index, 1); }
    });

    if (images.length === 0) {
      updateInnerWrapperHeight();
    } else {
      setTimeout(function () { 
        checkImagesLoaded(images); 
      }, 16);
    }
  } 


  // update inner wrapper height
  // 1. get the max-height of the visible slides
  // 2. set transitionDuration to speed
  // 3. update inner wrapper height to max-height
  // 4. set transitionDuration to 0s after transition done
  function updateInnerWrapperHeight() {
    var heights = [], maxHeight;
    for (var i = index; i < index + items; i++) {
      heights.push(slideItems[i].offsetHeight);
    }
    maxHeight = Math.max.apply(null, heights);

    if (innerWrapper.style.height !== maxHeight) {
      if (TRANSITIONDURATION) { setDurations(speed); }
      innerWrapper.style.height = maxHeight + 'px';
    }
  }

  // get the distance from the top edge of the first slide to each slide
  // (init) => slideOffsetTops
  function getSlideOffsetTops() {
    slideOffsetTops = [0];
    var topFirst = slideItems[0].getBoundingClientRect().top, attr;
    for (var i = 1; i < slideCountNew; i++) {
      attr = slideItems[i].getBoundingClientRect().top;
      slideOffsetTops.push(attr - topFirst);
    }
  }

  // set snapInterval (for IE10)
  function setSnapInterval() {
    outerWrapper.style.msScrollSnapPointsX = 'snapInterval(0%, ' + (100 / items) + '%)';
  }

  // update slide
  function updateSlideStatus() {
    for (var i = slideCountNew; i--;) {
      var item = slideItems[i];
      // visible slides
      if (i >= index && i < index + items) {
        if (hasAttr(item, 'tabindex')) {
          setAttrs(item, {'aria-hidden': 'false'});
          removeAttrs(item, ['tabindex']);
        }
      // hidden slides
      } else {
        if (!hasAttr(item, 'tabindex')) {
          setAttrs(item, {
            'aria-hidden': 'true',
            'tabindex': '-1'
          });
        }
      }
    }
  }

  // set tabindex & aria-selected on Nav
  function updateNavStatus() {
    // get current nav
    if (nav) {
      navCurrent = (navClicked !== -1) ? navClicked : (!loop && edgePadding) ? (index - 1)%slideCount : index%slideCount;
      navClicked = -1;

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
          }
        });
      }

      if (active.length > 0) {
        active.forEach(function (button) {
          if (button.disabled) {
            button.disabled = false;
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

    if (!carousel) {
      target.style[ANIMATIONDURATION] = duration;
    }
    if (!horizontal) {
      innerWrapper.style[TRANSITIONDURATION] = duration;
    }
  }

  function getContainerTransformValue() {
    var containerTransformValue;
    if (!horizontal) {
      containerTransformValue = - slideOffsetTops[index] + 'px';
    } else {
      if (fixedWidth) {
        containerTransformValue = - fixedWidth * index + 'px';
      } else {
        var denominator = (TRANSFORM) ? slideCountNew : items;
        containerTransformValue = - index * 100 / denominator + '%';
      }
    }
    return containerTransformValue;
  }

  function doContainerTransform(val) {
    if (!val) { val = getContainerTransformValue(); }
    container.style[transformAttr] = transformPrefix + val + transformPostfix;
  }

  // make transfer after click/drag:
  // 1. change 'transform' property for mordern browsers
  // 2. change 'left' property for legacy browsers
  var transformCore = (function () {
    // carousel
    if (carousel) {
      return function (duration, distance) {
        if (!distance) { distance = getContainerTransformValue(); }
        // constrain the distance when non-loop no-edgePadding fixedWidth reaches the right edge
        if (hasRightDeadZone && index === indexMax) {
          var containerRightEdge = (TRANSFORM) ? 
              - ((slideCountNew - items) / slideCountNew) * 100 : 
              - (slideCountNew / items - 1) * 100; 
          distance = Math.max(Number(distance.replace('%', '')), containerRightEdge) + '%';
        }

        if (TRANSITIONDURATION || !duration) {
          doContainerTransform(distance);
          if (speed === 0) { onTransitionEnd(); }
        } else {
          jsTransform(container, transformAttr, transformPrefix, transformPostfix, distance, speed, onTransitionEnd);
        }

        if (!horizontal) { updateContentWrapperHeight(); }
      };

    // gallery
    } else {
      return function () {
        slideItemsOut = [];

        var eve = {};
        eve[TRANSITIONEND] = eve[ANIMATIONEND] = onTransitionEnd;
        removeEvents(slideItems[indexCached], eve);
        addEvents(slideItems[index], eve);

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
            // set item positions
            item.style.left = (i - index) * 100 / items + '%';

            if (TRANSITIONDURATION) { setDurations(speed, item); }
            if (animateDelay && TRANSITIONDELAY) {
              var d = animateDelay * (i - index) / 1000; 
              item.style[TRANSITIONDELAY] = d + 's'; 
              item.style[ANIMATIONDELAY] = d + 's'; 
            }
            item.classList.remove(animateNormal);
            item.classList.add(animateIn);
          }
        })();

        if (!TRANSITIONEND || speed === 0) {
          setTimeout(onTransitionEnd, speed);
        }
      };
    }
  })();

  function doTransform (duration, distance) {
    if (duration === undefined) { duration = speed; }
    if (TRANSITIONDURATION) { setDurations(duration); }
    transformCore(duration, distance);
  }

  function render() {
    running = true;
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

    if (!carousel && slideItemsOut.length > 0) {
      for (var i = 0; i < items; i++) {
        var item = slideItemsOut[i];
        // set item positions
        item.style.left = '';

        if (TRANSITIONDURATION) { setDurations(0, item); }
        if (animateDelay && TRANSITIONDELAY) { 
          item.style[TRANSITIONDELAY] = item.style[ANIMATIONDELAY] = '';
        }
        item.classList.remove(animateOut);
        item.classList.add(animateNormal);
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

    /* update slides, nav, controls after checking ...
     * => legacy browsers who don't support 'event' 
     *    have to check event first, otherwise event.target will cause an error 
     * => or 'gallery' mode: 
     *   + event target is slide item
     * => or 'carousel' mode: 
     *   + event target is container, 
     *   + event.property is the same with transform attribute
     */
    if (!event || 
        !carousel && event.target.parentNode === container || 
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

      // non-loop: always update nav visibility
      // loop: update nav visibility when visibleNavIndexes doesn't contain current index
      if (nav && !loop || 
          nav && loop && visibleNavIndexes.indexOf(index%slideCount) === -1) { 
        updateNavVisibility(); 
      }
      updateNavStatus();
      updateControlsStatus();
      lazyLoad();
      runAutoHeight();

      if (nested === 'inner') { 
        events.emit('innerLoaded', info()); 
      } 
      running = false;
      indexCached = index;
    }

  }

  // # ACTIONS
  function goTo (targetIndex) {
    if (!running) {
      var absIndex = index%slideCount, indexGap;
      if (absIndex < 0) { absIndex += slideCount; }

      switch(targetIndex) {
        case 'next':
          indexGap = 1;
          break;
        case 'prev':
          indexGap = -1;
          break;
        case 'first':
          indexGap = - absIndex;
          break;
        case 'last':
          indexGap = (slideCount - 1) - absIndex;
          break;
        default:
          if (typeof targetIndex === 'number') {
            var absTargetIndex = targetIndex%slideCount;
            if (absTargetIndex < 0) { absTargetIndex += slideCount; }
            if (!loop && edgePadding) { absTargetIndex += 1; }
            indexGap = absTargetIndex - absIndex;
          }
      }

      index += indexGap;
      // check index before compare with indexCached
      if (checkIndexBeforeTransform) { checkIndex(); }

      // if index is changed, start rendering
      if (index%slideCount !== indexCached%slideCount) {
        render();
      }

    }
  }

  // on controls click
  function onControlClick(dir) {
    if (!running) {
      index = index + dir * slideBy;

      render();
    }
  }

  function onPrevClick() {
    onControlClick(-1);
  }

  function onNextClick() {
    // goes to the first if reach the end in rewind mode
    // other wise go to the next
    if(rewind && index === indexMax){
      goTo(0);
    }else{
      onControlClick(1);
    }
  }

  // on nav click
  function onNavClick(e) {
    if (!running) {
      var clickTarget = e.target || e.srcElement,
          navIndex;

      // find the clicked nav item
      while (getAttr(clickTarget, 'data-nav') === null) {
        clickTarget = clickTarget.parentNode;
      }
      navIndex = navClicked = Number(getAttr(clickTarget, 'data-nav'));

      goTo(navIndex);
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
      onControlClick(autoplayDirection);
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
    if (autoplayResetVisibilityState != doc.hidden && animating !== false) {
      doc.hidden ? pauseActionTimer() : resetActionTimer();
    }
    autoplayResetVisibilityState = doc.hidden;
  }

  // keydown events on document 
  function onDocumentKeydown(e) {
    e = e || window.event;
    switch(e.keyCode) {
      case KEYS.LEFT:
        onPrevClick();
        break;
      case KEYS.RIGHT:
        onNextClick();
    }
  }

  // change focus
  function changeFocus(blur, focus) {
    if (typeof blur === 'object' && 
        typeof focus === 'object' && 
        blur === doc.activeElement) {
      blur.blur();
      focus.focus();
    }
  }

  // on key control
  function onControlKeydown(e) {
    e = e || window.event;
    var code = e.keyCode,
        curElement = doc.activeElement;

    switch (code) {
      case KEYS.LEFT:
      case KEYS.UP:
      case KEYS.PAGEUP:
          if (!prevButton.disabled) {
            onPrevClick();
          }
          break;
      case KEYS.RIGHT:
      case KEYS.DOWN:
      case KEYS.PAGEDOWN:
          if (!nextButton.disabled) {
            onNextClick();
          }
          break;
      case KEYS.HOME:
        goTo(0);
        break;
      case KEYS.END:
        goTo(slideCount - 1);
        break;
    }
  }

  // on key nav
  function onNavKeydown(e) {
    e = e || window.event;
    var code = e.keyCode,
        curElement = doc.activeElement,
        dataSlide = Number(getAttr(curElement, 'data-nav')),
        len = visibleNavIndexes.length,
        current = visibleNavIndexes.indexOf(dataSlide),
        navIndex;

    if (options.navContainer) {
      len = slideCount;
      current = dataSlide;
    }

    function getNavIndex(num) {
      return (options.navContainer) ? num : visibleNavIndexes[num];
    }

    switch(code) {
      case KEYS.LEFT:
      case KEYS.PAGEUP:
        if (current > 0) { 
          changeFocus(curElement, navItems[getNavIndex(current - 1)]); 
        }
        break;

      case KEYS.UP:
      case KEYS.HOME:
        if (current > 0) { 
          changeFocus(curElement, navItems[getNavIndex(0)]); 
        }
        break;

      case KEYS.RIGHT:
      case KEYS.PAGEDOWN:
        if (current < len - 1) { 
          changeFocus(curElement, navItems[getNavIndex(current + 1)]); 
        }
        break;

      case KEYS.DOWN:
      case KEYS.END:
        if (current < len - 1) { 
          changeFocus(curElement, navItems[getNavIndex(len - 1)]); 
        }
        break;

      case KEYS.ENTER:
      case KEYS.SPACE:
        if (options.navContainer) {
          onNavClick(e);
        }
        break;
    }
  }

  // IE10 scroll function
  function ie10Scroll() {
    doTransform(0, container.scrollLeft());
    indexCached = index;
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
    if (isLinkElement(getTarget(e)) && e.type !== 'touchstart') { preventDefaultBehavior(e); }

    var ev = (e.type === 'touchstart') ? e.changedTouches[0] : e;
    startX = parseInt(ev.clientX);
    startY = parseInt(ev.clientY);
    translateInit = Number(container.style[transformAttr].replace(transformPrefix, '').replace(transformPostfix, '').replace(/(px|%)/g, ''));

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
    
    // make sure touch started or mouse draged
    if (startX !== null) {
      if (isLinkElement(getTarget(e)) && e.type !== 'touchmove') { preventDefaultBehavior(e); }

      var ev = (e.type === 'touchmove') ? e.changedTouches[0] : e;
      disX = parseInt(ev.clientX) - startX;
      disY = parseInt(ev.clientY) - startY;

      if (getTouchDirection(toDegree(disY, disX), 15) === options.axis) { 
        touchedOrDraged = true;

        if (e.type === 'touchmove') {
          events.emit('touchMove', info(e));
        } else {
          events.emit('dragMove', info(e));
        }

        var x = translateInit;
        if (horizontal) {
          if (fixedWidth) {
            x += disX;
            x += 'px';
          } else {
            var percentageX = (TRANSFORM) ? disX * items * 100 / (vw * slideCountNew): disX * 100 / vw;
            x += percentageX;
            x += '%';
          }
        } else {
          x += disY;
          x += 'px';
        }

        if (TRANSFORM) { setDurations(0); }
        container.style[transformAttr] = transformPrefix + x + transformPostfix;
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

      if (horizontal) {
        var indexMoved = - disX * items / vw;
        indexMoved = (disX > 0) ? Math.floor(indexMoved) : Math.ceil(indexMoved);
        index += indexMoved;
      } else {
        var moved = - (translateInit + disY);
        if (moved <= 0) {
          index = indexMin;
        } else if (moved >= slideOffsetTops[slideOffsetTops.length - 1]) {
          index = indexMax;
        } else {
          var i = 0;
          do {
            i++;
            index = (disY < 0) ? i + 1 : i;
          } while (i < slideCountNew && moved >= slideOffsetTops[i + 1]);
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
  function updateFixedWidthEdgePadding() {
    innerWrapper.style.cssText += 'margin: 0px ' + (outerWrapper.clientWidth%fixedWidth + gutter) / 2 + 'px';
  }

  // (slideOffsetTops, index, items) => vertical_conentWrapper.height
  function updateContentWrapperHeight() {
    innerWrapper.style.height = slideOffsetTops[index + items] - slideOffsetTops[index] + 'px';
  }

  /*
   * get nav item indexes per items
   * add 1 more if the nav items cann't cover all slides
   * [0, 1, 2, 3, 4] / 3 => [0, 3]
   */
  function getVisibleNavIndex() {
    // reset visibleNavIndexes
    visibleNavIndexes = [];

    var temIndex = (!loop && edgePadding) ? (index - 1) : index;
    var absIndexMin = temIndex%slideCount%items;
    while (absIndexMin < slideCount) {
      if (!loop && absIndexMin + items > slideCount) { absIndexMin = slideCount - items; }
      visibleNavIndexes.push(absIndexMin);
      absIndexMin += items;
    }

    // nav count * items < slide count means
    // some slides can not be displayed only by nav clicking
    if (loop && visibleNavIndexes.length * items < slideCount ||
        !loop && visibleNavIndexes[0] > 0) {
      visibleNavIndexes.unshift(0);
    }
  }
  
  /*
   * 1. update visible nav items list
   * 2. add "hidden" attributes to previous visible nav items
   * 3. remove "hidden" attrubutes to new visible nav items
   */
  function updateNavVisibility() {
    if (nav && !options.navContainer) {
      // update visible nav indexes
      getVisibleNavIndex();

      if (visibleNavIndexes !== visibleNavIndexesCached) {
        // add 'hidden' attribute to previous visible navs
        if (visibleNavIndexesCached.length > 0) {
          visibleNavIndexesCached.forEach(function (ind) {
            setAttrs(navItems[ind], {'hidden': ''});
          });
        }

        // remove 'hidden' attribute from visible navs
        if (visibleNavIndexes.length > 0) {
          visibleNavIndexes.forEach(function (ind) {
            removeAttrs(navItems[ind], 'hidden');
          });
        }

        // cache visible nav indexes
        visibleNavIndexesCached = visibleNavIndexes;
      }
    }
  }

  function info(e) {
    return {
      container: container,
      slideItems: slideItems,
      navContainer: navContainer,
      navItems: navItems,
      controlsContainer: controlsContainer,
      prevButton: prevButton,
      nextButton: nextButton,
      items: items,
      slideBy: slideBy,
      cloneCount: cloneCount,
      slideCount: slideCount,
      slideCountNew: slideCountNew,
      index: index,
      indexCached: indexCached,
      navCurrent: navCurrent,
      navCurrentCached: navCurrentCached,
      visibleNavIndexes: visibleNavIndexes,
      visibleNavIndexesCached: visibleNavIndexesCached,
      event: e || {},
    };
  }

  return {
    getInfo: info,
    events: events,
    goTo: goTo,

    destroy: function () {
      // sheet
      sheet.disabled = true;

      // outerWrapper
      containerParent.insertBefore(container, outerWrapper);
      outerWrapper.remove();
      outerWrapper = innerWrapper = null;

      // container
      container.id = containerIdCached || '';
      container.className = containerClassCached || '';
      removeAttrs(container, ['style']);

      // cloned items
      if (loop) {
        for (var j = cloneCount; j--;) {
          slideItems[0].remove();
          slideItems[slideItems.length - 1].remove();
        }
      }

      // Slide Items
      for (var i = slideCount; i--;) {
        slideItems[i].id = slideItemIdCached || '';
        slideItems[i].className = slideItemClassCached || '';
      }
      removeAttrs(slideItems, ['style', 'aria-hidden', 'tabindex']);
      slideId = slideCount = null;

      // controls
      if (controls) {
        if (options.controlsContainer) {
          removeAttrs(controlsContainer, ['aria-label', 'tabindex']);
          removeAttrs(controlsContainer.children, ['aria-controls', 'tabindex']);
          removeEventsByClone(controlsContainer);
        } else {
          controlsContainer = prevButton = nextButton = null;
        }
      }

      // nav
      if (nav) {
        if (options.navContainer) {
          removeAttrs(navContainer, ['aria-label']);
          removeAttrs(navItems, ['aria-selected', 'aria-controls', 'tabindex']);
          removeEventsByClone(navContainer);
        } else {
          navContainer = null;
        }
        navItems = null;
      }

      // auto
      if (autoplay) {
        if (options.navContainer) {
          removeEventsByClone(autoplayButton);
        } else {
          navContainer = null;
        }
        removeEvents(document, {'visibilitychange': onVisibilityChange});
      }

      // remove slider container events at the end
      // because this will make container = null
      removeEventsByClone(container);

      // remove arrowKeys eventlistener
      if (arrowKeys) {
        removeEvents(document, {'keydown': onDocumentKeydown});
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
