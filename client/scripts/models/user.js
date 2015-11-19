/**
 * Created by groupsky on 12.11.15.
 */

var angular = require('angular');

require('../app').factory('User', function ($resource, ENDPOINT_URL) {
  var ROLE_ADMIN = 'admin';

  var User = $resource(ENDPOINT_URL+'/user/:id', {
    id: '@id'
  });

  // methods
  angular.extend(User.prototype, {
    getName: function () {
      return [this.firstName, this.lastName].filter(function (s) {
        return !!s;
      }).join(' ');
    },
    hasRole: function (role) {
      if (!this.roles) return false;
      return this.roles.indexOf(role) !== -1;
    }
  });

  return User;
});
