var cbt = require('cbt_tunnels');
var auth = require("./auth.js");

module.exports = {
  beforeEach: function(done) {
    console.log('Starting up tunnel');
    cbt.start({
      'username': auth.username,
      'authkey': auth.authkey,
    }, function(err, data) {
      if (err) {
        done(err);
      } else {
        done(data);
      }
    });
  },
  afterEach: function(done) {
    console.log('Closing Down Tunnel');
    cbt.stop();
    done();
  }
}