# Changelog

<!-- #### v1.0.0 beta
- Totally rewrite with a simple function, co-work with [go-native](https://github.com/ganlanyuan/go-native).
- Added: [accessibility](https://www.w3.org/WAI/EO/Drafts/tutorials/carousels/) support for people using keyboard navigation or screen readers.    
Thank [DouglasdeMoura](https://github.com/DouglasdeMoura) and [epigeyre](https://github.com/epigeyre) for the idea. [[issue 4]](https://github.com/ganlanyuan/tiny-slider/issues/4)
- Added: `autoHeight` option.
- Added: `autoplay` pause function.
- Added: `destory` method;
- Improved: optimize scroll and resize events.
- Renamed options:   
`nav` => `controls`,   
`navText` => `controlsText`,   
`navContainer` => `controlsContainer`,   
`dots` => `nav`,   
`dotsContainer` => `navContainer`.
- Renamed class names:   
`tiny-current` => `current`,   
`tiny-visible` => `visible`,   
`tiny-active` => `active`,   
class `tiny-hide` => attribute `[hidden]`,   
class `disabled` => attribute `[disable]`,   
class `tiny-prev` => attribute `[data-controls="prev"`,   
class `tiny-next` => attribute `[data-controls="next"`.
- Removed: `offset`.
- Fixed: an issue that navs are still active when slides cann't fill their parent.
- Fixed: an issue with `items`, when container width is shorter than one slide in fixedWidth slider.
 -->

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