/**
 * Created by groupsky on 12.11.15.
 */

require('../app').factory('User', function () {
  var ROLE_ADMIN = 'admin';

  var proto = {
    hasRole: function(role) {
      if (!this.roles) return false;
      return this.roles.indexOf(role) !== -1;
    }
  };

  // constructor
  var User = function () {

    if (angular.isUndefined(this.prototype))
      angular.extend(this, proto);

    Object.defineProperties(this, {
      name: {
        get: function () {
          return [this.firstName, this.lastName].filter(function (s) {
            return !!s;
          }).join(' ');
        }
      },
      isAdmin: {
        get: function() {
          return this.hasRole(ROLE_ADMIN);
        },
        set: function(value) {
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
  angular.extend(User.prototype, proto);

  return User;
});
