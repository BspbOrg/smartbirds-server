/**
 * Created by groupsky on 08.01.16.
 */

var _ = require('lodash')
var angular = require('angular')
require('../app').controller('MonitoringController', /* @ngInject */function ($state, $stateParams, $q, $translate, model, ngToast, db, Raven, ENDPOINT_URL, $httpParamSerializer, formName) {
  var controller = this

  controller.maxExportCount = 20000
  controller.formName = formName
  controller.db = db
  controller.filter = angular.copy($stateParams)
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
  controller.tab = 'list'
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
    var filter = _.mapValues(controller.filter, function (value) {
      return value && angular.isFunction(value.toJSON) ? value.toJSON() : value
    })
    console.log($stateParams, '->', filter)
    if (angular.equals(filter, $stateParams)) { return }
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
      return row.$delete().then(function (res) {
        var idx = controller.rows.indexOf(row)
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

  function fetch (query) {
    controller.loading = true
    return model.query(query).$promise
      .then(function (rows) {
        controller.count = rows.$$response.data.$$response.count
        Array.prototype.push.apply(controller.rows, rows)
        controller.endOfPages = !rows.length
        return controller.rows
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

  controller.export = function (outputType) {
    var selection = []
    if (controller.selectedRows && controller.selectedRows.length > 0 && !controller.allSelected) {
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
    controller.rows = []
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
      offset: controller.rows.length,
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
