# Changelog

#### v0.7.0
- Added: slide animation for legacy browsers.

#### v0.6.6
- Fixed: an edge padding issue.

#### v0.6.5
- Fixed: a variable issue in function `updateNavStatus`.

#### v0.6.4
- Fixed: an initialization issue on IE8-9.

#### v0.6.3
- Added: `getIndex` method.
- Improved: set index to real index.
- Improved: use `transitionend` listener instead of `setTimeout`.
- Improved: listen to view width change only on resize.
- Improved: half-pixel issue on IE8.
- Fixed: update clone count to fix a loop issue.
- Fixed: a fixedWidth edgePadding issue.

#### v0.6.2
- Fixed: a conditional statement issue in function `updateLayout`.
- Improved: performance.

#### v0.6.1
- Fixed: a syntax issue in function `setAttrs`.

#### v0.6.0
- Added: `edgePadding` option.
- Added: `slideBy` option.
- Removed: `maxContainerWidth` option.
- Fixed: an `arrowKeys` issue when `rewind` is set to true.
- Improved: nav, controls will be hidden if slide items are fewer or equal to `items`.

#### v0.5.0
- Added: `rewind` option. Thank [faboulaws](https://github.com/ganlanyuan/tiny-slider/pull/10).

#### v0.4.2
- Fixed: a length issue when slider parent element has non-zero `padding`.

#### v0.4.1
- Added: `gutterPosition` option.
- Fixed: `margin` attribute is added even gutter is 0.

#### v0.4.0
- Added: `gutter` option.
- Renamed `tiny-slider.helper.ie8.js` to `tiny-slider.ie8.js`.

#### v0.3.5
- Fix a `package.json` issue.

#### v0.3.2
- A lots of works around accessibility.

#### v0.3.1
- Improved: performance.
- Improved: classList related functions.

#### v0.3.0
- Added: `lazyload` for images.
- Added: touch support for touch devices.
- Fixed: get `device size` instead of `viewport size` on mobile devices.

#### v0.2.2
- Improved: add `tiny-current`, `tiny-visible` classes to current item and visible items.

#### v0.2.1
- Fixed: some syntax issue.
- Fixed: dots' status updating delay on non-transition browsers.
- Fixed: little gap between sliders in IE by changing percent unit to 'px'.
- Fixed: customized dots are unclickable in IE because of `event target` doesn't work properly.

#### v0.2.0
- Added: `navContainer` and `dotsContainer`, now you can use customized nav and dots.
- Improved: now the transition speed is based on how far it's translated.
- Fixed: an position issue while `sliderByPage` is turned on, the last dot is clicked and followed by a `next` button clicking.

#### v0.1.0
- Added: `fixedWidth`.
- Fixed: an issue while child elements are less than `items`.

#### v0.0.3
- Added: check `hasDots` condition.

#### v0.0.2
- Fixed: a parameter issue.

#### v0.0.1
- simplfy

#### v0.0.0
- Initial commit