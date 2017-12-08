/**
 * Created by groupsky on 26.05.16.
 */

var angular = require('angular')

require('../app').factory('Visit', /* @ngInject */function ($resource, ENDPOINT_URL, Location) {
  var Visit = $resource(ENDPOINT_URL + '/visit/:year', {
    year: '@year'
  }, {
  })

  // methods
  angular.extend(Visit.prototype, {

    toString: function (locale) {
      return this.year
    }

  })

  return Visit
})
