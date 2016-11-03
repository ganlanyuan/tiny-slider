# tiny-slider
![version](https://img.shields.io/badge/Version-0.6.5-green.svg)   
Tiny slider for all purposes, inspired by [Owl Carousel](http://owlcarousel.owlgraphic.com/).
Works on morden browsers and IE8+.   
[demo](http://creatiointl.org/william/tiny-slider/v1/demo/)   
[changelog](changelog.md)  
[examples](examples.md)  

## Install
```
bower install tiny-slider
```
or
```
npm install tiny-slider
```

## Features
- responsive
- fixed width
- gutter
- edge padding (center)
- loop
- rewind ([pull 10](https://github.com/ganlanyuan/tiny-slider/pull/10))
- slide by page
- slide by
- customize controls / nav
- autoplay
- auto height
- lazyload
- touch support
- arrow keys
- accessibility for people using keyboard navigation or screen readers ([issue4](https://github.com/ganlanyuan/tiny-slider/issues/4))

## Usage
##### 1. Include tiny-slider
Include tiny-slider
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
##### 2. Add your markup
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
    var slider = tinySlider({
      container: document.querySelector('.slider'),
      items: 3,
      slideByPage: true,
      autoplay: true
    });
    slider.init();
  });
</script>
```
## Methods
```javascript
var slider = tinySlider(...);

slider.init();
slider.destory();
slider.getIndex();
```
## Options
Default:
```javascript
{
  container: document.querySelector('.slider'),
  mode: 'carousel',
  direction: 'horizontal',
  items: 1,
  gutter: 0,
  gutterPosition: 'right',
  edgePadding: 0,
  fixedWidth: false,
  // maxContainerWidth: false,
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
}
```
**Note:** `maxContainerWidth` has been removed. `slideByPage` will be removed from version 1.

#### Padding
<del>There is no option for `padding`, but you can add it by css </del>
Now you can set the gutter using `gutter` option.

#### Fallback
```css
.no-js .your-slider { 
  overflow-x: auto; 
  white-space: nowrap; /* make child elements stay in one row */
}
.no-js .your-slider > div { 
  float: none; /* reset float */
  display: inline-block;
  white-space: normal; /* reset white-space */
}
```

## Todo
- vertical slider


## Browser Support
Tested on IE8+ and mordern browsers.

## License
This project is available under the [MIT](https://opensource.org/licenses/mit-license.php) license.  
