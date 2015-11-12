/**
 * Created by groupsky on 12.11.15.
 */

require('../app').factory('User', function () {
  // constructor
  var User = function () {

    Object.defineProperties(this, {
      name: {
        get: function () {
          return [this.firstName, this.lastName].filter(function (s) {
            return !!s;
          }).join(' ');
        }
      }
    });
  };

  // methods
  angular.extend(User.prototype, {

  });


  return User;
});
