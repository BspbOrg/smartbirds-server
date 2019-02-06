var angular = require('angular')

require('../app').directive('filterMap', /* @ngInject */function () {
  return {
    templateUrl: '/views/directives/filtermap.html',
    scope: {
      latitude: '=?',
      longitude: '=?',
      radius: '=?',
      onSelect: '&?'
    },
    bindToController: true,
    controller: /* @ngInject */function ($scope, $uibModal, $timeout) {
      var $ctrl = this
      $ctrl.location = {
        latitude: $ctrl.latitude,
        longitude: $ctrl.longitude,
        radius: $ctrl.radius
      }

      $ctrl.openModal = function () {
        var modal = $uibModal.open({
          ariaLabeledBy: 'modal-title',
          ariaDescribeBy: 'modal-body',
          templateUrl: '/views/modals/select_location.html',
          controller: 'SelectLocationController',
          controllerAs: '$ctrl',
          resolve: {
            location: function () {
              return $ctrl.location
            }
          },
          size: 'lg'
        })

        modal.result.then(function (location) {
          $ctrl.location = location
          $ctrl.latitude = location.latitude
          $ctrl.longitude = location.longitude
          $ctrl.radius = location.radius
          $ctrl.onChange()
        }, function () {
        })
      }

      $ctrl.clearCoordinates = function () {
        $ctrl.latitude = null
        $ctrl.longitude = null
        $ctrl.radius = null
        $ctrl.location = {}
        $ctrl.onChange()
      }

      $ctrl.onChange = function () {
        $timeout(function () {
          if (angular.isFunction($ctrl.onSelect)) {
            $ctrl.onSelect()
          }
        })
      }
    },
    controllerAs: '$ctrl'
  }
})
