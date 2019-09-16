/**
 * Created by groupsky on 08.01.16.
 */

var _ = require('lodash')
var angular = require('angular')
require('../app').controller('MonitoringController', /* @ngInject */function ($state, $stateParams, $q, $translate, model, ngToast, db, Raven, ENDPOINT_URL, $httpParamSerializer, formName, user, User, formDef, context) {
  var controller = this

  controller.maxExportCount = 20000
  controller.formName = formName
  controller.formDef = formDef
  controller.formTranslatePrefix = formDef.translatePrefix
  controller.formSpeciesType = formDef.speciesType
  controller.context = context
  controller.db = db
  controller.filter = angular.copy($stateParams)
  controller.offline = false

  // transform threat filter to nomenclature object
  $q.resolve(db.nomenclatures.$promise || db.nomenclatures).then(function (nomenclatures) {
    return nomenclatures.main_threats.$promise || nomenclatures.main_threats
  }).then(function (threats) {
    controller.filter.threat = threats[controller.filter.threat]
  })
  $q.resolve(db.nomenclatures.$promise || db.nomenclatures).then(function (nomenclatures) {
    return nomenclatures.threats_category.$promise || nomenclatures.threats_category
  }).then(function (categories) {
    controller.filter.category = categories[controller.filter.category]
  })

  switch (context) {
    case 'public':
      controller.canFilterByUser = true
      controller.canExport = false
      break
    case 'private':
      if (user.canAccess(formName)) {
        controller.canFilterByUser = true
        controller.canExport = true
      } else {
        controller.canFilterByUser = false
        controller.canExport = !controller.filter.user || controller.filter.user === user.getIdentity().id
        // set user filter to current user by default
        if (!controller.filter.user) {
          controller.filter.user = user.getIdentity().id
        }
        $q.resolve(db.users.$promise || db.users).then(function (users) {
          // if he has sharers
          if (Object.keys(users).length > 1) {
            controller.canFilterByUser = true
          }
        })
      }
      break
  }

  controller.years = Object.keys(new Int8Array(new Date().getFullYear() - 1979)).map(function (year) {
    return Number(year) + 1980
  }).reverse()
  controller.species = {}
  $q.resolve(db.species.$promise || db.species).then(function (species) {
    return species.$promise || species
  }).then(function (species) {
    controller.species = species
  })
  controller.visits = {}
  controller.map = {}
  controller.tab = controller.filter.tab === 'map' ? 'map' : 'list'

  if (formName === 'cbm') {
    $q.resolve(db.nomenclatures.$promise || db.nomenclatures).then(function (nomenclatures) {
      return nomenclatures.cbm_visit_number.$promise || nomenclatures.cbm_visit_number
    }).then(function (visits) {
      controller.visits = visits
    })
    $q.resolve(db.zones.$promise || db.zones).then(function (zones) {
      controller.zones = []
      angular.forEach(db.zones, function (zone, key) {
        controller.zones.push(zone)
      })
      controller.zones.sort(function (a, b) {
        return a.id < b.id ? -1 : a.id > b.id ? +1 : 0
      })
    })
  }

  controller.updateFilter = function () {
    var filter = _.mapValues(controller.filter, function (value, key) {
      if (value && value.label) {
        return value.label.en
      }

      return value && angular.isFunction(value.toJSON) ? value.toJSON() : value
    })
    if (angular.equals(filter, $stateParams)) { return }
    controller.canExport = !filter.user || filter.user === user.getIdentity().id || user.canAccess(formName)
    $state.go('.', filter, {
      notify: false
    })
    angular.extend($stateParams, filter)
    controller.requestRows()
  }

  controller.toggleSelected = function (row) {
    if (!row) {
      var selected = !controller.allSelected
      controller.rows.forEach(function (row) {
        row.$selected = selected
      })
      controller.allSelected = selected
      controller.selectedRows = selected ? controller.rows : []
    } else {
      row.$selected = !row.$selected
      controller.selectedRows = controller.rows.filter(function (row) {
        return row.$selected
      })
      controller.allSelected = controller.selectedRows.length === controller.rows.length
    }
  }

  controller.deleteRows = function (rows) {
    $q.all(rows.map(function (row) {
      return (row.$local ? row.$localDelete() : row.$delete()).then(function (res) {
        var idx
        if (row.$local) {
          idx = controller.localRows.indexOf(row)
          if (idx !== -1) {
            controller.localRows.splice(idx, 1)
          }
        }
        idx = controller.rows.indexOf(row)
        if (idx !== -1) {
          controller.rows.splice(idx, 1)
        }
        return res
      })
    })).then(function () {
      ngToast.create({
        className: 'success',
        content: $translate.instant('Deleted {{num}} records', { num: rows.length })
      })
      controller.selectedRows = []
    }, function (error) {
      Raven.captureMessage(JSON.stringify(error))
      ngToast.create({
        className: 'danger',
        content: '<p>' + $translate.instant('Error during deletion') + '</p><pre>' + (error && error.data ? error.data.error : JSON.stringify(error, null, 2)) + '</pre>'
      })
      return $q.reject(error)
    })
  }

  controller.localRows = []
  if (context === 'private') {
    controller.localRows.$promise = model.localList()
      .then(function (rows) {
        Array.prototype.push.apply(controller.localRows, rows)
        Array.prototype.unshift.apply(controller.rows, rows)
        return controller.localRows
      })
  }

  function fetch (query) {
    controller.loading = true
    controller.offline = false
    return model.query(angular.extend({}, query, { context: controller.context })).$promise
      .then(function (rows) {
        controller.count = rows.$$response.data.$$response.count
        Array.prototype.push.apply(controller.rows, rows)
        controller.endOfPages = !rows.length
        return controller.rows
      }, function (error) {
        controller.offline = true
        controller.failedQuery = query
        return $q.reject(error)
      })
      .then(function (rows) {
        if (angular.isFunction(controller.map.refresh)) {
          controller.map.refresh(rows)
        }
      })
      .finally(function () {
        controller.loading = false
      })
  }

  controller.retry = function () {
    fetch(controller.failedQuery)
  }

  controller.export = function (outputType) {
    var selection = []
    if (controller.selectedRows && controller.selectedRows.length > 0 && !controller.allSelected && controller.canExport) {
      angular.forEach(controller.selectedRows, function (row) {
        selection.push(row.id)
      })
    }
    return model.export(angular.extend({}, controller.filter, {
      limit: -1,
      offset: 0,
      outputType: outputType,
      selection: selection
    })).$promise
      .then(function (res) {
        ngToast.create({
          className: 'success',
          content: $translate.instant('You will be notified by email when your export is ready')
        })
      })
      .catch(function (error) {
        ngToast.create({
          className: 'danger',
          content: '<p>' + $translate.instant('Error during export') + '</p><pre>' + (error && error.data ? error.data.error : JSON.stringify(error, null, 2)) + '</pre>'
        })
      })
  }

  controller.requestRows = function () {
    controller.rows = [].concat(controller.localRows)
    controller.endOfPages = false
    if (angular.isFunction(controller.map.clear)) {
      controller.map.clear()
    }
    controller.filter.limit = controller.tab === 'list' ? 50 : 1000
    fetch(controller.filter)
  }
  controller.requestRows()

  controller.nextPage = function (count) {
    fetch(angular.extend({}, controller.filter, {
      offset: controller.rows.length - controller.localRows.length,
      limit: count || (controller.tab === 'list' ? 50 : 1000)
    }))
  }

  controller.deleteSelecterRowsTranslationValues = function () {
    return {
      count: controller.selectedRows && controller.selectedRows.length
    }
  }

  controller.resultRowsTranslationValues = function () {
    return {
      count: controller.rows && controller.rows.length
    }
  }
})
