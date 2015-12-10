# tiny-slider
Pure javascript slider for all purposes, inspired by [Owl Carousel](http://owlcarousel.owlgraphic.com/). 12K uncompressed, 7K compressed.   

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
  container: document.querySelector('.tiny-slider'),
  items: 1,
  slideByPage: false,
  hasNav: true,
  navText: ['prev', 'next'],
  hasDots: true,
  keyboard: false,
  loop: true,
  speed: 250,
  autoplay: false,
  autoplayTimeout: 5000,
  autoplayDirection: 'forward',
  responsive: {
    500: 2,
    800: 3,
  }
}
```