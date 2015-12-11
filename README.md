# tiny-slider
Pure tiny javascript slider for all purposes, inspired by [Owl Carousel](http://owlcarousel.owlgraphic.com/). 12K uncompressed, 7K compressed.   
[demo](http://creatiointl.org/gallery/william/tiny-slider/)

### Install
via bower
```
bower install tiny-slider
```
via npm
```
npm install tiny-slider
```

### Usage
Include `tiny-slider.js` in your html, then call `tinySlider`.
```javascript
<script src="path/to/tiny-slider.js"></script>
<script>
  tinySlider({
    container: document.querySelector('.slider'),
    slideByPage: false,
    loop: false,
    keyboard: true
  });
</script>
```

### Default setting
```javascript
options = { 
  container: document.querySelector('.slider'),
  items: 1,
  slideByPage: false,
  hasNav: true,
  navText: ['prev', 'next'],
  hasDots: true,
  keyboard: false,
  speed: 250,
  autoplay: false,
  autoplayTimeout: 5000,
  autoplayDirection: 'forward',
  loop: true,
  responsive: false
};
```