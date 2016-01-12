/**
 * Created by groupsky on 03.12.15.
 */

var angular = require('angular'),
  isDefined = angular.isDefined,
  isUndefined = angular.isUndefined;

require('../app').factory('Location', /*@ngInject*/function($resource, ENDPOINT_URL) {
  var Location = $resource(ENDPOINT_URL + '/locations/:id', {
    id: '@id'
  });

  // instance methods
  angular.extend(Location.prototype, {
    toString: function(lang) {
      lang = lang || 'bg';
      return (this.type||{})[lang]+' '+(this.name||{})[lang]+', '+(this.area||{})[lang];
    }
  });

  return Location;
});
