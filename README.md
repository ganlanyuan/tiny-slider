# tiny-slider
Pure tiny javascript slider for all purposes, inspired by [Owl Carousel](http://owlcarousel.owlgraphic.com/). 12K uncompressed, 7K compressed.   
[demo](http://creatiointl.org/gallery/william/tiny-slider/demo/)   
[changelog](https://github.com/ganlanyuan/tiny-slider/blob/master/changelog.md)  

### Install
via bower
```
bower install tiny-slider
```
via npm
```
npm install tiny-slider
```
### Features
+ responsive
+ fixed width
+ loop
+ slide by page
+ autoplay
+ keyboard driving

### Usage
Include `tiny-slider.js` and `tiny.css` in your html, then call `tinySlider`.
```html
<link rel="stylesheet" href="path/to/tiny-slider.css">
<script src="path/to/tiny-slider.js"></script>
<script>
  tinySlider({
    container: document.querySelector('.slider'),
    slideByPage: false,
    arrowKeys: true
  });
</script>
```
##### Padding
There is no option for `padding`, but you can add it by css 
```css
.tiny-slider { margin-right: -10px; }
.your-slider > div { padding-right: 10px; }
``` 

### Default setting
```javascript
options = { 
  container: document.querySelector('.slider'),
  items: 1,
  fixedWidth: false,
  slideByPage: false,
  nav: true,
  navText: ['prev', 'next'],
  dots: true,
  arrowKeys: false,
  speed: 250,
  autoplay: false,
  autoplayTimeout: 5000,
  autoplayDirection: 'forward',
  loop: true,
  responsive: false,
};
```