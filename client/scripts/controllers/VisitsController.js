/**
 * Created by groupsky on 26.05.16.
 */

require('../app').controller('VisitsController', /* @ngInject */function ($scope, Visit) {
  var $ctrl = this

  $ctrl.dateFormat = 'd MMM'

  var lastYear = new Date().getFullYear() - 1
  $ctrl.rows = {}
  Visit.query().$promise.then(function (visits) {
    visits.forEach(function (visit) {
      $ctrl.rows[visit.year] = visit
      visit.$exists = true
      lastYear = lastYear < visit.year ? visit.year : lastYear
    })
  })

  $ctrl.new = function () {
    $ctrl.save()
    var currentYear = lastYear + 1
    var visit = new Visit({
      year: currentYear,
      early: {
        start: new Date(Date.UTC(currentYear, 4, 15)),
        end: new Date(Date.UTC(currentYear, 5, 15))
      },
      late: {
        start: new Date(Date.UTC(currentYear, 5, 15)),
        end: new Date(Date.UTC(currentYear, 6, 15))
      }
    })
    $ctrl.editing = visit
    visit.$editing = true
    visit.$exists = false
  }

  $ctrl.save = function (visit) {
    visit = visit || $ctrl.editing
    if (!visit) return

    lastYear = Math.max(lastYear, visit.year)
    $ctrl.rows[visit.year] = visit
    visit.$editing = false
    visit.$dirty = true
    visit.$save().then(function () {
      visit.$exists = true
      visit.$dirty = false
    })
    $ctrl.editing = false
  }

  $ctrl.edit = function (visit) {
    $ctrl.save()
    $ctrl.editing = visit
    visit.$editing = true
    delete $ctrl.rows[visit.year]
  }

  $ctrl.cancel = function (visit) {
    visit = visit || $ctrl.editing
    if (!visit) return

    if (visit.$exists) {
      $ctrl.rows[visit.year] = visit

      visit.$editing = false
      visit.$dirty = true
      visit.$get().then(function () {
        visit.$exists = true
        visit.$dirty = false
      })
    }

    $ctrl.editing = false
  }

  $scope.$watch(function () {
    return $ctrl.editing && !$ctrl.editing.$exists && $ctrl.editing.year
  }, function (editYear) {
    if (editYear) {
      $ctrl.editing.early.start.setUTCFullYear(editYear)
      $ctrl.editing.early.end.setUTCFullYear(editYear)
      $ctrl.editing.late.start.setUTCFullYear(editYear)
      $ctrl.editing.late.end.setUTCFullYear(editYear)
    }
  })
})
