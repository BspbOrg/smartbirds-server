/**
 * Created by groupsky on 03.12.15.
 */

var isFunction = require('angular').isFunction

require('../app').controller('RequestZoneController', /* @ngInject */function ($q, $scope, $state, user, Location, Zone) {
  var vc = this

  $scope.locations = Location.query()
  $scope.zones = []

  $scope.$watch(function () {
    return vc.location && vc.location.area && vc.location.area.bg
  }, function (areaBg) {
    if (!areaBg) return
    // cancel any previous request if any
    if ($scope.zones && $scope.zones.$cancelRequest && isFunction($scope.zones.$cancelRequest)) { $scope.zones.$cancelRequest() }

    $scope.zones = Zone.listByArea({
      area: areaBg,
      filter: 'free'
    })
  })

  vc.request = function (zone) {
    Zone.request({
      id: zone.id
    }, {
      // here will be any form data that needs to be sent as part of the request
    })
    zone.status = 'requested'
    zone.ownerId = user.getIdentity().id
    $scope.zones.push(zone)
    $state.go('auth.zones')
  }
})
