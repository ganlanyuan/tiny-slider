var screenshotPath = 'test/screenshot/',
    baseurl = 'https://441d0a8e.ngrok.io/test/',
    timeout = 10000,
    classDone = '.test-done',
    extHtml = '.html',
    extImage = '.png';

function elementPresentCallback (result, str) {
  if (result.state && result.state === 'success') {} else {
    console.log(str + ' failed');
  }
}

this.features = function(browser) {
    var bn = browser.globals.browser_name;

  browser
    .url(baseurl + 'animation1' + extHtml)
    .waitForElementPresent(classDone, timeout, 'animation1')
    .saveScreenshot(screenshotPath + bn + '/' + 'animation1' + extImage)

    .url(baseurl + 'animation2' + extHtml)
    .waitForElementPresent(classDone, timeout, 'animation2')
    .saveScreenshot(screenshotPath + bn + '/' + 'animation2' + extImage)

    .url(baseurl + 'arrowKeys' + extHtml)
    .waitForElementPresent(classDone, timeout, 'arrowKeys')
    .saveScreenshot(screenshotPath + bn + '/' + 'arrowKeys' + extImage)

    .url(baseurl + 'autoHeight' + extHtml)
    .waitForElementPresent(classDone, timeout, 'autoHeight')
    .saveScreenshot(screenshotPath + bn + '/' + 'autoHeight' + extImage)

    .url(baseurl + 'autoplay' + extHtml)
    .waitForElementPresent(classDone, timeout, 'autoplay')
    .saveScreenshot(screenshotPath + bn + '/' + 'autoplay' + extImage)

    .url(baseurl + 'base' + extHtml)
    .waitForElementPresent(classDone, timeout, 'base')
    .saveScreenshot(screenshotPath + bn + '/' + 'base' + extImage)

    .url(baseurl + 'center-non-loop' + extHtml)
    .waitForElementPresent(classDone, timeout, 'center-non-loop')
    .saveScreenshot(screenshotPath + bn + '/' + 'center-non-loop' + extImage)

    .url(baseurl + 'center-loop' + extHtml)
    .waitForElementPresent(classDone, timeout, 'center-loop')
    .saveScreenshot(screenshotPath + bn + '/' + 'center-loop' + extImage)

    .url(baseurl + 'center-fixedWidth-non-loop' + extHtml)
    .waitForElementPresent(classDone, timeout, 'center-fixedWidth-non-loop')
    .saveScreenshot(screenshotPath + bn + '/' + 'center-fixedWidth-non-loop' + extImage)

    .url(baseurl + 'center-fixedWidth-loop' + extHtml)
    .waitForElementPresent(classDone, timeout, 'center-fixedWidth-loop')
    .saveScreenshot(screenshotPath + bn + '/' + 'center-fixedWidth-loop' + extImage)

    .url(baseurl + 'center-autoWidth-non-loop' + extHtml)
    .waitForElementPresent(classDone, timeout, 'center-autoWidth-non-loop')
    .saveScreenshot(screenshotPath + bn + '/' + 'center-autoWidth-non-loop' + extImage)

    .url(baseurl + 'center-autoWidth-loop' + extHtml)
    .waitForElementPresent(classDone, timeout, 'center-autoWidth-loop')
    .saveScreenshot(screenshotPath + bn + '/' + 'center-autoWidth-loop' + extImage)

    .url(baseurl + 'center-autoWidth-non-loop-edgePadding' + extHtml)
    .waitForElementPresent(classDone, timeout, 'center-autoWidth-non-loop-edgePadding')
    .saveScreenshot(screenshotPath + bn + '/' + 'center-autoWidth-non-loop-edgePadding' + extImage)

    .url(baseurl + 'center-autoWidth-loop-edgePadding' + extHtml)
    .waitForElementPresent(classDone, timeout, 'center-autoWidth-loop-edgePadding')
    .saveScreenshot(screenshotPath + bn + '/' + 'center-autoWidth-loop-edgePadding' + extImage)

    .url(baseurl + 'center-lazyload-non-loop' + extHtml)
    .waitForElementPresent(classDone, timeout, 'center-lazyload-non-loop')
    .saveScreenshot(screenshotPath + bn + '/' + 'center-lazyload-non-loop' + extImage)

    .url(baseurl + 'center-lazyload-loop' + extHtml)
    .waitForElementPresent(classDone, timeout, 'center-lazyload-loop')
    .saveScreenshot(screenshotPath + bn + '/' + 'center-lazyload-loop' + extImage)

    .url(baseurl + 'center-lazyload-fixedWidth-non-loop' + extHtml)
    .waitForElementPresent(classDone, timeout, 'center-lazyload-fixedWidth-non-loop')
    .saveScreenshot(screenshotPath + bn + '/' + 'center-lazyload-fixedWidth-non-loop' + extImage)

    .url(baseurl + 'center-lazyload-fixedWidth-loop' + extHtml)
    .waitForElementPresent(classDone, timeout, 'center-lazyload-fixedWidth-loop')
    .saveScreenshot(screenshotPath + bn + '/' + 'center-lazyload-fixedWidth-loop' + extImage)

    .url(baseurl + 'center-lazyload-autoWidth-non-loop' + extHtml)
    .waitForElementPresent(classDone, timeout, 'center-lazyload-autoWidth-non-loop')
    .saveScreenshot(screenshotPath + bn + '/' + 'center-lazyload-autoWidth-non-loop' + extImage)

    .url(baseurl + 'center-lazyload-autoWidth-loop' + extHtml)
    .waitForElementPresent(classDone, timeout, 'center-lazyload-autoWidth-loop')
    .saveScreenshot(screenshotPath + bn + '/' + 'center-lazyload-autoWidth-loop' + extImage)

    .url(baseurl + 'customize' + extHtml)
    .waitForElementPresent(classDone, timeout, 'customize')
    .saveScreenshot(screenshotPath + bn + '/' + 'customize' + extImage)

    .url(baseurl + 'edgePadding-gutter' + extHtml)
    .waitForElementPresent(classDone, timeout, 'edgePadding-gutter')
    .saveScreenshot(screenshotPath + bn + '/' + 'edgePadding-gutter' + extImage)

    .url(baseurl + 'edgePadding' + extHtml)
    .waitForElementPresent(classDone, timeout, 'edgePadding')
    .saveScreenshot(screenshotPath + bn + '/' + 'edgePadding' + extImage)

    .url(baseurl + 'few-items' + extHtml)
    .waitForElementPresent(classDone, timeout, 'few-items')
    .saveScreenshot(screenshotPath + bn + '/' + 'few-items' + extImage)

    .url(baseurl + 'fixedWidth-edgePadding-gutter' + extHtml)
    .waitForElementPresent(classDone, timeout, 'fixedWidth-edgePadding-gutter')
    .saveScreenshot(screenshotPath + bn + '/' + 'fixedWidth-edgePadding-gutter' + extImage)

    .url(baseurl + 'fixedWidth-edgePadding' + extHtml)
    .waitForElementPresent(classDone, timeout, 'fixedWidth-edgePadding')
    .saveScreenshot(screenshotPath + bn + '/' + 'fixedWidth-edgePadding' + extImage)

    .url(baseurl + 'fixedWidth-gutter' + extHtml)
    .waitForElementPresent(classDone, timeout, 'fixedWidth-gutter')
    .saveScreenshot(screenshotPath + bn + '/' + 'fixedWidth-gutter' + extImage)

    .url(baseurl + 'fixedWidth' + extHtml)
    .waitForElementPresent(classDone, timeout, 'fixedWidth')
    .saveScreenshot(screenshotPath + bn + '/' + 'fixedWidth' + extImage)

    .url(baseurl + 'frame1' + extHtml)
    .waitForElementPresent(classDone, timeout, 'frame1')
    .saveScreenshot(screenshotPath + bn + '/' + 'frame1' + extImage)

    .url(baseurl + 'frame2' + extHtml)
    .waitForElementPresent(classDone, timeout, 'frame2')
    .saveScreenshot(screenshotPath + bn + '/' + 'frame2' + extImage)

    .url(baseurl + 'frame3' + extHtml)
    .waitForElementPresent(classDone, timeout, 'frame3')
    .saveScreenshot(screenshotPath + bn + '/' + 'frame3' + extImage)

    // .url(baseurl + 'frame4' + extHtml)
    // .waitForElementPresent(classDone, timeout, false, function(e){ console.log('frametable+ee); }, 'frame4')
    // .saveScreenshot(screenshotPath + bn + '/' + 'frame4' + extImage)

    .url(baseurl + 'frame5' + extHtml)
    .waitForElementPresent(classDone, timeout, 'frame5')
    .saveScreenshot(screenshotPath + bn + '/' + 'frame5' + extImage)

    .url(baseurl + 'frame6' + extHtml)
    .waitForElementPresent(classDone, timeout, 'frame6')
    .saveScreenshot(screenshotPath + bn + '/' + 'frame6' + extImage)

    .url(baseurl + 'gutter' + extHtml)
    .waitForElementPresent(classDone, timeout, 'gutter')
    .saveScreenshot(screenshotPath + bn + '/' + 'gutter' + extImage)

    .url(baseurl + 'lazyload' + extHtml)
    .waitForElementPresent(classDone, timeout, 'lazyload')
    .saveScreenshot(screenshotPath + bn + '/' + 'lazyload' + extImage)

    // .url(baseurl + 'mouse-drag' + extHtml)
    // .waitForElementPresent(classDone, timeout, 'mouse-drag')
    // .saveScreenshot(screenshotPath + bn + '/' + 'mouse-drag' + extImage)

    .url(baseurl + 'nested' + extHtml)
    .waitForElementPresent(classDone, timeout, 'nested')
    .saveScreenshot(screenshotPath + bn + '/' + 'nested' + extImage)

    .url(baseurl + 'non-loop' + extHtml)
    .waitForElementPresent(classDone, timeout, 'non-loop')
    .saveScreenshot(screenshotPath + bn + '/' + 'non-loop' + extImage)

    .url(baseurl + 'rewind' + extHtml)
    .waitForElementPresent(classDone, timeout, 'rewind')
    .saveScreenshot(screenshotPath + bn + '/' + 'rewind' + extImage)

    .url(baseurl + 'slide-by-page' + extHtml)
    .waitForElementPresent(classDone, timeout, 'slide-by-page')
    .saveScreenshot(screenshotPath + bn + '/' + 'slide-by-page' + extImage)

    .url(baseurl + 'vertical-edgePadding-gutter' + extHtml)
    .waitForElementPresent(classDone, timeout, 'vertical-edgePadding-gutter')
    .saveScreenshot(screenshotPath + bn + '/' + 'vertical-edgePadding-gutter' + extImage)

    .url(baseurl + 'vertical-edgePadding' + extHtml)
    .waitForElementPresent(classDone, timeout, 'vertical-edgePadding')
    .saveScreenshot(screenshotPath + bn + '/' + 'vertical-edgePadding' + extImage)

    .url(baseurl + 'vertical-gutter' + extHtml)
    .waitForElementPresent(classDone, timeout, 'vertical-gutter')
    .saveScreenshot(screenshotPath + bn + '/' + 'vertical-gutter' + extImage)

    .url(baseurl + 'vertical' + extHtml)
    .waitForElementPresent(classDone, timeout, 'vertical')
    .saveScreenshot(screenshotPath + bn + '/' + 'vertical' + extImage)

    .url(baseurl + 'start-index' + extHtml)
    .waitForElementPresent(classDone, timeout, 'start-index')
    .saveScreenshot(screenshotPath + bn + '/' + 'start-index' + extImage)

    .end();
};