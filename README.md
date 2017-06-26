# tiny-slider
![version](https://img.shields.io/badge/Version-1.5.6-green.svg)   
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
Have a look at the [demo](http://ganlanyuan.github.io/tiny-slider/tests/) page, or check out some [examples](examples.md) of usage.

## Options

| Option | Type | Description |
| --- | --- | --- |
| `container` | Node | Default: `document.querySelector('.slider')`. <br> The slider container element. |
| `mode` | `'carousel'` \| `'gallery'` | Default: `'carousel'`. <br> Controls animation behaviour. <br> With `carousel` everything slides to the side, while `gallery` uses fade animations and changes all slides at once. |
| `axis` | `'horizontal'` \| `'vertical'` | Default: `horizontal`. <br> The axis of the slider. |
| `items` | Integer | Default: `1`. <br> Number of slides being displayed. |
| `gutter` | Integer | Default: `0`. <br> Space between slides (in "px"). |
| `edgePadding` | Integer | Default: `0`. <br> Space on the outside (in "px"). |
| `fixedWidth` | Integer \| false | Default: `false`. <br> Controls `width` attribute of the slides. |
| `slideBy` | Integer \| `'page'` | Default: `1`. <br> Number of slides going on one "click". |
| `controls` | Boolean | Default: `true`. <br> Controls the display and functionalities of `controls` components (prev/next buttons). If `true`, display the `controls` and add all functionalities. |
| `controlsText` | (Text \| Markup) Array | Default: `['prev', 'next']`. <br> Text or markup in the prev/next buttons. |
| `controlsContainer` | Node \| `false` | Default: `false`. <br> The container element around the prev/next buttons. |
| `nav` | Boolean | Default: `true`. <br> Controls the display and functionalities of `nav` components (dots). If `true`, display the `nav` and add all functionalities. |
| `navContainer` | Node \| `false` | Default: `false`. <br> The container around the dots and the autoplay start/stop button. |
| `arrowKeys` | Boolean | Default: `false`. <br> Allows using arrow keys to switch slides. |
| `speed` | Integer | Default: `300`. <br> Speed of the slide animation (in "ms"). |
| `autoplay` | Boolean | Default: `false`. <br> Toggles the automatic change of slides. |
| `autoplayTimeout` | Integer | Default: `5000`. <br> Time between 2 `autoplay` slides change (in "ms"). |
| `autoplayDirection` | `'forward'` \| `'backward'` | Default: `'forward'`. <br> Direction of slide movement (ascending/descending the slide index). |
| `autoplayText` | (Text \| Markup) Array | Default: `['start', 'stop']`. <br> Text or markup in the autoplay start/stop button. |
| `autoplayHoverPause` | Boolean | Default: `false`. <br> Stops sliding on mouseover. |
| `autoplayButton` | Node \| `false` | Default: `false`. <br> The autoplay start/stop button. |
| `autoplayResetOnVisibility` | Boolean | Default: `true`. <br> Pauses the sliding when the page is invisiable and resumes it when the page become visiable again. ([Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)) |
| `animateIn` | String | Default: `'tns-fadeIn'`. <br> Name of intro animation `class`. |
| `animateOut` | String | Default: `'tns-fadeOut'`. <br> Name of outro animation `class`. |
| `animateNormal` | String | Default: `'tns-normal'`. <br> Name of default animation `class`. |
| `animateDelay` | Integer \| `false` | Default: `false`. <br> Time between each `gallery` animation (in "ms"). |
| `loop` | Boolean | Default: `true`. <br> Moves to the first slide with the same direction when reaching the last slide. |
| `rewind` | Boolean | Default: `false`. <br> Moves to the first slide with the opposite direction when reaching the last slide. |
| `autoHeight` | Boolean | Default: `false`. <br> Height of slider container changes according to each slide's height. |
| `responsive` | Map (breakpoint, items) \| `false` | Default: `false`. <br> Defines number of slides for different viewport widths (see [example](https://github.com/ganlanyuan/tiny-slider/blob/master/examples.md#responsive)). |
| `lazyload` | Boolean | Default: `false`. <br> Enables lazyloading images that are currently not viewed, thus saving bandwidth (see [example](https://github.com/ganlanyuan/tiny-slider/blob/master/examples.md#lazyload)). |
| `touch` | Boolean | Default: `true`. <br> Activates input detection for touch devices. |
| `mouseDrag` | Boolean | Default: `false`. <br> Changing slides by dragging them. |
| `nested` | `"inner"` \| `"outer"` \| `false` | Default: `false`. <br> Difine the relationship between nested sliders. (see [demo](http://ganlanyuan.github.io/tiny-slider/tests/nest.html)) |
| `onInit` | Function \| `false` | Default: `false`. <br> Callback to be run on initialization. |

## Get slider information
There are 2 ways to get slider information, each of them returns an `info` Object:   
1. `getInfo` method.   
2. Subscribe to an event.   
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

##### destroy
```javascript
var slider = tns(...);
slider.destroy();
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
The `initialized` event doesn't work actually because the initialization has been finished when you call `var slider = tns(...);`, and it won't fire when you bind the function to the event later.   
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

It should work on _Chrome 4-14_ as well, but I couldn't test it.  
<del>No animations on IE8-9 since they don't support [CSS3 transition](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Transitions/Using_CSS_transitions).</del> Animations for legacy browsers have been added in [v1.0.2](https://github.com/ganlanyuan/tiny-slider/releases/tag/v1.0.2).

## License
This project is available under the [MIT](https://opensource.org/licenses/mit-license.php) license.  
