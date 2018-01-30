var module = require('../app')

module.filter('min', /* @ngInject */function () {
  return Math.min
})
