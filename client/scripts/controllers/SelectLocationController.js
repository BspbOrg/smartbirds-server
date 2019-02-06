var angular = require('angular')

require('../app').controller('SelectLocationController', /* @ngInject */function ($scope, $timeout, $uibModalInstance, location) {
  var $ctrl = this
  var latKilometersPerDegree = 111.195
  var lonKilometersPerDegree = 82.445

  $ctrl.location = angular.extend({}, location, { radius: '5' })

  $ctrl.radiusCoordinates = []
  $ctrl.map = {
    center: {
      latitude: 42.765833,
      longitude: 25.238611
    },
    zoom: 8,
    click: function (maps, event, scope, args) {
      if (typeof args === 'undefined') {
        args = scope
        scope = undefined
      }
      $timeout(function () {
        $ctrl.location.latitude = Math.round(args[ 0 ].latLng.lat() * 1000000) / 1000000
        $ctrl.location.longitude = Math.round(args[ 0 ].latLng.lng() * 1000000) / 1000000
        $ctrl.updateRadius()
      })
    }
  }

  $ctrl.updateRadius = function () {
    $ctrl.radiusCoordinates = [
      {
        latitude: $ctrl.location.latitude - $ctrl.location.radius / latKilometersPerDegree,
        longitude: $ctrl.location.longitude - $ctrl.location.radius / lonKilometersPerDegree
      },
      {
        latitude: $ctrl.location.latitude - $ctrl.location.radius / latKilometersPerDegree,
        longitude: $ctrl.location.longitude + $ctrl.location.radius / lonKilometersPerDegree
      },
      {
        latitude: $ctrl.location.latitude + $ctrl.location.radius / latKilometersPerDegree,
        longitude: $ctrl.location.longitude + $ctrl.location.radius / lonKilometersPerDegree
      },
      {
        latitude: $ctrl.location.latitude + $ctrl.location.radius / latKilometersPerDegree,
        longitude: $ctrl.location.longitude - $ctrl.location.radius / lonKilometersPerDegree
      }
    ]
  }

  $ctrl.locationSelected = function () {
    $uibModalInstance.close($ctrl.location)
  }
})
