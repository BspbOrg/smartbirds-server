/**
 * Created by groupsky on 11.01.16.
 */

require('../app').controller('MonitoringDetailController', /*@ngInject*/function ($scope, $state, $stateParams, $q, $timeout, FormCBM, ngToast, Zone) {

  var controller = this;

  controller.data = $stateParams.id ? FormCBM.get({id: $stateParams.id}) : new FormCBM();
  controller.map = {
    poi: {
      latitude: undefined,
      longitude: undefined
    },
    center: {
      latitude: 43,
      longitude: 23
    },
    zoom: 14,
    click: function (maps, event, scope, args) {
      controller.data.latitude = args[0].latLng.lat();
      controller.data.longitude = args[0].latLng.lng();
      $scope.cbmform.$setDirty();
      // trigger a digest cycle to update the ui
      $timeout(angular.noop);
    }
  };

  // wait to receive the data and populate the map
  if (controller.data.$promise) {
    controller.data.$promise.then(function(data){
      if (data.zone) {
        controller.map.center = angular.copy(Zone.prototype.getCenter.apply(data.zone));
        controller.map.zoom = 14;
      }
    });
  }
  // update the map poi with data coords
  $scope.$watch(function () {
    controller.map.poi.latitude = controller.data.latitude;
    controller.map.poi.longitude = controller.data.longitude;
  }, angular.noop);

  // when zone is changed recenter the poi
  controller.onZoneSelected = function () {
    controller.map.center = angular.copy(Zone.prototype.getCenter.apply(controller.data.zone));
    controller.map.refresh = true;
    controller.map.zoom = 14;
    controller.data.latitude = controller.map.center.latitude;
    controller.data.longitude = controller.map.center.longitude;
    $scope.cbmform.$setDirty();
  };

  controller.save = function () {
    controller.data.$save().then(function (res){
      $scope.cbmform.$setPristine();
      return res;
    }).then(function (res) {
      ngToast.create({
        className: 'success',
        content: "Save success."
      });
      return res;
    }, function (error) {
      ngToast.create({
        className: 'danger',
        content: '<p>Could not save!</p><pre>' + (error && error.data && error.data.error || JSON.stringify(error, null, 2)) + '</pre>'
      });
      return $q.reject(error);
    }).then(function(res) {
      $state.go('^.detail', {id: res.id}, {location: 'replace'});
    });
  };
});
