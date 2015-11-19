var _ = require('lodash');
var exports = module.exports = {
  serverPrototype: require(__dirname + "/../node_modules/actionhero/actionhero.js").actionheroPrototype,
  testUrl:         "http://127.0.0.1:18080/api",

  init: function(callback){
    var self = this;
    if(!self.server){
      console.log("    starting test server...");
      self.server = new self.serverPrototype();
      self.server.start(function(err, api){
        self.api = api;
        callback();
      });
    }else{
      console.log("    restarting test server...");
      self.server.restart(function(){
        callback();
      });
    }
  },
  finish: function(callback) {
    this.server.stop(function(err){
      callback(err);
    });
  },
  runActionAs: function(action, params, user, next) {
    var self = this;
    console.log("=============== "+action+" as "+user);
    return this.api.specHelper.runAction('session:create', {
      email: user,
      password: "secret"
    }, function (response) {
      response.should.have.property('csrfToken').and.not.be.empty();
      console.log("=========== logged in as", response.user.isAdmin?'admin':'user');
      var connection = new self.api.specHelper.connection();
      connection.params = _.assign({}, params);
      connection.rawConnection.req = {headers:{'x-sb-csrf-token':response.csrfToken}};
      return self.api.specHelper.runAction(action, connection, next);
    });
  },
  runActionAsAdmin: function(action, params, next) {
    return this.runActionAs(action, params, 'admin@smartbirds.com', next);
  },
  runActionAsUser: function(action, params, next) {
    return this.runActionAs(action, params, 'user@smartbirds.com', next);
  },
  runActionAsGuest: function(action, params, next) {
    return this.api.specHelper.runAction(action, params, next);
  }
};
