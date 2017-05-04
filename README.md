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
Have a look at the [demo](http://ganlanyuan.github.io/tiny-slider/tests/) page, or check out some [examples](examples.md) of usage.

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `container` | Method | `document.querySelector('.slider')` | Defines `id` or `class` of the slider container. |
| mode | `'carousel'` | `'gallery'` | `'carousel'` | Controls animation behaviour. With `carousel` everything slides to the side, while `gallery` uses fade animations and changes all slides at once. |
| `axis` | `'horizontal'` | `'vertical'` | `horizontal` | Self-explanatory, isn't it? |
| `items` | Integer | `1` | Number of slides being displayed. |
| `gutter` | Integer | `0` | Space between slides. |
| `edgePadding` | Integer | `0` | Space on the outside. |
| `fixedWidth` | Boolean | `false` | Controls `width` attribute of the slides. |
| `slideBy` | Integer | `'page'` | `1` | Number of slides going, whether individually or all at once. |
| `controls` | Boolean?? | `true` | ?? |
| `controlsText` | Array | `['prev', 'next']` | Text describing the prev/next buttons. |
| `controlsContainer` | Method | `false` | `false` | Defines `id` or `class` of the container around the prev/next buttons. |
| `nav` | Boolean?? | `true` | ?? |
| `navContainer` | Method | `false` | `false` | Defines `id` or `class` of the container around the autoplay start/stop button. |
| `arrowKeys` | Boolean | `false` | Allows using arrow keys to switch slides. |
| `speed` | Integer | `300` | Speed of the slide animation (in `ms`). |
| `autoplay` | Boolean | `false` | Toggles the automatic change of slides. |
| `autoplayTimeout` | Integer | `5000` | Time until `autoplay` slides change (in `ms`). |
| `autoplayDirection` | `'forward'` | `'backward'` | `'forward'` | Direction of slide movement (ascending/descending the slide index). |
| `autoplayText` | Array | `['start', 'stop']` | Text describing the autoplay start/stop button. |
| `autoplayHoverPause` | Boolean | `false` | Stops sliding on mouseover. |
| `autoplayButton` | Method | `false` | `false` | Defines `id` or `class` of the autoplay start/stop button. |
| `autoplayResetOnVisibility` | Boolean | `true` | ?? |
| `animateIn` | String | `'tns-fadeIn'` | Name of intro animation `class`. |
| `animateOut` | String | `'tns-fadeOut'` | Name of outro animation `class`. |
| `animateNormal` | String | `'tns-normal'` | Name of default animation `class`. |
| `animateDelay` | Integer | `false` | `false` | Time until `gallery` animation (in `ms`). |
| `loop` | Boolean | `true` | Toggles behaviour when reaching the last slide. |
| `autoHeight` | Boolean | `false` | Height of slider container changes according to each slide's height. |
| `responsive` | Array | `false` | `false` | Defines number of slides for different viewport widths (see [example](https://github.com/ganlanyuan/tiny-slider/blob/master/examples.md#responsive)). |
| `lazyload` | Boolean | `false` | Enables lazyloading images that are currently not viewed, thus saving bandwidth (see [example](https://github.com/ganlanyuan/tiny-slider/blob/master/examples.md#lazyload)). |
| `touch` | Boolean | `true` | Activates input detection for touch devices. |
| `mouseDrag` | Boolean | `false` | Changing slides by dragging them. |
| `rewind` | Boolean | `false` | Controls whether slides start at the beginning after reaching the last slide. |
| `nested` | Boolean | `false` | ?? |
| `onInit` | Function | `false` | `false` | Callback to be run on initialization. |

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
