# tiny-slider
Pure javascript slider for all purposes, inspired by [Owl Carousel](http://owlcarousel.owlgraphic.com/).
Works on morden browsers and IE8+.   
[demo](http://creatiointl.org/gallery/william/tiny-slider/demo/)   
[changelog](https://github.com/ganlanyuan/tiny-slider/blob/master/changelog.md)  

## Install
via bower
```
bower install tiny-slider
```
via npm
```
npm install tiny-slider
```
## Features
+ responsive
+ fixed width
+ loop
+ slide by page
+ customize nav / dots
+ autoplay
+ lazyload
+ touch support
+ arrow keys

## Default setting
```javascript
options = {
  container: '.slider',
  items: 1,
  fixedWidth: false,
  maxContainerWidth: false,
  slideByPage: false,
  nav: true,
  navText: ['prev', 'next'],
  navContainer: false,
  dots: true,
  dotsContainer: false,
  arrowKeys: false,
  speed: 250,
  autoplay: false,
  autoplayTimeout: 5000,
  autoplayDirection: 'forward',
  loop: true,
  responsive: false,
  lazyload: false,
  touch: true
};
```
## Usage
Include `tiny-slider.js` and `tiny.css` in your html, then call `tinySlider`.
```html
<link rel="stylesheet" href="path/to/tiny-slider.css">
<script src="path/to/tiny-slider.js"></script>

<!-- markup -->
<div class="slider">
  <div></div>
  <div></div>
  <div></div>
  <div></div>
  <div></div>
</div>

<!-- or 
<ul class="slider">
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
</ul> 
-->

<script>
  tinySlider({
    container: '.slider',
    items: 3,
    slideByPage: true,
    autoplay: true
  });
</script>
```
#### Responsive
```javascript
tinySlider({
  container: '.slider',
  items: 1,
  responsive: {
    500: 2,
    800: 3,
  }
});
```

#### Fixed width items
```javascript
tinySlider({
  container: '.slider',
  fixedWidth: 200,
  maxContainerWidth: 900
});
```

#### Non-loop
Loop is `true` by default.
```javascript
tinySlider({
  container: '.slider',
  items: 3,
  loop: false
});
```
#### Customize
```html
<div class="slider">
</div>

<!-- customized nav & dots -->
<div class="slider-nav">
  <div></div>
  <div></div>
</div>
<div class="thumbnails">
  <div></div>
  <div></div>
  <div></div>
  <div></div>
  <div></div>
</div>
```
```javascript
tinySlider({
  container: '.slider',
  items: 3,
  navContainer: '.slider-nav',
  dotsContainer: '.thumbnails'
});
```

#### Lazyload
Add a placeholder image to the image `src` attribute, save the real image sourse in the `data-src` attribute, then add class `tiny-lazy`. 
```html
<div class="slider">
  <div><img src="data:image/gif;base64,R0lGODlhAQABAPAAAMzMzAAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" data-src="path/to/img.jpg" alt="" class="tiny-lazy" width="300" height="300"></div>
  <div><img src="data:image/gif;base64,R0lGODlhAQABAPAAAMzMzAAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" data-src="path/to/img.jpg" alt="" class="tiny-lazy" width="300" height="300"></div>
  <div><img src="data:image/gif;base64,R0lGODlhAQABAPAAAMzMzAAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" data-src="path/to/img.jpg" alt="" class="tiny-lazy" width="300" height="300"></div>
  <div><img src="data:image/gif;base64,R0lGODlhAQABAPAAAMzMzAAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" data-src="path/to/img.jpg" alt="" class="tiny-lazy" width="300" height="300"></div>
  <div><img src="data:image/gif;base64,R0lGODlhAQABAPAAAMzMzAAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" data-src="path/to/img.jpg" alt="" class="tiny-lazy" width="300" height="300"></div>
</div>
```
```javascript
tinySlider({
  container: '.slider',
  items: 3,
  lazyload: true
});
```

#### Slide by page
Default setting is slide by item.
```javascript
tinySlider({
  container: '.slider',
  items: 3,
  slideByPage: true
});
```

#### Autoplay
```javascript
tinySlider({
  container: '.slider',
  items: 3,
  autoplay: true,
  autoplayDirection: 'forward',
  speed: 300,
  autoplayTimeout: 3000
});
```

#### Arrow keys
Run slider by pressing left or right arrow key.
```javascript
tinySlider({
  container: '.slider',
  items: 3,
  arrowKeys: true
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

