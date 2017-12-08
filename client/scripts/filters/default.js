var module = require('../app')

module.filter('default', /* @ngInject */function () {
  return function (val, def) {
    return val || def
  }
})
