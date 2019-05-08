var angular = require('angular')

require('../app').controller('MonitoringDetailController', /* @ngInject */function (
  $filter, $http, $scope, $state, $stateParams, $q, $timeout, $translate, model, ngToast, db,
  Raven, Track, formName, user, geolocation, local, modelResource
) {
  var controller = this

  var id = $stateParams.id
  var isCopy = false
  if (!$stateParams.id && $stateParams.fromId) {
    isCopy = true
    id = $stateParams.fromId
    if ($stateParams.fromId.indexOf('local-') === 0) {
      id = id.replace('local-', '')
      local = true
    }
  }

  function checkCanSave () {
    controller.canSave = !controller.data.user || controller.data.user === user.getIdentity().id || user.canAccess(formName)
  }

  controller.formName = formName
  controller.db = db
  if (id) {
    if (local) {
      controller.data = { id: id }
      controller.data.$promise = model
        .localGet(controller.data)
        .then(function (data) {
          controller.data = data
        })
    } else {
      controller.data = model.get({ id: id })
    }
  } else {
    controller.data = new model() // eslint-disable-line new-cap
    controller.data.observationDateTime = new Date()
    controller.data.startDateTime = controller.data.observationDateTime
    controller.data.endDateTime = controller.data.observationDateTime
    if (angular.isFunction(model.prototype.afterCreate)) { model.prototype.afterCreate.apply(controller.data) }
    checkCanSave()

    if (geolocation.isAvailable) {
      geolocation.checkAllowed()
        .then(function (allowed) {
          if (!allowed) return

          controller.watchGeoId = geolocation.watchPosition()
          $scope.$on('$destroy', function () { geolocation.clearWatch(controller.watchGeoId) })
        })
    }
  }
  if (isCopy) {
    controller.data.$promise.then(function () {
      controller.clearForCopy()
    })
  }
  if (controller.data && controller.data.$promise) {
    controller.data.$promise.then(function () {
      checkCanSave()
    })
  }
  if (angular.isDefined($stateParams.offset)) {
    var q = angular.extend({}, $stateParams, {
      offset: Math.max(0, $stateParams.offset - 1),
      limit: $stateParams.offset > 0 ? 3 : 2,
      id: null
    })
    model
      .query(q).$promise
      .then(function (neighbours) {
        var lastIdx = 2
        if ($stateParams.offset > 0) {
          controller.prevParams = {
            offset: $stateParams.offset - 1,
            id: neighbours[0].id
          }
        } else {
          lastIdx = 1
        }
        if (neighbours.length > lastIdx) {
          controller.nextParams = {
            offset: $stateParams.offset + 1,
            id: neighbours[lastIdx].id
          }
        }
      })
  }
  $scope.$watch(function () {
    return controller.data && controller.data.track
  }, function (track) {
    controller.track = null
    if (!track) return
    Track.get(track).then(function (points) {
      controller.track = points
    })
  })
  if (controller.data.$promise) {
    controller.data.$promise.then(function () {
      modelResource.clearGeneratedSingleObservationCode(controller.data)
    })
  }
  controller.hasZone = !!controller.data.getZone
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
        args = scope
        scope = undefined
      }
      controller.data.latitude = args[0].latLng.lat()
      controller.data.longitude = args[0].latLng.lng()
      controller.updateFromModel()
      $scope.smartform.$setDirty()
    }
  }

  controller.locationUpdated = function (location) {
    if (controller.data.latitude && controller.data.longitude) return
    controller.updateFromModel(location)
  }

  controller.updateFromModel = function (data, update) {
    data = data || controller.data
    if (update) {
      if (update.latitude != null) {
        data.latitude = update.latitude
      }
      if (update.longitude != null) {
        data.longitude = update.longitude
      }
      if (update.accuracy != null) {
        data.geolocationAccuracy = update.accuracy
      }
    }
    controller.map.poi.latitude = data.latitude
    controller.map.poi.longitude = data.longitude
    if (data.getZone) {
      controller.map.center = data.getZone() && angular.copy(data.getZone().getCenter() || controller.map.poi)
      controller.map.zoom = 14
    } else if (controller.map.poi.latitude && controller.map.poi.longitude) {
      controller.map.center = angular.copy(controller.map.poi)
      controller.map.zoom = 14
    }
    // trigger a digest cycle to update the ui
    $timeout(angular.noop)
  }

  // update the map poi with data coords and zoom
  $q.resolve(controller.data.$promise || controller.data).then(function (data) {
    $timeout(controller.updateFromModel, 500)
  })

  // when zone is changed recenter the poi
  controller.onZoneSelected = function () {
    if (!controller.data.getZone || !controller.data.getZone()) return
    var zoneCenter = controller.data.getZone().getCenter()

    if (!controller.data.latitude || !controller.data.longitude) {
      controller.data.latitude = zoneCenter.latitude
      controller.data.longitude = zoneCenter.longitude
    }

    controller.updateFromModel()
    // controller.map.center = angular.copy(controller.data.getZone().getCenter());
    // controller.map.refresh = true;
    // controller.map.zoom = 14;
    // controller.map.poi.latitude = controller.data.latitude;
    // controller.map.poi.longitude = controller.data.longitude;
    $scope.smartform.$setDirty()
  }

  controller.clearForCopy = function () {
    if (angular.isFunction(model.prototype.preCopy)) {
      model.prototype.preCopy.apply(controller.data)
    }
    delete controller.data.id
    delete controller.data.pictures
    delete controller.data.user
    if (angular.isFunction(model.prototype.postCopy)) {
      model.prototype.postCopy.apply(controller.data)
    }
    $scope.smartform.$setPristine()
    checkCanSave()
  }

  controller.copy = function () {
    $state.go('^.copy', { fromId: (controller.data.$local ? 'local-' : '') + controller.data.id }, { notify: false })
    controller.clearForCopy()
  }

  controller.save = function () {
    if (!controller.canSave) return
    modelResource.save(model, controller.data)
      .then(function (res) {
        $scope.smartform.$setPristine()
        controller.data = res
        return res
      })
      .then(function (res) {
        ngToast.create(local ? {
          className: 'info',
          content: $translate.instant('Form saved locally.')
        } : {
          className: 'success',
          content: $translate.instant('Form saved successfully.')
        })
        return res
      }, function (error) {
        ngToast.create({
          className: 'danger',
          content: '<p>' + $translate.instant('Could not save form!') + '</p><pre>' + (error && error.data ? error.data.error : JSON.stringify(error, null, 2)) + '</pre>'
        })
        return $q.reject(error)
      })
      .then(function (res) {
        $state.go('^.' + (local ? 'local-' : '') + 'detail', { id: res.id }, { location: 'replace' })
      })
  }

  controller.observationDateChange = function () {
    var change = controller.data.startDateTime ? controller.data.endDateTime : !controller.data.monitoringCode
    if (change || !controller.data.startDateTime) {
      controller.data.startDateTime = controller.data.observationDateTime
    }
    if (change || !controller.data.endDateTime) {
      controller.data.endDateTime = controller.data.observationDateTime
    }
  }

  controller.hasVisit = model.prototype.hasVisit
  if (controller.hasVisit) {
    $scope.$watch(function () {
      return controller.data.startDateTime
    }, function (date) {
      controller.visit = null
      if (!date || angular.isString(date)) return
      var year = date.getUTCFullYear()
      var visit = controller.visit = db.visits[year]
      controller.isEarly = false
      controller.isLate = false
      if (visit) {
        if (new Date(visit.early.start) <= date && date <= new Date(visit.early.end)) {
          controller.isEarly = true
        }
        if (new Date(visit.late.start) <= date && date <= new Date(visit.late.end)) {
          controller.isLate = true
        }
      }
    })
  }
})
