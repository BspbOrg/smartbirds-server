/**
 * Created by groupsky on 12.01.16.
 */

require('../app').filter('userName', /*@ngInject*/function(User) {
  return function(user) {
    return User.prototype.getName.apply(user);
  };
});
