var angular = require('angular')
require('../app').controller('SpeciesController', /* @ngInject */function ($scope, $state, $stateParams, db, Species) {
  var $ctrl = this

  $ctrl.species = db.species
  if ($stateParams.type && $stateParams.type in db.species) {
    $ctrl.selected = $ctrl.selected || {}
    $ctrl.selected.type = $stateParams.type
    $ctrl.selected.species = []
    angular.forEach(db.species[$stateParams.type], function (item) {
      $ctrl.selected.species.push(angular.copy(item))
    })
  }

  $ctrl.remove = function (idx) {
    $ctrl.selected.species.splice(idx, 1)
    $scope.editform.$setDirty()
  }

  $ctrl.add = function (key) {
    $ctrl.selected.species.push(new Species({
      type: $ctrl.selected.type
    }))
    $scope.editform.$setDirty()
  }

  $ctrl.save = function () {
    if ($scope.editform.$invalid) return
    if (!$ctrl.selected.species.length) {
      return
    }
    Species.updateGroup({ type: $ctrl.selected.type }, { items: $ctrl.selected.species })
      .$promise.then(function (items) {
        $scope.editform.$setPristine()
        db.$updateSpecies()
      })
  }
})
