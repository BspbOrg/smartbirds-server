var moment = require('moment');

require('../app').controller('MonitoringDetailController', /*@ngInject*/function ($scope, $state, $stateParams, $q, $timeout, model, ngToast, db, Raven) {

  var controller = this;

  var id = $stateParams.id || $stateParams.fromId;

  function genSingleObservationCode() {
    var date = controller.data.observationDateTime;
    if (date && date.toJSON)
      date = date.toJSON();
    return '!SINGLE-' + date;
  }

  function clearGeneratedSingleObservationCode() {
    if (controller.data.monitoringCode == genSingleObservationCode()) {
      controller.data.monitoringCode = null;
    }
  }

  controller.db = db;
  controller.data = id ? model.get({id: id}) : new model();
  if (!$stateParams.id && $stateParams.fromId) {
    controller.data.$promise.then(function () {
      controller.clearForCopy();
    });
  }
  if (controller.data.$promise) {
    controller.data.$promise.then(function () {
      clearGeneratedSingleObservationCode();
    });
  }
  controller.hasZone = !!controller.data.getZone;
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
      controller.map.poi.latitude = controller.data.latitude;
      controller.map.poi.longitude = controller.data.longitude;
      controller.map.center = controller.data.getZone && controller.data.getZone() && angular.copy(controller.data.getZone().getCenter() || controller.map.poi);
      $scope.smartform.$setDirty();
      // trigger a digest cycle to update the ui
      $timeout(angular.noop);
    }
  };

  // wait to receive the data and populate the map
  if (controller.data.$promise) {
    controller.data.$promise.then(function (data) {
      if (data.zone) {
        controller.map.center = data.getZone && data.getZone() && angular.copy(data.getZone().getCenter() || controller.map.poi);
        controller.map.zoom = 14;
      }
    });
  }

  // update the map poi with data coords
  $q.resolve(controller.data.$promise || controller.data).then(function (data) {
    $timeout(function () {
      controller.map.poi.latitude = data.latitude;
      controller.map.poi.longitude = data.longitude;
      controller.map.center = data.getZone && data.getZone() && angular.copy(data.getZone().getCenter() || controller.map.poi);
    }, 500);
  });

  // when zone is changed recenter the poi
  controller.onZoneSelected = function () {
    if (!controller.data.getZone || !controller.data.getZone()) return;
    controller.map.center = angular.copy(controller.data.getZone().getCenter());
    controller.map.refresh = true;
    controller.map.zoom = 14;
    controller.data.latitude = controller.map.center.latitude;
    controller.data.longitude = controller.map.center.longitude;
    controller.map.poi.latitude = controller.data.latitude;
    controller.map.poi.longitude = controller.data.longitude;
    $scope.smartform.$setDirty();
  };

  controller.clearForCopy = function () {
    delete controller.data.id;
    delete controller.data.species;
    delete controller.data.distance;
    delete controller.data.count;
    delete controller.data.plot;
    $scope.smartform.$setPristine();
  };

  controller.copy = function () {
    $state.go('^.copy', {fromId: controller.data.id}, {notify: false});
    controller.clearForCopy();
  };

  controller.save = function () {
    var data = new model(controller.data);
    if (!data.monitoringCode) {
      data.monitoringCode = genSingleObservationCode();
    }
    data.$save().then(function (res) {
      $scope.smartform.$setPristine();
      return res;
    }).then(function(res) {
      controller.data = res;
      clearGeneratedSingleObservationCode();
      return controller.data;
    }).then(function (res) {
      ngToast.create({
        className: 'success',
        content: "Save success."
      });
      return res;
    }, function (error) {
      Raven.captureMessage(JSON.stringify(error));
      ngToast.create({
        className: 'danger',
        content: '<p>Could not save!</p><pre>' + (error && error.data && error.data.error || JSON.stringify(error, null, 2)) + '</pre>'
      });
      return $q.reject(error);
    }).then(function (res) {
      $state.go('^.detail', {id: res.id}, {location: 'replace'});
    });
  };

  controller.observationDateChange = function () {
    var change = controller.data.startDateTime == controller.data.endDateTime || !controller.data.monitoringCode;
    if (change || !controller.data.startDateTime) {
      controller.data.startDateTime = controller.data.observationDateTime;
    }
    if (change || !controller.data.endDateTime) {
      controller.data.endDateTime = controller.data.observationDateTime;
    }
  };
});
