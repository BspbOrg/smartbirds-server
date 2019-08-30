var capitalize = require('underscore.string/capitalize')

require('../app').filter('capitalize', /* @ngInject */function () {
  return function (value) {
    return capitalize(value)
  }
})
