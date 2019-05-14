var forms = require('../configs/forms')

require('../app').controller('MainController', /* @ngInject */function ($scope, $rootScope, modelResource) {
  var ctrl = this
  ctrl.$onInit = function () {
    ctrl.SW = window.SW_STATUS
  }

  ctrl.forms = forms
  ctrl.navbarCollapsed = true

  ctrl.submitLocal = function () {
    Object.keys(forms)
      .forEach(function (key) {
        var Resource = forms[key].modelRef
        Resource.localList().then(function (list) {
          list.forEach(function (item) {
            modelResource.save(Resource, item)
          })
        })
      })
  }

  $scope.$on('$destroy', $rootScope.$on('$stateChangeStart', function () {
    ctrl.navbarCollapsed = true
  }))
})
