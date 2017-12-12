/**
 * Created by groupsky on 12.01.16.
 */
var angular = require('angular')

require('../app').service('Nomenclature', /* @ngInject */function ($resource, ENDPOINT_URL) {
  var Nomenclature = $resource(ENDPOINT_URL + '/nomenclature/:type/:label', {
    type: '@type',
    label: '@label'
  }, {
    updateGroup: {method: 'PUT', url: ENDPOINT_URL + '/nomenclature/:type', isArray: true}
  })

  // instance methods
  angular.extend(Nomenclature.prototype, {
    toString: function (locale) {
      locale = locale || 'bg'
      return (this.label || {})[locale]
    }
  })

  return Nomenclature
})
