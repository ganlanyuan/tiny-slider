# tiny-slider 2.0
[![](https://data.jsdelivr.com/v1/package/npm/tiny-slider/badge?style=rounded)](https://www.jsdelivr.com/package/npm/tiny-slider)
![version](https://img.shields.io/badge/Version-2.9.2-green.svg)  
Tiny slider for all purposes, inspired by [Owl Carousel](https://owlcarousel2.github.io/OwlCarousel2/).   
[Demos](http://ganlanyuan.github.io/tiny-slider/demo)   
[Test results](http://ganlanyuan.github.io/tiny-slider/test)
<!-- [Tests for desktop browsers](http://ganlanyuan.github.io/tiny-slider/tests/tests.html) (running on Firefox 12+, Chrome 15+, Safari 5.1+, Opera 12.1+, IE9+)   
[Tests for mobile browsers](http://ganlanyuan.github.io/tiny-slider/tests/tests-mobile.html)  (running on Android Browser 4.2+)    
 -->

*Previous versions*:
[v1](https://github.com/ganlanyuan/tiny-slider/tree/v1),
[v0](https://github.com/ganlanyuan/tiny-slider/tree/v0)  

**Warning**: tiny-slider works with static content and it works in the browser only. If the HTML is loaded dynamically, make sure to call `tns()` after its loading. 

## Contents
\+ [What's new](#whats-new)  
\+ [Features](#features)  
\+ [Install](#install)  
\+ [Usage](#usage)  
\+ [Options](#options)  
\+ [Responsive options](#responsive-options)  
\+ [Methods](#methods)  
\+ [Custom Events](#custom-events)  
\+ [Fallback](#fallback)  
\+ [Browser Support](#browser-support)  
\+ [Support](#support)  
\+ [License](#license)  

## What's new
- Using `%` instead of `px` (No more recalculation of each slide width on window resize)
- Using CSS Mediaqueries if supported
- Save browser capbility values to [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage), so they will not be recheck again until browser get upgraded or user clear the localStorage manually.
- More options available for `responsive`. (Start from [v2.1.0](https://github.com/ganlanyuan/tiny-slider/releases/tag/v2.1.0), [issue 53](https://github.com/ganlanyuan/tiny-slider/issues/53))
- Insert `controls` and `nav` _before_ slider instead of after ([issue 4](https://github.com/ganlanyuan/tiny-slider/issues/4))
- Move `autoplay` button out of `nav` container. (Start from [v2.1.0](https://github.com/ganlanyuan/tiny-slider/releases/tag/v2.1.0))
- Some selector changes in [`tiny-slider.scss`](https://github.com/ganlanyuan/tiny-slider/blob/master/src/tiny-slider.scss)

*Migrating to v2*
- Update `controls` and / or `nav` styles based on their position changes. 
- Update the [`slider selectors`](https://github.com/ganlanyuan/tiny-slider/blob/master/src/tiny-slider.scss) accordingly if used in your CSS or JS.
- Update styles related to `autoplay` button.  

*[top↑](#tiny-slider-20)*  

## Features
<table class="table">
  <thead>
    <tr>
      <th rowspan="3">&nbsp;</th>
      <th colspan="4">Carousel *</th>
      <th rowspan="3">Gallery</th>
    </tr>
    <tr>
      <th colspan="3">Horizontal *</th>
      <th rowspan="2">Vertical</th>
    </tr>
    <tr>
      <th>Percentage Width *</th>
      <th>Fixed Width</th>
      <th>Auto Width</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Loop</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
    </tr>
    <tr>
      <td>Rewind</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>&nbsp;</td>
    </tr>
    <tr>
      <td>Slide by</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>&nbsp;</td>
    </tr>
    <tr>
      <td>Gutter</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
    </tr>
    <tr>
      <td>Edge padding</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>&nbsp;</td>
    </tr>
    <tr>
      <td>Center (v2.9.2+)</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>&nbsp;</td>
      <td>&nbsp;</td>
    </tr>
    <tr>
      <td>Responsive</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
    </tr>
    <tr>
      <td>Lazyload</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
    </tr>
    <tr>
      <td>Autoplay</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
    </tr>
    <tr>
      <td>Auto height</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
    </tr>
    <tr>
      <td>Touch/drag</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
    </tr>
    <tr>
      <td>Arrow keys</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
    </tr>
    <tr>
      <td>Customize controls/nav</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
    </tr>
    <tr>
      <td>Accessibility</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
    </tr>
    <tr>
      <td>Respond to DOM visibility changes</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
    </tr>
    <tr>
      <td>Custom events</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
    </tr>
    <tr>
      <td>Nested</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
    </tr>
  </tbody>
</table>
<small>* Default</small>

*[top↑](#tiny-slider-20)*  

## Install
`bower install tiny-slider` or `npm install tiny-slider`

## Usage
#### 1. Add CSS (and IE8 polyfills if needed)
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/tiny-slider/2.9.2/tiny-slider.css">
<!--[if (lt IE 9)]><script src="https://cdnjs.cloudflare.com/ajax/libs/tiny-slider/2.9.2/min/tiny-slider.helper.ie8.js"></script><![endif]-->
```

#### 2. Add markup
```html
<div class="my-slider">
  <div></div>
  <div></div>
  <div></div>
</div>
<!-- or ul.my-slider > li -->
```

#### 3. Call tns()
Add tiny-slider.js to your page:  
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/tiny-slider/2.9.2/min/tiny-slider.js"></script>
<!-- NOTE: prior to v2.2.1 tiny-slider.js need to be in <body> -->
```

Or import `tns` via `webpack` or `rollup`:
```javascript
// yourScript.js
import { tns } from "./node_modules/tiny-slider/src/tiny-slider"
```

Or import `tns` directly start from v2.9.2  
```html
<script type="module">
  import {tns} from './src/tiny-slider.js';

  var slider = tns({
    container: '.my-slider',
    items: 3,
    slideBy: 'page',
    autoplay: true
  });
  </script>
```
*[top↑](#tiny-slider-20)*  

## Options

| Option | Type | Description |
| --- | --- | --- |
| `container` | Node \| String | Default: `'.slider'`. <br> The slider container element or selector. |
| `mode` | "carousel" \| "gallery" | Default: "carousel". <br> Controls animation behaviour. <br> With `carousel` everything slides to the side, while `gallery` uses fade animations and changes all slides at once. |
| `axis` | "horizontal" \| "vertical" | Default: "horizontal". <br> The axis of the slider. |
| `items` | positive number | Default: 1. <br> Number of slides being displayed in the viewport. <br> If slides less than `items`, the slider won't be initialized. |
| `gutter` | positive integer | Default: 0. <br> Space between slides (in "px"). |
| `edgePadding` | positive integer | Default: 0. <br> Space on the outside (in "px"). |
| `fixedWidth` | positive integer \| false | Default: false. <br> Controls `width` attribute of the slides. |
| `autoWidth` | Boolean | Default: false. <br> If `true`, the width of each slide will be its natural width as a `inline-block` box. |
| `viewportMax` (was `fixedWidthViewportWidth`) | positive integer \| false | Default: false. <br> Maximum viewport width for `fixedWidth`/`autoWidth`. |
| `slideBy` | positive number \| "page" | Default: 1. <br> Number of slides going on one "click". |
| `center` (v2.9.2+) | Boolean | Default: false. <br> Center the active slide in the viewport. |
| `controls` | Boolean | Default: true. <br> Controls the display and functionalities of `controls` components (prev/next buttons). If `true`, display the `controls` and add all functionalities. <br>For better accessibility, when a prev/next button is focused, user will be able to control the slider using left/right arrow keys.|
| `controlsPosition` | "top" \| "bottom" | Default: "top". <br> Controls `controls` position. |
| `controlsText` | (Text \| Markup) Array | Default: ["prev", "next"]. <br> Text or markup in the prev/next buttons. |
| `controlsContainer` | Node \| String \| false | Default: false. <br> The container element/selector around the prev/next buttons. <br> `controlsContainer` must have at least 2 child elements. |
| `prevButton` | Node \| String \| false | Default: false. <br> Customized previous buttons. <br> This option will be ignored if `controlsContainer` is a Node element or a CSS selector. |
| `nextButton` | Node \| String \| false | Default: false. <br> Customized next buttons. <br> This option will be ignored if `controlsContainer` is a Node element or a CSS selector. |
| `nav` | Boolean | Default: true. <br> Controls the display and functionalities of `nav` components (dots). If `true`, display the `nav` and add all functionalities. |
| `navPosition` | "top" \| "bottom" | Default: "top". <br> Controls `nav` position. |
| `navContainer` | Node \| String \| false | Default: false. <br> The container element/selector around the dots. <br> `navContainer` must have at least same number of children as the slides. |
| `navAsThumbnails` | Boolean | Default: false. <br> Indecate if the dots are thurbnails. If `true`, they will always be visible even when more than 1 slides displayed in the viewport. |
| `arrowKeys` | Boolean | Default: false. <br> Allows using arrow keys to switch slides. |
| `speed` | positive integer | Default: 300. <br> Speed of the slide animation (in "ms"). |
| `autoplay` | Boolean | Default: false. <br> Toggles the automatic change of slides. |
| `autoplayPosition` | "top" \| "bottom" | Default: "top". <br> Controls `autoplay` position. |
| `autoplayTimeout` | positive integer | Default: 5000. <br> Time between 2 `autoplay` slides change (in "ms"). |
| `autoplayDirection` | "forward" \| "backward" | Default: "forward". <br> Direction of slide movement (ascending/descending the slide index). |
| `autoplayText` | Array (Text \| Markup) | Default: ["start", "stop"]. <br> Text or markup in the autoplay start/stop button. |
| `autoplayHoverPause` | Boolean | Default: false. <br> Stops sliding on mouseover. |
| `autoplayButton` | Node \| String \| false | Default: false. <br> The customized autoplay start/stop button or selector. |
| `autoplayButtonOutput` | Boolean | Default: true. <br> Output `autoplayButton` markup when `autoplay` is true but a customized `autoplayButton` is not provided. |
| `autoplayResetOnVisibility` | Boolean | Default: true. <br> Pauses the sliding when the page is invisiable and resumes it when the page become visiable again. ([Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)) |
| `animateIn` | String | Default: "tns-fadeIn". <br> Name of intro animation `class`. |
| `animateOut` | String | Default: "tns-fadeOut". <br> Name of outro animation `class`. |
| `animateNormal` | String | Default: "tns-normal". <br> Name of default animation `class`. |
| `animateDelay` | positive integer \| false | Default: false. <br> Time between each `gallery` animation (in "ms"). |
| `loop` | Boolean | Default: true. <br> Moves throughout all the slides seamlessly. |
| `rewind` | Boolean | Default: false. <br> Moves to the opposite edge when reaching the first or last slide. |
| `autoHeight` | Boolean | Default: false. <br> Height of slider container changes according to each slide's height. |
| `responsive` | Object: { <br>&emsp;breakpoint: { <br>&emsp;&emsp;key: value<br>&emsp;} <br>} \| false | Default: false. <br>Breakpoint: Integer.<br>Defines options for different viewport widths (see [Responsive Options](#responsive-options)). <br> |
| `lazyload` | Boolean | Default: false. <br> Enables lazyloading images that are currently not viewed, thus saving bandwidth (see [demo](http://ganlanyuan.github.io/tiny-slider/tests/#lazyload_wrapper)). <br> NOTE: <br>+ Class `.tns-lazy-img` need to be set on every image you want to lazyload if option `lazyloadSelector` is not specified; <br>+ `data-src` attribute with its value of the real image `src` is requierd; <br>+ `width` attribute for every image is required for `autoWidth` slider. |
| `lazyloadSelector` (v2.9.2+) | String | Default: `'.tns-lazy-img'`. <br> The CSS selector for lazyload images. |
| `touch` | Boolean | Default: true. <br> Activates input detection for touch devices. |
| `mouseDrag` | Boolean | Default: false. <br> Changing slides by dragging them. |
| `swipeAngle` | positive integer \| Boolean | Default: 15. <br> Swipe or drag will not be triggered if the angle is not inside the range when set. |
| `preventActionWhenRunning` (v2.9.2+) | Boolean | Default: false. <br> Prevent next transition while slider is transforming. |
| `preventScrollOnTouch` (v2.9.2+) | "auto" \| "force" \| false | Default: false. <br> Prevent page from scrolling on `touchmove`. If set to "auto", the slider will first check if the touch direction matches the slider axis, then decide whether prevent the page scrolling or not. If set to "force", the slider will always prevent the page scrolling. |
| `nested` | "inner" \| "outer" \| false | Default: false. <br> Difine the relationship between nested sliders. (see [demo](http://ganlanyuan.github.io/tiny-slider/demo/#nested_wrapper)) <br>Make sure you run the inner slider first, otherwise the height of the inner slider container will be wrong. |
| `freezable` | Boolean | Default: true. <br> Indicate whether the slider will be frozen (`controls`, `nav`, `autoplay` and other functions will stop work) when all slides can be displayed in one page. |
| `disable` | Boolean | Default: false. <br> Disable slider. |
| `startIndex` | positive integer | Default: 0. <br> The initial `index` of the slider. |
| `onInit` | Function \| false | Default: false. <br> Callback to be run on initialization. |
| `useLocalStorage` | Boolean | Default: true. <br> Save browser capability variables to [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) and without detecting them everytime the slider runs if set to `true`. |

NOTE:   
Prior to v2.0.2, options "container", "controlsContainer", "navContainer" and "autoplayButton" still need to be DOM elements.  
E.g. container: document.querySelector('.my-slider')  

*[top↑](#tiny-slider-20)*  

## Responsive options
The following options can be redefined in `responsive` field:  
`startIndex`,   
`items`,   
`slideBy`,   
`speed`,   
`autoHeight`,   
`fixedWidth`,   
`edgePadding`,   
`gutter`,   
`center`,   
`controls`,   
`controlsText`,   
`nav`,   
`autoplay`,   
`autoplayHoverPause`,   
`autoplayResetOnVisibility`,   
`autoplayText`,   
`autoplayTimeout`,   
`touch`,   
`mouseDrag`,   
`arrowKeys`,   
`disable`   
```javascript
<script>
  var slider = tns({
    container: '.my-slider',
    items: 1,
    responsive: {
      640: {
        edgePadding: 20,
        gutter: 20,
        items: 2
      },
      700: {
        gutter: 30
      },
      900: {
        items: 3
      }
    }
  });
</script>
```
NOTE: 
+ The breakpoints behave like `(min-width: breakpoint)` in CSS, so an undefined option will be inherited from previous small breakpoints.
+ `fixedWidth` can only be changed to other positive integers. It can't be changed to negative integer, 0 or other data type.
*[top↑](#tiny-slider-20)*  

## Methods
The slider returns a slider object with some properties and methods once it's initialized:
```javascript
{
  version: version, // tiny-slider version
  getInfo: info(),
  events: events, // Object
  goTo: goTo(),
  play: play(),
  pause: pause(),
  isOn: isOn, // Boolean
  updateSliderHeight: updateInnerWrapperHeight(),
  refresh: initSliderTransform(),
  destroy: destroy(),
  rebuild: rebuild()
}
```
To get the slider information, you can either use the `getInfo()` method or subscribe to an Event. Both return an Object:   
```javascript
{
                container: container, // slider container
               slideItems: slideItems, // slides list
             navContainer: navContainer, // nav container
                 navItems: navItems, // dots list
        controlsContainer: controlsContainer, // controls container
              hasControls: hasControls, // indicate if controls exist
               prevButton: prevButton, // previous button
               nextButton: nextButton, // next button
                    items: items, // items on a page
                  slideBy: slideBy // items slide by
               cloneCount: cloneCount, // cloned slide count
               slideCount: slideCount, // original slide count
            slideCountNew: slideCountNew, // total slide count after initialization
                    index: index, // current index
              indexCached: indexCached, // previous index
             displayIndex: getCurrentSlide(), // display index starts from 1
               navCurrent: navCurrent, // current dot index
         navCurrentCached: navCurrentCached, // previous dot index
                    pages: pages, // visible nav indexes
              pagesCached: pagesCached,
                    sheet: sheet,
                    event: e || {}, // event object if available
};
```

#### getInfo
Get slider information.
```javascript
slider.getInfo();

document.querySelector('.next-button').onclick = function () {
  // get slider info
  var info = slider.getInfo(),
      indexPrev = info.indexCached,
      indexCurrent = info.index;

  // update style based on index
  info.slideItems[indexPrev].classList.remove('active');
  info.slideItems[indexCurrent].classList.add('active');
};
```

#### goTo
Go to specific slide by number or keywords.   
```javascript
slider.goTo(3);
slider.goTo('prev');
slider.goTo('next');
slider.goTo('first');
slider.goTo('last');

document.querySelector('.goto-button').onclick = function () {
  slider.goTo(3);
};
```

#### play
Programmatically start slider autoplay when `autoplay: true`.
```javascript
slider.play();
```

#### pause
Programmatically stop slider autoplay when `autoplay: true`.
```javascript
slider.pause();
```

#### updateSliderHeight
Manually adjust slider height when `autoHeight` is `true`.
```javascript
slider.updateSliderHeight();
```

#### destroy
Destroy the slider.
```javascript
slider.destroy();
```

#### rebuild
Rebuild the slider after destroy.
```javascript
slider = slider.rebuild();
// this method returns a new slider Object with the same options with the original slider
```

## Custom Events
Available events include: `indexChanged`, `transitionStart`, `transitionEnd`, `newBreakpointStart`, `newBreakpointEnd`, `touchStart`, `touchMove`, `touchEnd`, `dragStart`, `dragMove` and `dragEnd`.
```javascript
var customizedFunction = function (info, eventName) {
  // direct access to info object
  console.log(info.event.type, info.container.id);
}

// bind function to event
slider.events.on('transitionEnd', customizedFunction);

// remove function binding
slider.events.off('transitionEnd', customizedFunction);
```
*[top↑](#tiny-slider-20)*  

#### Fallback
```css
.no-js .your-slider { overflow-x: auto; }
.no-js .your-slider > div { float: none; }
```

## Browser Support
**Desktop:**  
Firefox 8+ ✓  
Chrome 15+ ✓  (Should works on _Chrome 4-14_ as well, but I couldn't test it.)  
Safari 4+ ✓  
Opera 12.1+ ✓   
IE 8+ ✓  

**Mobile:**  
Android Browser 4.2+ ✓  
Chrome Mobile 63+ ✓  
Firefox Mobile 28+ ✓   
Maxthon 4+ ✓

## Support
<a href="https://www.browserstack.com/" target="_blank"><img src="logos/browserstack.svg" alt="Browser Stack" width="170"></a><br>Live tests and Automated Tests <br>
<br>
<a href="https://crossbrowsertesting.com/" target="_blank"><img src="logos/cbt.svg" width="230" alt="Cross Browser Testing"></a><br>Live tests, Screenshots and Automated Tests <br>
<br>
[Cdnjs](https://cdnjs.com/)  
<br>
Images on demo page are from https://unsplash.com/.

## License
This project is available under the [MIT](https://opensource.org/licenses/mit-license.php) license.  
