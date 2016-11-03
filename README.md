# tiny-slider
![version](https://img.shields.io/badge/Version-1.0.0-green.svg)   
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
- animation
- responsive
- fixed width
- vertical slider
- gutter
- edge padding (center)
- loop
- rewind ([pull 10](https://github.com/ganlanyuan/tiny-slider/pull/10))
- slide by
- customize controls / nav
- autoplay
- auto height
- lazyload
- touch support
- arrow keys
- accessibility for people using keyboard navigation or screen readers ([issue4](https://github.com/ganlanyuan/tiny-slider/issues/4))
- events

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
## Methods
```javascript
var slider = tns(...);

// destory
slider.destory();
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
  edgePadding: 0,
  fixedWidth: false,
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

#### Fallback
```css
.no-js .your-slider { overflow-x: auto; }
.no-js .your-slider > div { float: none; }
```

## Todo


## Browser Support
Tested on IE8+ and mordern browsers.

## License
This project is available under the [MIT](https://opensource.org/licenses/mit-license.php) license.  
