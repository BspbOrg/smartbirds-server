/**
 * Created by groupsky on 12.11.15.
 */

require('../app').factory('User', function ($resource, ENDPOINT_URL) {
  var ROLE_ADMIN = 'admin';

  var User = $resource(ENDPOINT_URL + '/users/:id');

  var resourceConstructor = User.prototype.constructor;
  User.prototype.constructor = function () {
    resourceConstructor.apply(this, arguments);

    Object.defineProperties(this, {
      name: {
        get: function () {
          return [this.firstName, this.lastName].filter(function (s) {
            return !!s;
          }).join(' ');
        }
      },
      isAdmin: {
        get: function () {
          return this.hasRole(ROLE_ADMIN);
        },
        set: function (value) {
          if (value) {
            this.roles = this.roles || [];
            this.roles.indexOf(ROLE_ADMIN)
          } else {
            if (!this.roles) return;
            var idx = this.roles.indexOf(ROLE_ADMIN);
            if (idx !== -1)
              this.roles.splice(idx, 1);
          }
        }
      }
    });

    return this;
  };

  // methods
  angular.extend(User.prototype, {
    hasRole: function (role) {
      if (!this.roles) return false;
      return this.roles.indexOf(role) !== -1;
    }
  });

  return User;
});
