/**
 * Created by groupsky on 10.12.15.
 */

require('../app').controller('MainController', /* @ngInject */function () {
  var ctrl = this
  ctrl.$onInit = function () {
    ctrl.SW = window.SW_STATUS
  }
})
