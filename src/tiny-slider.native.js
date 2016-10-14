/**
  * tiny-slider
  * @version 0.6.2
  * @author William Lin
  * @license The MIT License (MIT)
  * @github https://github.com/ganlanyuan/tiny-slider/
  */

var tinySlider = (function () {
  'use strict';

  // get supported property, KEYs
  var TRANSITIONDURATION = gn.getSupportedProp([
        'transitionDuration', 
        'WebkitTransitionDuration', 
        'MozTransitionDuration', 
        'OTransitionDuration'
      ]),
      TRANSFORM = gn.getSupportedProp([
        'transform', 
        'WebkitTransform', 
        'MozTransform', 
        'OTransform'
      ]),
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

  function core (options) {
    options = gn.extend({
      container: document.querySelector('.slider'),
      transform: 'horizontal',
      items: 1,
      gutter: 0,
      gutterPosition: 'right',
      edgePadding: 0,
      fixedWidth: false,
      slideByPage: false,
      slideBy: 1,
      controls: true,
      controlsText: ['prev', 'next'],
      controlsContainer: false,
      nav: true,
      navContainer: false,
      arrowKeys: false,
      speed: 250,
      autoplay: false,
      autoplayTimeout: 5000,
      autoplayDirection: 'forward',
      autoplayText: ['start', 'stop'],
      loop: true,
      autoHeight: false,
      responsive: false,
      lazyload: false,
      touch: true,
      rewind: false
    }, options || {});

    // make sure slider container exists
    if (typeof options.container !== 'object' || options.container === null) {
      return {
        init: function () {},
        destory: function () {}
      }; 
    }

    // === define and set variables ===
    var transform = options.transform,
        items = options.items,
        sliderContainer = options.container,
        sliderWrapper = document.createElement('div'),
        slideItems = sliderContainer.children,
        slideCount = slideItems.length,
        gutter = options.gutter,
        gutterPosition = (options.gutterPosition === 'right') ? 'margin-right' : 'margin-left',
        gapAdjust = (options.gutterPosition === 'left') ? gutter : 0,
        edgePadding = options.edgePadding,
        indexAdjust = (edgePadding) ? 1 : 0,
        fixedWidth = options.fixedWidth,
        controls = options.controls,
        controlsText = options.controlsText,
        controlsContainer = (!options.controlsContainer) ? false : options.controlsContainer,
        nav = options.nav,
        navContainer = (!options.navContainer) ? false : options.navContainer,
        arrowKeys = options.arrowKeys,
        speed = (!TRANSITIONDURATION) ? 0 : options.speed,
        autoplay = options.autoplay,
        autoplayTimeout = options.autoplayTimeout,
        autoplayDirection = (options.autoplayDirection === 'forward') ? 1 : -1,
        autoplayText = options.autoplayText,
        rewind = options.rewind,
        loop = (options.rewind) ? false : options.loop,
        autoHeight = options.autoHeight,
        responsive = (fixedWidth) ? false : options.responsive,
        slideByPage = options.slideByPage,
        slideBy = (slideByPage || options.slideBy === 'page') ? items : options.slideBy,
        lazyload = options.lazyload,
        touch = options.touch,

        sliderId,
        slideWidth,
        cloneCount = (loop) ? slideCount : (edgePadding) ? 1 : 0,
        slideCountNew = slideCount + cloneCount * 2,
        prevButton,
        nextButton,
        allNavs,
        navCountVisible,
        navCountVisibleCached = slideCount,
        navClicked = -1,
        navCurrent = 0,
        navCurrentCached = 0,
        index = 0,
        current,
        resizeTimer,
        running = false,
        ticking = false;

    if (autoplay) {
      var autoplayTimer,
          autoplayButton,
          animating = false;
    }

    if (touch) {
      var startX = 0,
          startY = 0,
          translateX = 0,
          distX = 0,
          distY = 0,
          run = false;
    }

    // get items, slideWidth, navCountVisible
    var getItems = (function () {
      if (!fixedWidth) {
        return function () {
          var itemsTem = options.items,
              ww = document.documentElement.clientWidth,
              bpKeys = (typeof responsive === 'object') ? Object.keys(responsive) : false;

          if (bpKeys) {
            for (var i = 0; i < bpKeys.length; i++) {
              if (ww >= bpKeys[i]) { itemsTem = responsive[bpKeys[i]]; }
            }
          }
          return Math.max(1, Math.min(slideCount, itemsTem));
        };

      } else {
        return function () { return Math.max(1, Math.min(slideCount, Math.floor(sliderWrapper.clientWidth / fixedWidth))); };
      }
    })();

    var getSlideWidth = (function () {
      if (fixedWidth) {
        return function () { return fixedWidth + gutter; };
      } else {
        return function () { return (sliderWrapper.clientWidth + gutter - edgePadding * 2) / items; };
      }
    })();

    var getVisibleNavCount = (function () {
      if (options.navContainer) {
        return function () { return slideCount; };
      } else {
        return function () { return Math.ceil(slideCount / items); };
      }
    })();

    var getCurrent = function () { return cloneCount + index; };

    function wrapContainer() {
      sliderWrapper.className = 'tiny-slider';
      gn.wrap(sliderContainer, sliderWrapper);
    }

    function getVariables() {
      items = getItems();
      slideWidth = getSlideWidth();
      navCountVisible = getVisibleNavCount();
      slideBy = (slideByPage || options.slideBy === 'page') ? items : options.slideBy;
    }

    function containerInit() {
      sliderContainer.classList.add('tiny-content', transform);
      sliderContainer.style.cssText = 'width: ' + (slideWidth + 1) * slideCountNew + 'px; ' + 
          'margin-left: ' + (- (cloneCount * slideWidth + gapAdjust)) + 'px; ' + 
          'padding-left: ' + edgePadding + 'px';
    }

    // for IE10
    function msInit() {
      if (navigator.msMaxTouchPoints) {
        sliderWrapper.classList.add('ms-touch');
        sliderWrapper.addEventListener('scroll', ie10Scroll, false);
      }
    }

    // add ids
    function addIds() {
      if (sliderContainer.id === '') {
        sliderContainer.id = sliderId = _getSliderId();
      } else {
        sliderId = sliderContainer.id;
      }
      for (var x = 0; x < slideCount; x++) {
        slideItems[x].id = sliderId + 'item' + x;
      }
    }

    function slideItemsInit() {
      // clone slides
      if (loop || edgePadding) {
        var fragmentBefore = document.createDocumentFragment(), 
            fragmentAfter = document.createDocumentFragment();

        for (var j = cloneCount; j--;) {
          var cloneFirst = slideItems[j].cloneNode(true),
              cloneLast = slideItems[slideCount - 1 - j].cloneNode(true);

          // remove id from cloned slides
          _removeAttrs(cloneFirst, 'id');
          _removeAttrs(cloneLast, 'id');

          fragmentBefore.insertBefore(cloneFirst, fragmentBefore.firstChild);
          fragmentAfter.appendChild(cloneLast);
        }

        sliderContainer.appendChild(fragmentBefore);
        sliderContainer.insertBefore(fragmentAfter, sliderContainer.firstChild);

        slideItems = sliderContainer.children;
      }
      _setAttrs(slideItems, {
        'style': 'width: ' + (slideWidth - gutter) + 'px; ' + 
                  gutterPosition + ': ' + gutter + 'px', 
        'aria-hidden': 'true'
      });
    }

    function controlsInit() {
      if (controls) {
        if (!options.controlsContainer) {
          gn.append(sliderWrapper, '<div class="tiny-controls" aria-label="Carousel Navigation"><button data-controls="prev" tabindex="-1" aria-controls="' + sliderId +'" type="button">' + controlsText[0] + '</button><button data-controls="next" tabindex="0" aria-controls="' + sliderId +'" type="button">' + controlsText[1] + '</button></div>');

          controlsContainer = sliderWrapper.querySelector('.tiny-controls');
        }

        prevButton = controlsContainer.querySelector('[data-controls="prev"]');
        nextButton = controlsContainer.querySelector('[data-controls="next"]');

        if (!_hasAttr(controlsContainer, 'tabindex')) {
          _setAttrs(controlsContainer, {'aria-label': 'Carousel Navigation'});
          _setAttrs(controlsContainer.children, {
            'aria-controls': sliderId,
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
            navHtml += '<button data-slide="' + i +'" tabindex="-1" aria-selected="false" aria-controls="' + sliderId + 'item' + i +'" type="button"></button>';
          }
          if (autoplay) {
            navHtml += '<button data-action="stop" type="button"><span hidden>Stop Animation</span>' + autoplayText[0] + '</button>';
          }
          navHtml = '<div class="tiny-nav" aria-label="Carousel Pagination">' + navHtml + '</div>';
          gn.append(sliderWrapper, navHtml);
          navContainer = sliderWrapper.querySelector('.tiny-nav');
        }
        allNavs = navContainer.querySelectorAll('[data-slide]');

        // for customized nav container
        if (!_hasAttr(navContainer, 'aria-label')) {
          _setAttrs(navContainer, {'aria-label': 'Carousel Pagination'});
          for (var y = 0; y < slideCount; y++) {
            _setAttrs(allNavs[y], {
              'tabindex': '-1',
              'aria-selected': 'false',
              'aria-controls': sliderId + 'item' + y,
            });
          }
        }

        for (var j = navCountVisible; j < slideCount; j++) {
          _setAttrs(allNavs[j], {'hidden': ''});
        }
      }
    }

    function autoplayInit() {
      if (autoplay) {
        if (!navContainer) {
          gn.append(sliderWrapper, '<div class="tiny-nav" aria-label="Carousel Pagination"><button data-action="stop" type="button"><span hidden>Stop Animation</span>' + autoplayText[0] + '</button></div>');
          navContainer = sliderWrapper.querySelector('.tiny-nav');
        }
        autoplayButton = navContainer.querySelector('[data-action]');
        startAction();
      }
    }

    function activateSlider() {
      current = getCurrent();
      for (var i = current; i < current + items; i++) {
        _setAttrs(slideItems[i], {'aria-hidden': 'false'});
      }
      if (controls) {
        _setAttrs(nextButton, {'tabindex': '0'});
      }
      if (nav) {
        _setAttrs(allNavs[0], {'tabindex': '0', 'aria-selected': 'true'});
      }
    }

    function addSliderEvents() {
      if (touch) {
        sliderContainer.addEventListener('touchstart', onPanStart, false);
        sliderContainer.addEventListener('touchmove', onPanMove, false);
        sliderContainer.addEventListener('touchend', onPanEnd, false);
        sliderContainer.addEventListener('touchcancel', onPanEnd, false);
      }
      if (nav) {
        for (var y = 0; y < slideCount; y++) {
          allNavs[y].addEventListener('click', onClickNav, false);
          allNavs[y].addEventListener('keydown', onKeyNav, false);
        }
      }
      if (controls) {
        prevButton.addEventListener('click', onClickControlPrev, false);
        nextButton.addEventListener('click', onClickControlNext, false);
        prevButton.addEventListener('keydown', onKeyControl, false);
        nextButton.addEventListener('keydown', onKeyControl, false);
      }
      if (autoplay) {
        autoplayButton.addEventListener('click', toggleAnimation, false);

        if (controls) {
          prevButton.addEventListener('click', stopAnimation, false );
          nextButton.addEventListener('click', stopAnimation, false );
        }

        if (nav) {
          for (var b = 0; b < slideCount; b++) {
            allNavs[b].addEventListener('click', stopAnimation, false);
          }
        }
      }
      if (arrowKeys) {
        document.addEventListener('keydown', onKeyDocument, false);
      }
      window.addEventListener('resize', onResize, false);
      window.addEventListener('scroll', onScroll, false);
    }

    // lazyload
    function lazyLoad() {
      if (!lazyload || !gn.isInViewport(sliderContainer)) { return; }

      var arr = [], base = index + cloneCount;
      for(var i = base - 1; i < base + items + 1; i++) {
        var imgsTem = slideItems[i].querySelectorAll('.tiny-lazy');
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

    // check if all visible images are loaded
    // and update container height if it's done
    function runAutoHeight() {
      if (!autoHeight) { return; }
      // get all images inside visible slider items
      var images = [];
      current = getCurrent();

      for (var i = current -1; i < current + items; i++) {
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
      wrapContainer();
      getVariables();

      containerInit();
      msInit();
      addIds();
      slideItemsInit();
      controlsInit();
      navInit();
      autoplayInit();
      activateSlider();
      addSliderEvents();

      lazyLoad();
      runAutoHeight();
    }

    function checkSlideCount() {
      if (slideCount <= items) { 
        nav = controls = autoplay = loop = rewind = false; 
        index = 0;

        hideElement(navContainer);
        hideElement(controlsContainer);
        hideElement(autoplayButton);
      } else {
        nav = options.nav;
        controls = options.controls;
        autoplay = options.autoplay;
        loop = (options.rewind) ? false : options.loop;
        rewind = options.rewind;

        if (nav) { showElement(navContainer); }
        if (controls) { showElement(controlsContainer); }
        if (autoplay) { showElement(autoplayButton); }
      }
    }

    function updateLayout() {
      if (!fixedWidth) {
        // + 1: fixed half-pixel issue
        sliderContainer.style.width = (slideWidth + 1) * slideCountNew + 'px'; 
        sliderContainer.style.marginLeft = - (cloneCount * slideWidth + gapAdjust) + 'px';
        for (var i = slideCountNew; i--;) {
          slideItems[i].style.width = slideWidth - gutter + 'px';
        }
      }

      // update edge padding
      if (fixedWidth) {
        var vw = sliderWrapper.clientWidth;            
        sliderContainer.style.paddingLeft = ((vw - slideWidth * Math.floor(vw / slideWidth) + gutter) / 2) + 'px';
      }
    }

    // update container height
    // 1. get the max-height of the visible slides
    // 2. set transitionDuration to speed
    // 3. update container height to max-height
    // 4. set transitionDuration to 0s after transition done
    function updateContainerHeight() {
      var heights = [], maxHeight;
      current = getCurrent();
      for (var i = current - indexAdjust; i < current + items; i++) {
        heights.push(slideItems[i].offsetHeight);
      }
      maxHeight = Math.max.apply(null, heights);

      setTransitionDuration(1);
      sliderContainer.style.height = maxHeight + 'px';
      running = true;
      
      setTimeout(function () {
        running = false;
      }, speed);
    }

    // set snapInterval (for IE10)
    function setSnapInterval() {
      sliderWrapper.style.msScrollSnapPointsX = 'snapInterval(0%, ' + slideWidth + ')';
    }

    // update slide
    function updateSlideStatus() {
      var h1, h2, v1, v2, currentCached = current || cloneCount + slideCount;
      current = getCurrent();
      if (current > currentCached) {
        h1 = currentCached;
        h2 = Math.min(currentCached + items, current);
        v1 = Math.max(currentCached + items, current);
        v2 = current + items;
      } else if (current < currentCached) {
        h1 = Math.max(current + items, currentCached);
        h2 = currentCached + items;
        v1 = current;
        v2 = Math.min(current + items, currentCached);
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

    // show or hide nav.
    // doesn't work on customized nav.
    function updateNavDisplay() {
      if (navCountVisible !== navCountVisibleCached) {
        if (navCountVisible > navCountVisibleCached) {
          for (var i = navCountVisibleCached; i < navCountVisible; i++) {
            _removeAttrs(allNavs[i], 'hidden');
          }
        } else {
          for (var j = navCountVisible; j < navCountVisibleCached; j++) {
            _setAttrs(allNavs[j], {'hidden': ''});
          }
        }
      }
      navCountVisibleCached = navCountVisible;
    }

    // get current nav
    function getNavCurrent() {
      var navCurrentTem;
      if (navClicked === -1) {
        var absoluteIndex = (index < 0) ? index + slideCount : (index >= slideCount) ? index - slideCount : index;
        navCurrentTem = (options.navContainer) ? absoluteIndex : Math.floor(absoluteIndex / items);

        // non-loop & reach the edge
        if (!loop && !options.navContainer && slideCount%items !== 0 && index === slideCount - items) { navCurrentTem += 1; }
      } else {
        navCurrentTem = navClicked;
        navClicked = -1;
      }

      return navCurrentTem;
    }

    // set tabindex & aria-selected on Nav
    function updateNavStatus() {
      if (!nav) { return; }
      navCurrent = getNavCurrent();

      if (navCurrent !== navCurrentCached) {
        _setAttrs(allNavs[navCurrentCached], {
          'tabindex': '-1',
          'aria-selected': 'false'
        });

        _setAttrs(allNavs[navCurrent], {
          'tabindex': '0',
          'aria-selected': 'true'
        });
        navCurrentCached = navCurrent;
      }
    }

    // set 'disabled' to true on controls when reach the edge
    function updateControlsStatus() {
      if (!controls || loop) { return; }
      if (index === 0 || !rewind && index === slideCount - items) {
        var inactive = (index === 0) ? prevButton : nextButton,
            active = (index === 0) ? nextButton : prevButton;

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

    // # renderAfterResize
    function renderAfterResize() {
      getVariables();
      checkSlideCount();

      updateLayout();
      updateNavDisplay();
      if (navigator.msMaxTouchPoints) { setSnapInterval(); }

      setTransitionDuration(0);
      translate();
      afterTransform();
    }

    // set transition duration
    var setTransitionDuration = (function () {
      if (TRANSITIONDURATION) { 
        return function (indexGap) {
          sliderContainer.style[TRANSITIONDURATION] = (speed * indexGap / 1000) + 's';
        };
      } else {
        return function () {};
      }
    })();

    // make transfer after click/drag:
    // 1. change 'transform' property for mordern browsers
    // 2. change 'left' property for legacy browsers
    var translate = (function () {
      if (TRANSFORM) {
        return function (distance) {
          var x = distance || -slideWidth * index;
          sliderContainer.style[TRANSFORM] = 'translate3d(' + x + 'px, 0, 0)';
        };
      } else {
        return function (distance) {
          var x = distance || -slideWidth * index;
          sliderContainer.style.left = x + 'px';
        };
      }
    })();

    // check index after click/drag:
    // if there is not enough room for next transfering,
    // move slide container to a new location without animation
    // |-----|----------|-----|-----|
    // |items|slideCount|items|items|
    function resetIndexAndContainer() {
      var leftEdge = slideBy - cloneCount + indexAdjust,
          rightEdge = slideCount + cloneCount - items - slideBy - 1; // -1: index starts form 0

      if (index < leftEdge || index > rightEdge) {
        (index - slideCount >= leftEdge && index - slideCount <= rightEdge) ? index -= slideCount : index += slideCount;

        running = true;
        setTransitionDuration(0);
        translate();
        running = false;
      }
    }

    // # REPAINT
    function repaint(indexGap) {
      sliderContainer.setAttribute('aria-busy', 'true');

      running = true;
      setTransitionDuration(indexGap);
      translate();

      setTimeout(function () {
        if (loop) { resetIndexAndContainer(); }
        afterTransform();

        running = false;
        sliderContainer.setAttribute('aria-busy', 'false');
      }, speed * indexGap);
    }

    // AFTER TRANSFORM
    // Things need to be done after a transfer:
    // 1. check index
    // 2. add classes to visible slide
    // 3. disable controls buttons when reach the first/last slide in non-loop slider
    // 4. update nav status
    // 5. lazyload images
    // 6. update container height
    function afterTransform() {
      updateSlideStatus();
      updateNavStatus();
      updateControlsStatus();
      lazyLoad();
      runAutoHeight();
    }

    // # ACTIONS
    // on controls click
    function onClickControl(dir) {
      if (!running) {
        var indexTem = index + dir * slideBy,
            indexGap = Math.abs(dir * slideBy);

        index = (loop) ? indexTem : Math.max(0, Math.min(indexTem, slideCount - items));

        repaint(indexGap);
      }
    }

    function onClickControlPrev() {
      onClickControl(-1);
    }

    function onClickControlNext() {
      if(rewind && index === slideCount - items){
        onClickControl((items - slideCount) / slideBy);
      }else{
        onClickControl(1);
      }
    }

    // on doc click
    function onClickNav(e) {
      if (!running) {
        var clickTarget = e.target || e.srcElement,
            navIndex;

        while (gn.indexOf(allNavs, clickTarget) === -1) {
          clickTarget = clickTarget.parentNode;
        }

        navClicked = navIndex = Number(_getAttr(clickTarget, 'data-slide'));

        var indexTem, indexGap;
        indexTem = (options.navContainer) ? navIndex : navIndex * items;
        indexTem = (loop) ? indexTem : Math.min(indexTem, slideCount - items);
        indexGap = Math.abs(indexTem - index);
        index = indexTem;

        repaint(indexGap);
      }
    }

    function startAction() {
      autoplayTimer = setInterval(function () {
        onClickControl(autoplayDirection);
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
    function onKeyDocument(e) {
      e = e || window.event;
      if (e.keyCode === KEY.LEFT) {
        onClickControl(-1);
      } else if (e.keyCode === KEY.RIGHT) {
        if(rewind && index === slideCount - items){
          onClickControl((items - slideCount) / slideBy);
        }else{
          onClickControl(1);
        }
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
    function onKeyControl(e) {
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
            onClickControlNext();
          } else {
            onClickControlPrev();
          }
          break;
      }
    }

    // on key nav
    function onKeyNav(e) {
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
          if (dataSlide !== 0) { changeFocus(curElement, allNavs[0]); }
          break;
        case KEY.RIGHT:
        case KEY.PAGEDOWN:
          if (dataSlide < navCountVisible - 1) { changeFocus(curElement, curElement.nextElementSibling); }
          break;
        case KEY.DOWN:
        case KEY.END:
          if (dataSlide < navCountVisible - 1) { changeFocus(curElement, allNavs[navCountVisible - 1]); }
          break;
        case KEY.ENTER:
        case KEY.SPACE:
          onClickNav(e);
          break;
      }
    }

    // IE10 scroll function
    function ie10Scroll() {
      setTransitionDuration(0);
      translate(sliderContainer.scrollLeft());
    }

    function onPanStart(e) {
      var touchObj = e.changedTouches[0];
      startX = parseInt(touchObj.clientX);
      startY = parseInt(touchObj.clientY);
    }

    function onPanMove(e) {
      var touchObj = e.changedTouches[0];
      distX = parseInt(touchObj.clientX) - startX;
      distY = parseInt(touchObj.clientY) - startY;

      var panDirection = _getPanDirection(_toDegree(distY, distX), 15);
      if (panDirection === 'horizontal' && running === false) { run = true; }
      if (run) {
        var min = (!loop) ? - (slideCount - items) * slideWidth : - (slideCount + cloneCount - items) * slideWidth,
            max = (!loop) ? 0 : cloneCount * slideWidth;

        if (!loop && fixedWidth) { min = - (slideCount * slideWidth - sliderWrapper.clientWidth); }

        translateX = - index * slideWidth + distX;
        translateX = Math.max(min, Math.min( translateX, max));

        setTransitionDuration(0);
        translate(translateX);
        e.preventDefault();
      }
    }

    function onPanEnd(e) {
      var touchObj = e.changedTouches[0];
      distX = parseInt(touchObj.clientX) - startX;

      if (run && distX !== 0) {
        e.preventDefault();
        run = false;
        translateX = - index * slideWidth + distX;

        var indexTem,
            min = (!loop) ? 0 : -cloneCount,
            max = (!loop) ? slideCount - items : slideCount + cloneCount - items;

        indexTem = - (translateX / slideWidth);
        indexTem = (distX < 0) ? Math.ceil(indexTem) : Math.floor(indexTem);
        indexTem = Math.max(min, Math.min(indexTem, max));
        index = indexTem;

        repaint(1);
      }
    }

    // # RESIZE
    function onResize() {
      clearTimeout(resizeTimer);
      // update after resize done
      resizeTimer = setTimeout(function () {
        renderAfterResize();
      }, 100);
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
      init: sliderInit,

      // destory
      destory: function () {
        // sliderWrapper
        gn.unwrap(sliderWrapper);
        sliderWrapper = null;

        // sliderContainer
        sliderContainer.classList.remove('tiny-content', transform);
        _removeAttrs(sliderContainer, ['id', 'style']);

        // cloned items
        if (loop) {
          for (var j = cloneCount; j--;) {
            slideItems[0].remove();
            slideItems[slideItems.length - 1].remove();
          }
        }

        // Slide Items
        _removeAttrs(slideItems, ['id', 'style', 'aria-hidden']);
        sliderId = slideCount = null;

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
            _removeAttrs(allNavs, ['aria-selected', 'aria-controls', 'tabindex']);
            _removeEvents(navContainer);
          }
          allNavs = null;
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
        // because this will make sliderContainer = null
        if (touch) { _removeEvents(sliderContainer); }

        // remove arrowKeys eventlistener
        if (arrowKeys) {
          document.removeEventListener('keydown', arrowKeys, false);
        }

        // remove window event listeners
        window.removeEventListener('resize', onResize, false);
        window.removeEventListener('scroll', onScroll, false);
      },
      // $ Private methods, for test only
      hasAttr: _hasAttr, getAttr: _getAttr, setAttrs: _setAttrs, removeAttrs: _removeAttrs, removeEvents: _removeEvents, getSliderId: _getSliderId, toDegree: _toDegree, getPanDirection: _getPanDirection, nextButton: function () { return nextButton; }, index: function () { return index; },
    };
  }

  // === Private helper functions === //
  function _getSliderId() {
    if (window.tinySliderNumber === undefined) {
      window.tinySliderNumber = 1;
    } else {
      window.tinySliderNumber++;
    }
    return 'tinySlider' + window.tinySliderNumber;
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

  function hideElement(el) {
    if (el.nodeType !== 1) { 
      throw 'el is not a element node.';
      // return;
    }
    if (!_hasAttr(el, 'hidden')) {
      _setAttrs(el, {'hidden': ''});
    }
  }

  function showElement(el) {
    if (el.nodeType !== 1) { 
      throw 'el is not a element node.';
      // return;
    }
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

  return core;
})();