var module = require('../app')

module.filter('replace', /* @ngInject */function () {
  return function (val, regex, replacement) {
    return String.prototype.replace.call(val, new RegExp(regex, 'g'), replacement)
  }
})
