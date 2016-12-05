# Examples
#### Gallery
```javascript
gn.ready(function () {
  tns({
    container: document.querySelector('.slider'),
    mode: 'gallery',
    items: 1
  });
});
```

#### Animation
```javascript
gn.ready(function () {
  tns({
    container: document.querySelector('.slider'),
    mode: 'gallery',
    items: 1,
    animateIn: 'jello',
    animateOut: 'rollOut',
    animateDelay: speed * 3,
  });
});
```

#### Responsive
```javascript
gn.ready(function () {
  tns({
    container: document.querySelector('.slider'),
    items: 1,
    responsive: {
      500: 2,
      800: 3,
    }
  });
});
```

#### Fixed width items
```javascript
gn.ready(function () {
  tns({
    container: document.querySelector('.slider'),
    fixedWidth: 200,
  });
});
```

#### vertical slider
```javascript
gn.ready(function () {
  tns({
    container: document.querySelector('.slider'),
    axis: 'vertical',
    items: 3,
  });
});
```

#### gutter
```javascript
gn.ready(function () {
  tns({
    container: document.querySelector('.slider'),
    gutter: 10,
    items: 3,
  });
});
```

#### edge padding
```javascript
gn.ready(function () {
  tns({
    container: document.querySelector('.slider'),
    edgePadding: 50,
    items: 3,
  });
});
```

#### Non-loop
Loop is `true` by default.
```javascript
gn.ready(function () {
  tns({
    container: document.querySelector('.slider'),
    items: 3,
    loop: false
  });
});
```

#### rewind
```javascript
gn.ready(function () {
  tns({
    container: document.querySelector('.slider'),
    rewind: true,
    items: 3,
  });
});
```

#### slide by
```javascript
gn.ready(function () {
  tns({
    container: document.querySelector('.slider'),
    slideBy: 0.5,
    items: 3,
  });
});
```

#### Customize
```html
<div class="slider">
</div>

<!-- customized nav & dots -->
<div class="controls">
  <button>prev</button>
  <button>next</button>
</div>
<div class="thumbnails">
  <button></button>
  <button></button>
  <button></button>
  <button></button>
  <button>stop</button>
</div>
```
```javascript
gn.ready(function () {
  tns({
    container: document.querySelector('.slider'),
    items: 3,
    controlsContainer: document.querySelector('.controls'),
    navContainer: document.querySelector('.thumbnails')
  });
});
```

#### Lazyload
Add a placeholder image to the image `src` attribute, save the real image sourse in the `data-src` attribute, then add class `tiny-lazy`. 
```html
<!-- data-tns-role="lazy-img" is required -->
<div class="slider">
  <div><img src="data:image/gif;base64,R0lGODlhAQABAPAAAMzMzAAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" data-src="path/to/img.jpg" alt="" data-tns-role="lazy-img" width="300" height="300"></div>
  <div><img src="data:image/gif;base64,R0lGODlhAQABAPAAAMzMzAAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" data-src="path/to/img.jpg" alt="" data-tns-role="lazy-img" width="300" height="300"></div>
  <div><img src="data:image/gif;base64,R0lGODlhAQABAPAAAMzMzAAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" data-src="path/to/img.jpg" alt="" data-tns-role="lazy-img" width="300" height="300"></div>
  <div><img src="data:image/gif;base64,R0lGODlhAQABAPAAAMzMzAAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" data-src="path/to/img.jpg" alt="" data-tns-role="lazy-img" width="300" height="300"></div>
  <div><img src="data:image/gif;base64,R0lGODlhAQABAPAAAMzMzAAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" data-src="path/to/img.jpg" alt="" data-tns-role="lazy-img" width="300" height="300"></div>
</div>
```
```javascript
gn.ready(function () {
  tns({
    container: document.querySelector('.slider'),
    items: 3,
    lazyload: true
  });
});
```

#### Autoplay
```javascript
gn.ready(function () {
  tns({
    container: document.querySelector('.slider'),
    items: 3,
    autoplay: true,
    autoplayDirection: 'forward',
    speed: 300,
    autoplayTimeout: 3000
  });
});
```

#### Auto height
```javascript
gn.ready(function () {
  tns({
    container: document.querySelector('.slider'),
    items: 3,
    autoHeight: true
  });
});
```

#### Arrow keys
Run slider by pressing left or right arrow key.
```javascript
tns({
  container: document.querySelector('.slider'),
  items: 3,
  arrowKeys: true
});
```

