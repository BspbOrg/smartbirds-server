/**
 * Created by groupsky on 12.01.16.
 */
var angular = require('angular')

require('../app').service('Species', /* @ngInject */function ($resource, $translate, ENDPOINT_URL) {
  var Species = $resource(ENDPOINT_URL + '/species/:type/:la', {
    type: '@type',
    la: '@la'
  }, {
    updateGroup: { method: 'PUT', url: ENDPOINT_URL + '/species/:type', isArray: true }
  })

  // instance methods
  angular.extend(Species.prototype, {
    localeLabel: function (locale) {
      locale = locale || $translate.$language || 'en'
      var label = (this.label || {})

      return label[ locale ]
    },
    toString: function (locale) {
      locale = locale || $translate.$language || 'en'
      var label = (this.label || {})

      return label.la + ' | ' + label[ locale ]
    }
  })

  return Species
})
