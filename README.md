# tiny-slider
Pure javascript slider for all purposes, inspired by [Owl Carousel](http://owlcarousel.owlgraphic.com/). 8K compressed.    
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
+ customize dots
+ slide by page
+ autoplay
+ arrow keys driving

## Default setting
```javascript
options = {
  container: document.querySelector('.slider'),
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
    container: document.querySelector('.slider'),
    items: 3,
    slideByPage: true,
    autoplay: true
  });
</script>
```
#### Responsive
```javascript
tinySlider({
  container: document.querySelector('.slider'),
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
  container: document.querySelector('.slider'),
  fixedWidth: 200,
  maxContainerWidth: 900
});
```

#### Non-loop
Loop is `true` by default.
```javascript
tinySlider({
  container: document.querySelector('.slider'),
  items: 3,
  loop: false
});
```
#### Customize dots
```html
<div class="slider">
  <div></div>
  <div></div>
  <div></div>
  <div></div>
  <div></div>
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
  container: document.querySelector('.slider'),
  items: 3,
  navContainer: document.querySelector('.slider-nav'),
  dotsContainer: document.querySelector('.thumbnails')
});
```

#### Slide by page
Default setting is slide by item.
```javascript
tinySlider({
  container: document.querySelector('.slider'),
  items: 3,
  slideByPage: true
});
```

#### Autoplay
```javascript
tinySlider({
  container: document.querySelector('.slider'),
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
  container: document.querySelector('.slider'),
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

