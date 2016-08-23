var angular = require('angular');
var moment = require('moment');

require('../app').controller('MonitoringDetailController', /*@ngInject*/function ($scope, $state, $stateParams, $q, $timeout, model, ngToast, db, Raven) {

  var controller = this;

  var id = $stateParams.id || $stateParams.fromId;

  function genSingleObservationCode() {    
    var date = controller.data.observationDateTime || controller.data.startDateTime;
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
      latitude: 42.765833,
      longitude: 25.238611
    },
    zoom: 8,
    click: function (maps, event, scope, args) {
      if (typeof args === 'undefined') {
        args = scope;
        scope = undefined;
      }
      controller.data.latitude = args[0].latLng.lat();
      controller.data.longitude = args[0].latLng.lng();
      controller.updateFromModel();
      $scope.smartform.$setDirty();
    }
  };

  controller.updateFromModel = function(data) {
    data = data || controller.data;
    controller.map.poi.latitude = data.latitude;
    controller.map.poi.longitude = data.longitude;
    if (data.getZone) {
      controller.map.center = data.getZone() && angular.copy(data.getZone().getCenter() || controller.map.poi);
      controller.map.zoom = 14;
    } else if (controller.map.poi.latitude && controller.map.poi.longitude) {
      controller.map.center = angular.copy(controller.map.poi);
      controller.map.zoom = 14;
    }
    // trigger a digest cycle to update the ui
    $timeout(angular.noop);
  };

  // update the map poi with data coords and zoom
  $q.resolve(controller.data.$promise || controller.data).then(function (data) {
    $timeout(controller.updateFromModel, 500);
  });


  // when zone is changed recenter the poi
  controller.onZoneSelected = function () {
    if (!controller.data.getZone || !controller.data.getZone()) return;
    var zoneCenter = controller.data.getZone().getCenter();
    controller.data.latitude = zoneCenter.latitude;
    controller.data.longitude = zoneCenter.longitude;
    controller.updateFromModel();
    // controller.map.center = angular.copy(controller.data.getZone().getCenter());
    // controller.map.refresh = true;
    // controller.map.zoom = 14;
    // controller.map.poi.latitude = controller.data.latitude;
    // controller.map.poi.longitude = controller.data.longitude;
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
    if (!data.observationDateTime) {
      data.observationDateTime = data.startDateTime;
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

  if (controller.hasVisit = model.prototype.hasVisit) {
    $scope.$watch(function () {
      return controller.data.startDateTime;
    }, function (date) {
      controller.visit = null;
      if (!date || angular.isString(date)) return;
      var year = date.getUTCFullYear();
      var visit = controller.visit = db.visits[year];
      controller.isEarly = false;
      controller.isLate = false;
      if (visit) {
        if (new Date(visit.early.start) <= date && date <= new Date(visit.early.end)) {
          controller.isEarly = true;
        }
        if (new Date(visit.late.start) <= date && date <= new Date(visit.late.end)) {
          controller.isLate = true;
        }
      }
    });
  }
});
