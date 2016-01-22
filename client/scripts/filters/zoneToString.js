/**
 * Created by groupsky on 22.01.16.
 */

require('../app').filter('zoneToString', /*@ngInject*/function(Zone) {
  return function(zone, locale) {
    return Zone.prototype.toString.apply(zone, locale);
  };
});
