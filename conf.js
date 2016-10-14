exports.config = {
  framework: 'jasmine',
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: ['tests/E2E/tests.js'],
  capabilities: {
    browserName: 'firefox'
  },
  onPrepare: function(){
    global.dv = browser.driver;
    global.isAngularSite = function(flag){
      browser.ignoreSynchronization = !flag;
    };
  },
  sauceUser: 'myUSer',
  sauceKey: 'myKey',
  // multiCapabilities: [{
  //   browserName: 'firefox'
  // }, {
  //   browserName: 'chrome'
  // }, {
  //   browserName: 'safari'
  // }]
}