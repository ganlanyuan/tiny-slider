# tiny-slider
Pure tiny javascript slider for all purposes, inspired by [Owl Carousel](http://owlcarousel.owlgraphic.com/). 12K uncompressed, 7K compressed.   
[demo](http://creatiointl.org/gallery/william/tiny-slider/)

### Install

### Usage
```javascript
tinySlider({
  container: document.querySelector('.slider'),
  slideByPage: false,
  loop: false,
  keyboard: true
});
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
}
```