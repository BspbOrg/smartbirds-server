var defaults = require('lodash/defaults')

require('../app').controller('SelectLocationController', /* @ngInject */function ($scope, $timeout, $uibModalInstance, location) {
  var $ctrl = this
  var latKilometersPerDegree = 111.195
  var lonKilometersPerDegree = 82.445

  $ctrl.location = defaults({}, location, { radius: '5' })

  $ctrl.radiusCoordinates = []
  $ctrl.map = {
    center: defaults({}, $ctrl.location, {
      latitude: 42.765833,
      longitude: 25.238611
    }),
    zoom: 8,
    click: function (maps, event, scope, args) {
      if (typeof args === 'undefined') {
        args = scope
        scope = undefined
      }
      $timeout(function () {
        $ctrl.location.latitude = Math.round(args[0].latLng.lat() * 1000000) / 1000000
        $ctrl.location.longitude = Math.round(args[0].latLng.lng() * 1000000) / 1000000
        $ctrl.updateRadius()
      })
    }
  }

  $ctrl.updateRadius = function () {
    $ctrl.radiusCoordinates = [
      {
        latitude: parseFloat($ctrl.location.latitude) - parseFloat($ctrl.location.radius) / latKilometersPerDegree,
        longitude: parseFloat($ctrl.location.longitude) - parseFloat($ctrl.location.radius) / lonKilometersPerDegree
      },
      {
        latitude: parseFloat($ctrl.location.latitude) - parseFloat($ctrl.location.radius) / latKilometersPerDegree,
        longitude: parseFloat($ctrl.location.longitude) + parseFloat($ctrl.location.radius) / lonKilometersPerDegree
      },
      {
        latitude: parseFloat($ctrl.location.latitude) + parseFloat($ctrl.location.radius) / latKilometersPerDegree,
        longitude: parseFloat($ctrl.location.longitude) + parseFloat($ctrl.location.radius) / lonKilometersPerDegree
      },
      {
        latitude: parseFloat($ctrl.location.latitude) + parseFloat($ctrl.location.radius) / latKilometersPerDegree,
        longitude: parseFloat($ctrl.location.longitude) - parseFloat($ctrl.location.radius) / lonKilometersPerDegree
      }
    ]
  }

  $ctrl.locationSelected = function () {
    $uibModalInstance.close($ctrl.location)
  }

  $ctrl.updateRadius()
})
