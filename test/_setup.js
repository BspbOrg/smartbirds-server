var _ = require('lodash');
var Promise = require('bluebird');

var setup = {
  serverPrototype: require(__dirname + "/../node_modules/actionhero/actionhero.js").actionheroPrototype,
  testUrl: "http://127.0.0.1:18080/api",

  init: function () {
    var promise;
    if (!setup.server) {
      console.log("    starting test server...");
      setup.server = new setup.serverPrototype();
      promise = Promise.fromNode(setup.server.start.bind(setup.server));
    } else {
      console.log("    restarting test server...");
      promise = Promise.fromNode(setup.server.restart.bind(setup.server));
    }
    return promise.then(function (api) {
      setup.api = api;
    });
  },
  finish: function () {
    return Promise.fromNode(setup.server.stop.bind(setup.server));
  },
  // promisify
  runAction: function (action, params) {
    return Promise.fromNode(function (callback) {
      setup.api.specHelper.runAction(action, params, function (response) {
        callback(null, response);
      });
    });
  },
  runActionAs: function (action, params, user) {
    console.log("=============== " + action + " as " + user);
    return setup.runAction('session:create', {
      email: user,
      password: "secret"
    }).then(function (response) {
      response.should.have.property('csrfToken').and.not.be.empty();
      console.log("=========== logged in as", response.user.isAdmin ? 'admin' : 'user');
      var connection = new setup.api.specHelper.connection();
      connection.params = _.assign({}, params);
      connection.rawConnection.req = {headers: {'x-sb-csrf-token': response.csrfToken}};
      return setup.runAction(action, connection);
    });
  },
  runActionAsAdmin: function (action, params) {
    return setup.runActionAs(action, params, 'admin@smartbirds.com');
  },
  runActionAsUser: function (action, params) {
    return setup.runActionAs(action, params, 'user@smartbirds.com');
  },
  runActionAsGuest: function (action, params) {
    return setup.runAction(action, params);
  },
  describeAs: function (name, runAction, specs) {
    runAction = runAction.bind(setup);
    describe(name, function () {
      specs(runAction);
    });
  },
  describeAsGuest: function (specs) {
    setup.describeAs('guest', setup.runActionAsGuest, specs);
  },
  describeAsUser: function (specs) {
    setup.describeAs('user', setup.runActionAsUser, specs);
  },
  describeAsAdmin: function (specs) {
    setup.describeAs('admin', setup.runActionAsAdmin, specs);
  },
  describeAsRoles: function (roles, specs) {
    roles.forEach(function (role) {
      setup['describeAs' + role](specs);
    });
  },
  describeAllRoles: function (specs) {
    return setup.describeAsRoles(['Guest', 'User', 'Admin'], specs);
  }
};

var exports = module.exports = setup;
