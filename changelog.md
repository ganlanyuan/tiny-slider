#Changelog

#### v1.0.0 beta
- Totally rewrite with a simple function, co-work with [go-native](https://github.com/ganlanyuan/go-native).
- Better [accessibility](https://www.w3.org/WAI/EO/Drafts/tutorials/sliders/) support for people using keyboard navigation or using screen readers. Thanks [DouglasdeMoura](https://github.com/DouglasdeMoura) for the idea. [[issue 4]](https://github.com/ganlanyuan/tiny-slider/issues/4)
- Improved: optimize scroll and resize events.
- Added: `autoHeight` option.
- Renamed options: `nav` => `controls`, `navText` => `controlsText`, `navContainer` => `controlsContainer`, `dots` => `nav`, `dotsContainer` => `navContainer`.
- Renamed class names: `tiny-current` => `current`, `tiny-visible` => `visible`, `tiny-active` => `active`, `tiny-hide` => `tiny-hidden`, class `disabled` => attribute `disable`.
- Removed: `offset`.
- Fixed: an issue that navs are still active when slides cann't fill their parent.
- Fixed: an issue with `items`, when container width is shorter than one slide in fixedWidth slider.

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