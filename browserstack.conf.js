nightwatch_config = {
  src_folders : [ 'test/scripts' ],

  selenium : {
    'start_process': false,
    'host': 'hub-cloud.browserstack.com',
    'port': 80
  },

  common_capabilities: {
    'browserstack.user': '${BS_USERNAME}',
    'browserstack.key': '${BS_ACCESS_KEY}'
  },

  test_settings: {
    default: {
      desiredCapabilities: {
        'os': 'Windows',
        'os_version': '7',
        'browser': 'Chrome',
        'browser_version': '14.0',
        'resolution': '1024x768'
      }
    },
    chrome: {
      desiredCapabilities: {
        'os': 'Windows',
        'os_version': '7',
        'browser': 'Chrome',
        'browser_version': '14.0',
        'resolution': '1024x768'
      }
    },
    firefox: {
      desiredCapabilities: {
        'os': 'Windows',
        'os_version': '7',
        'browser': 'Firefox',
        'browser_version': '12.0',
        'resolution': '1024x768'
      }
    },
    ie: {
      desiredCapabilities: {
        'os': 'Windows',
        'os_version': '7',
        'browser': 'IE',
        'browser_version': '9.0',
        'resolution': '1024x768'
      }
    },
    edge: {
      desiredCapabilities: {
        'os': 'Windows',
        'os_version': '10',
        'browser': 'Edge',
        'browser_version': '15.0',
        'resolution': '1024x768'
      }
    },
    safari: {
      desiredCapabilities: {
        'os': 'OS X',
        'os_version': 'Snow Leopard',
        'browser': 'Safari',
        'browser_version': '5.1',
        'resolution': '1024x768'
      }
    },
    opera: {
      desiredCapabilities: {
        'os': 'Windows',
        'os_version': '7',
        'browser': 'Opera',
        'browser_version': '12.15',
        'resolution': '1024x768'
      }
    },
  }
};

// Code to support common capabilites
for(var i in nightwatch_config.test_settings){
  var config = nightwatch_config.test_settings[i],
      browser_name = i;
  config['selenium_host'] = nightwatch_config.selenium.host;
  config['selenium_port'] = nightwatch_config.selenium.port;
  config['desiredCapabilities'] = config['desiredCapabilities'] || {};
  config['globals'] = {
    'browser_name': browser_name,
    'abortOnAssertionFailure': false
  };
  for(var j in nightwatch_config.common_capabilities){
    config['desiredCapabilities'][j] = config['desiredCapabilities'][j] || nightwatch_config.common_capabilities[j];
    // config['desiredCapabilities']['browserstack.local'] = true;
  }
}

module.exports = nightwatch_config;