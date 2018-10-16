this.base = function(browser) {
  browser
  .url('https://9347cf1c.ngrok.io/tests/')
  .setValue('.goto-controls input', '50')
  .click('.goto-controls button')
  .assert.containsText('#base .tns-slide-active a', '6')
  .end();
};