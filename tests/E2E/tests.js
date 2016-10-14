describe('base test', function () {
  beforeEach(function () {
    browser.get('http://localhost:3000/tests/E2E/index.html');
  })
  it ('Page title is correct', function () {
    expect(browser.driver.find(by.id('base')).getAttribute('class')).toEqual('base tiny-content horizontal');
  })
});