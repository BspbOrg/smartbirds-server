/**
 * Created by groupsky on 03.12.15.
 */

var angular = require('angular'),
  isDefined = angular.isDefined,
  isUndefined = angular.isUndefined

require('../app').factory('Location', /* @ngInject */function ($resource, ENDPOINT_URL) {
  var Location = $resource(ENDPOINT_URL + '/locations/:id', {
    id: '@id'
  })

  // instance methods
  angular.extend(Location.prototype, {
    toString: function (locale) {
      locale = locale || 'bg'
      return (this.type || {})[locale] + ' ' + (this.name || {})[locale] + ', ' + (this.area || {})[locale]
    }
  })

  return Location
})
