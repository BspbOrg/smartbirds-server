/**
 * Created by groupsky on 03.12.15.
 */

var angular = require('angular')

require('../app').factory('Location', /* @ngInject */function ($resource, $translate, ENDPOINT_URL) {
  var Location = $resource(ENDPOINT_URL + '/locations/:id', {
    id: '@id'
  })

  // instance methods
  angular.extend(Location.prototype, {
    getArea: function (locale) {
      locale = locale || $translate.$language || 'en'
      return (this.area || {})[locale]
    },
    getName: function (locale) {
      locale = locale || $translate.$language || 'en'
      return (this.name || {})[locale]
    },
    getType: function (locale) {
      locale = locale || $translate.$language || 'en'
      return (this.type || {})[locale]
    },
    toString: function (locale) {
      locale = locale || $translate.$language || 'en'
      return (this.type || {})[locale] + ' ' + (this.name || {})[locale] + ', ' + (this.area || {})[locale]
    }
  })

  return Location
})
