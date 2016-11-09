# Examples
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

#### Slide by page
Default setting is slide by item.
```javascript
gn.ready(function () {
  tns({
    container: document.querySelector('.slider'),
    items: 3,
    slideBy: 'page'
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

#### Arrow keys
Run slider by pressing left or right arrow key.
```javascript
tns({
  container: document.querySelector('.slider'),
  items: 3,
  arrowKeys: true
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