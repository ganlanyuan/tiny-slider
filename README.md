# tiny-slider
![version](https://img.shields.io/badge/Version-1.5.0-green.svg)   
Tiny slider for all purposes, inspired by [Owl Carousel](https://owlcarousel2.github.io/OwlCarousel2/).   
<!-- [demo](http://creatiointl.org/william/tiny-slider/v1-new/demo/)    -->
The previous version is still available in branch [v0](https://github.com/ganlanyuan/tiny-slider/tree/v0), you may want to know how to [transfer from v0](transfer.md).

## Install
`bower install tiny-slider` or `npm install tiny-slider`

## Features
- carousel / gallery
- responsive
- fixed width
- vertical slider
- gutter
- edge padding (center)
- loop
- rewind ([pull 10](https://github.com/ganlanyuan/tiny-slider/pull/10))
- slide by
- customize controls / nav
- lazyload
- autoplay
- auto height
- touch support
- mouse drag ([pull 32](https://github.com/ganlanyuan/tiny-slider/pull/32))
- arrow keys
- accessibility for people using keyboard navigation or screen readers ([issue4](https://github.com/ganlanyuan/tiny-slider/issues/4))
- response to visibility changing ([pull 19](https://github.com/ganlanyuan/tiny-slider/pull/29))
- custom events
- nested slider

## Usage
##### 1. Include tiny-slider
```html
<link rel="stylesheet" href="tiny-slider.css">

<!--[if (lt IE 9)]><script src="tiny-slider.ie8.js"></script><![endif]-->
<script src="tiny-slider.js"></script>
```
Or tiny-slider.native + [go-native](https://github.com/ganlanyuan/go-native),
```html
<link rel="stylesheet" href="tiny-slider.css">

<!--[if (lt IE 9)]><script src="go-native.ie8.js"></script><![endif]-->
<script src="go-native.js"></script>
<script src="tiny-slider.native.js"></script>
```
You can import it via `webpack` or `rollup`:
```javascript
import { tns } from "path/to/src/tiny-slider.module"

var slider = tns({
  key: value
});
```

##### 2. Add markup
```html
<!-- markup -->
<div class="slider">
  <div></div>
  <div></div>
  <div></div>
</div>

<!-- or 
<ul class="slider">
  <li></li>
  <li></li>
  <li></li>
</ul> 
-->
```
##### 3. Call tiny-slider on DOM ready
```html
<script>
  gn.ready(function () {
    var slider = tns({
      container: document.querySelector('.slider'),
      items: 3,
      slideBy: 'page',
      autoplay: true
    });
  });
</script>
```
Some [examples](examples.md) of usage.  

## Options
Default:
```javascript
{
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
}
```
## Get slider information
There are two ways to get slider information:   
1. `getInfo` method.   
2. Subscribe to an event.   
Both will return `info` Object:
```javascript
info = {
  container: container, // slider container
  slideItems: slideItems, // slides list
  navItems: navItems, // dots list
  prevButton: prevButton, // previous button
  nextButton: nextButton, // next button
  items: items, // items on a page
  index: index, // current index
  indexCached: indexCached, // previous index
  navCurrent: navCurrent, // current dot index
  navCurrentCached: navCurrentCached, // previous dot index
  slideCount: slideCount, // original slide count
  cloneCount: cloneCount, // cloned slide count
  slideCountNew: slideCountNew, // total slide count after initialization
  event: e || {}, // event object if available
};
```

## Methods
##### getInfo
```javascript
// get info object
var slider = tns(...);
slider.getInfo();

document.querySelector('.next-button').onclick = function () {
  // get slider info
  var info = slider.getInfo(),
      indexPrev = info.indexCached;
      indexCurrent = info.index;

  // update style based on index
  info.slideItems[indexPrev].classList.remove('active');
  info.slideItems[indexCurrent].classList.add('active');
};
```

##### goTo
```javascript
// go to slides by number or keywords
var slider = tns(...);
slider.goTo(3);
slider.goTo('prev');
slider.goTo('previous');
slider.goTo('next');
slider.goTo('first');
slider.goTo('last');

document.querySelector('.goto-button').onclick = function () {
  slider.goTo(3);
};
```

##### destory
```javascript
var slider = tns(...);
slider.destory();
```
## Custom Events
Available events include: <del>`initialized`, </del>`indexChanged`, `transitionStart`, `transitionEnd`, `touchStart`, `touchMove` and `touchEnd`.
```javascript
var slider = tns(...);

var customizedFunction = function (info) {
  // direct access to info object
  console.log(info.event.type, info.container.id);
}

// bind function to event
slider.events.on('transitionEnd', customizedFunction);

// remove function binding
slider.events.off('transitionEnd', customizedFunction);
```
**Initialized**  
The `initialized` event doesn't work actually because the initialization has been finished when you call `var slider = tns(...);`, and it won't fire when you bind function to the event later.   
You can use a fallback function `onInit` instead from [v1.2.0](https://github.com/ganlanyuan/tiny-slider/tree/v1.2.0).
```javascript
var slider = tns({
  // other options
  // ...
  onInit: function (info) {
    console.log(info.container);
  }
})
```  
#### Fallback
```css
.no-js .your-slider { overflow-x: auto; }
.no-js .your-slider > div { float: none; }
```

## Browser Support
Firefox 8+ ✓  
Chrome 15+ ✓  
Safari 4+ ✓  
Opera 11.5+ ✓  
IE 8+ ✓  

It should works on _Chrome 4-14_ as well, but I couldn't test it.  
<del>No animation on IE8-9 since they don't support [CSS3 transition](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Transitions/Using_CSS_transitions).</del> Animation for legacy browsers has been added in [v1.0.2](https://github.com/ganlanyuan/tiny-slider/releases/tag/v1.0.2).

## License
This project is available under the [MIT](https://opensource.org/licenses/mit-license.php) license.  
