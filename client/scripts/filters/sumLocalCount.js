var forms = require('../configs/forms')

require('../app').filter('sumLocalCount', /* @ngInject */function () {
  return function () {
    return Object
      .keys(forms)
      .reduce(function (sum, key) {
        return sum + forms[key].modelRef.localCount
      }, 0)
  }
})
