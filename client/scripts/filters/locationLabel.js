/**
 * Created by groupsky on 08.01.16.
 */

require('../app').filter('locationLabel', /*@ngInject*/function(Location) {
  return function(location) {
    return Location.prototype.toString.apply(location);
  };
});
