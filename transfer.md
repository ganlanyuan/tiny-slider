#### From v0 to v1

1. Call `tns()` instead of `tinySlider()`.
2. Option `maxContainerWidth` is not needed, option `slideByPage` is replaced with `slideBy`. You can still get slide-by-page using `slideBy: 'page'`.
3. For customize nav or controls, attributes `[data-controls]`, `[data-slide]` and `[data-action]` are no longer required. They'll be added automatically.