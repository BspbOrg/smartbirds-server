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
      console.log("runAction:", action);
      setup.api.specHelper.runAction(action, params, function (response) {
        callback(null, response);
      });
    });
  },
  runActionAs: function (action, params, user) {
    return setup.runAction('session:create', {
      email: user,
      password: "secret"
    }).then(function (response) {
      response.should.have.property('csrfToken').and.not.be.empty();
      var connection = new setup.api.specHelper.connection();
      connection.params = _.assign({}, params);
      connection.rawConnection.req = {headers: {'x-sb-csrf-token': response.csrfToken}};
      return setup.runAction(action, connection).then(function(actionResponse) {
        actionResponse.requesterUser = response.user;
        return actionResponse;
      });
    });
  },
  runActionAsAdmin: function (action, params) {
    return setup.runActionAs(action, params, 'admin@smartbirds.com');
  },
  runActionAsUser: function (action, params) {
    return setup.runActionAs(action, params, 'user@smartbirds.com');
  },
  runActionAsUser2: function (action, params) {
    return setup.runActionAs(action, params, 'user2@smartbirds.com');
  },
  runActionAsGuest: function (action, params) {
    return setup.runAction(action, params);
  },
  describeAs: function (name, runAction, specs) {
    runAction = runAction.bind(setup);
    return describe(name, function () {
      specs(runAction);
    });
  },
  describeAsGuest: function (specs) {
    return setup.describeAs('guest', setup.runActionAsGuest, specs);
  },
  describeAsUser: function (specs) {
    return setup.describeAs('user', setup.runActionAsUser, specs);
  },
  describeAsAdmin: function (specs) {
    return setup.describeAs('admin', setup.runActionAsAdmin, specs);
  },
  describeAsAuth: function(specs) {
    return setup.describeAsRoles(['user', 'admin'], specs);
  },
  describeAsRoles: function (roles, specs) {
    return Promise.map(roles, function (role) {
      return setup['describeAs' + _.capitalize(role.toLowerCase())](specs);
    });
  },
  describeAllRoles: function (specs) {
    return setup.describeAsRoles(['guest', 'user', 'admin'], specs);
  }
};

var exports = module.exports = setup;
