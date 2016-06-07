# tiny-slider
![version](https://img.shields.io/badge/Version-0.3.1-green.svg)   
Tiny slider for all purposes, inspired by [Owl Carousel](http://owlcarousel.owlgraphic.com/).
Works on morden browsers and IE8+.   
[demo](http://creatiointl.org/william/tiny-slider/v1/demo/)   
[changelog](changelog.md)  

## Install
via bower
```
bower install tiny-slider
```

## Features
- responsive
- fixed width
- loop
- slide by page
- customize controls / nav
- autoplay
- auto height
- lazyload
- touch support
- arrow keys
- accessibility for people using keyboard navigation or screen readers   
(thank [DouglasdeMoura](https://github.com/DouglasdeMoura) and [epigeyre](https://github.com/epigeyre) for the sugestion, [issue4](https://github.com/ganlanyuan/tiny-slider/issues/4))

## Usage
##### 1. Include tiny-slider
Include tiny-slider
```html
<link rel="stylesheet" href="tiny-slider.css">

<!--[if (lt IE 9)]><script src="tiny-slider.helper.ie8.js"></script><![endif]-->
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
    var a = tinySlider({
      container: document.querySelector('.slider'),
      items: 3,
      slideByPage: true,
      autoplay: true
    });
    a.init();
  });
</script>
```

## Options
Default:
```javascript
{
  container: document.querySelector('.slider'),
  items: 1,
  fixedWidth: false,
  maxContainerWidth: false,
  slideByPage: false,
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
  touch: true
}
```

#### Responsive
```javascript
gn.ready(function () {
  var a = tinySlider({
    container: document.querySelector('.slider'),
    items: 1,
    responsive: {
      500: 2,
      800: 3,
    }
  });
  a.init();
});
```

#### Fixed width items
```javascript
gn.ready(function () {
  var a = tinySlider({
    container: document.querySelector('.slider'),
    fixedWidth: 200,
    maxContainerWidth: 900
  });
  a.init();
});
```

#### Non-loop
Loop is `true` by default.
```javascript
gn.ready(function () {
  var a = tinySlider({
    container: document.querySelector('.slider'),
    items: 3,
    loop: false
  });
  a.init();
});
```
#### Customize
```html
<div class="slider">
</div>

<!-- customized nav & dots -->
<!-- Attributes [data-controls], [data-slide] and [data-action] are required -->
<div class="controls">
  <button data-controls="prev"></button>
  <button data-controls="next"></button>
</div>
<div class="thumbnails">
  <button data-slide="0"></button>
  <button data-slide="1"></button>
  <button data-slide="2"></button>
  <button data-slide="3"></button>
  <button data-action="stop">stop</button>
</div>
```
```javascript
gn.ready(function () {
  var a = tinySlider({
    container: document.querySelector('.slider'),
    items: 3,
    controlsContainer: document.querySelector('.controls'),
    navContainer: document.querySelector('.thumbnails')
  });
  a.init();
});
```

#### Lazyload
Add a placeholder image to the image `src` attribute, save the real image sourse in the `data-src` attribute, then add class `tiny-lazy`. 
```html
<!-- class .tiny-lazy is required -->
<div class="slider">
  <div><img src="data:image/gif;base64,R0lGODlhAQABAPAAAMzMzAAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" data-src="path/to/img.jpg" alt="" class="tiny-lazy" width="300" height="300"></div>
  <div><img src="data:image/gif;base64,R0lGODlhAQABAPAAAMzMzAAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" data-src="path/to/img.jpg" alt="" class="tiny-lazy" width="300" height="300"></div>
  <div><img src="data:image/gif;base64,R0lGODlhAQABAPAAAMzMzAAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" data-src="path/to/img.jpg" alt="" class="tiny-lazy" width="300" height="300"></div>
  <div><img src="data:image/gif;base64,R0lGODlhAQABAPAAAMzMzAAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" data-src="path/to/img.jpg" alt="" class="tiny-lazy" width="300" height="300"></div>
  <div><img src="data:image/gif;base64,R0lGODlhAQABAPAAAMzMzAAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" data-src="path/to/img.jpg" alt="" class="tiny-lazy" width="300" height="300"></div>
</div>
```
```javascript
gn.ready(function () {
  var a = tinySlider({
    container: document.querySelector('.slider'),
    items: 3,
    lazyload: true
  });
  a.init();
});
```

#### Slide by page
Default setting is slide by item.
```javascript
gn.ready(function () {
  var a = tinySlider({
    container: document.querySelector('.slider'),
    items: 3,
    slideByPage: true
  });
  a.init();
});
```

#### Autoplay
```javascript
gn.ready(function () {
  var a = tinySlider({
    container: document.querySelector('.slider'),
    items: 3,
    autoplay: true,
    autoplayDirection: 'forward',
    speed: 300,
    autoplayTimeout: 3000
  });
  a.init();
});
```

#### Arrow keys
Run slider by pressing left or right arrow key.
```javascript
var a = tinySlider({
  container: document.querySelector('.slider'),
  items: 3,
  arrowKeys: true
});
a.init();
```

#### Auto height
```javascript
gn.ready(function () {
  var a = tinySlider({
    container: document.querySelector('.slider'),
    items: 3,
    autoHeight: true
  });
  a.init();
});
```

#### * Padding
There is no option for `padding`, but you can add it by css 
```css
.tiny-slider { margin-right: -10px; }
.your-slider > div { padding-right: 10px; }
``` 

#### * Non-javascirpt fallback
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
