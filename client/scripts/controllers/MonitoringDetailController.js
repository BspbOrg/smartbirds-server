var angular = require('angular')

require('../app').controller('MonitoringDetailController', /* @ngInject */function ($filter, $http, $scope, $state, $stateParams, $q, $timeout, $translate, model, ngToast, db, Raven, Track, formName, user) {
  var controller = this

  var id = $stateParams.id || $stateParams.fromId

  function genSingleObservationCode () {
    var date = controller.data.observationDateTime || controller.data.startDateTime
    if (date && date.toJSON) { date = date.toJSON() }
    return '!SINGLE-' + date
  }

  function clearGeneratedSingleObservationCode () {
    if (controller.data.monitoringCode === genSingleObservationCode()) {
      controller.data.monitoringCode = null
    }
  }

  function checkCanSave () {
    controller.canSave = !controller.data.user || controller.data.user === user.getIdentity().id || user.canAccess(formName)
  }

  controller.formName = formName
  controller.db = db
  if (id) {
    controller.data = model.get({ id: id })
  } else {
    controller.data = new model() // eslint-disable-line new-cap
    controller.data.observationDateTime = new Date()
    if (angular.isFunction(model.prototype.afterCreate)) { model.prototype.afterCreate.apply(controller.data) }
    checkCanSave()
    // try to fill current location if allowed
    if ('geolocation' in navigator && 'permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' })
        .then(function (permission) {
          if (permission.state !== 'granted') return
          navigator.geolocation.getCurrentPosition(function (pos) {
            if (!pos || !pos.coords) return
            // if already populated by some other means
            if (controller.data.latitude != null || controller.data.longitude != null) return
            controller.data.latitude = pos.coords.latitude
            controller.data.longitude = pos.coords.longitude
            checkCanSave()
          }, function (error) {
            Raven.captureMessage(JSON.stringify(error))
          }, {
            enableHighAccuracy: true,
            // 15 sec
            timeout: 15 * 1000,
            // 5 minutes
            maximumAge: 5 * 60 * 1000
          })
        })
    }
  }
  if (!$stateParams.id && $stateParams.fromId) {
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
            id: neighbours[ 0 ].id
          }
        } else {
          lastIdx = 1
        }
        if (neighbours.length > lastIdx) {
          controller.nextParams = {
            offset: $stateParams.offset + 1,
            id: neighbours[ lastIdx ].id
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
      clearGeneratedSingleObservationCode()
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
      controller.data.latitude = args[ 0 ].latLng.lat()
      controller.data.longitude = args[ 0 ].latLng.lng()
      controller.updateFromModel()
      $scope.smartform.$setDirty()
    }
  }

  controller.locationUpdated = function (location) {
    if (controller.data.latitude && controller.data.longitude) return
    controller.updateFromModel(location)
  }

  controller.updateFromModel = function (data) {
    data = data || controller.data
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
    $state.go('^.copy', { fromId: controller.data.id }, { notify: false })
    controller.clearForCopy()
  }

  controller.save = function () {
    if (!controller.canSave) return
    var data = new model(controller.data) // eslint-disable-line new-cap
    if (!data.monitoringCode) {
      data.monitoringCode = genSingleObservationCode()
    }
    if (!data.observationDateTime) {
      data.observationDateTime = data.startDateTime
    }
    if (angular.isFunction(data.preSave)) data.preSave()
    data.$save().then(function (res) {
      $scope.smartform.$setPristine()
      return res
    }).then(function (res) {
      controller.data = res
      clearGeneratedSingleObservationCode()
      return controller.data
    }).then(function (res) {
      ngToast.create({
        className: 'success',
        content: $translate.instant('Form saved successfully.')
      })
      return res
    }, function (error) {
      Raven.captureMessage(JSON.stringify(error))
      ngToast.create({
        className: 'danger',
        content: '<p>' + $translate.instant('Could not save form!') + '</p><pre>' + (error && error.data ? error.data.error : JSON.stringify(error, null, 2)) + '</pre>'
      })
      return $q.reject(error)
    }).then(function (res) {
      $state.go('^.detail', { id: res.id }, { location: 'replace' })
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
      var visit = controller.visit = db.visits[ year ]
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
