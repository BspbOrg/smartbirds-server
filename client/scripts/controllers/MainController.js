var forms = require('../configs/forms')

require('../app').controller('MainController', /* @ngInject */function ($injector) {
  var ctrl = this
  ctrl.$onInit = function () {
    ctrl.SW = window.SW_STATUS
  }

  ctrl.forms = forms
})
