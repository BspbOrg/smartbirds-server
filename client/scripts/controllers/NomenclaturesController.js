var angular = require('angular')
require('../app').controller('NomenclaturesController', /* @ngInject */function ($scope, $state, $stateParams, db, Nomenclature) {
  var $ctrl = this

  $ctrl.nomenclatures = db.nomenclatures
  $ctrl.groups = {}
  angular.forEach(db.nomenclatures, function (nomenclature, key) {
    var parts = key.split('_')
    var group = parts.shift()
    var name = parts.join('_')
    $ctrl.groups[group] = $ctrl.groups[group] || {}
    $ctrl.groups[group][name] = nomenclature

    if (group === $stateParams.group && name === $stateParams.nomenclature) {
      $ctrl.selected = $ctrl.selected || {}
      $ctrl.selected.group = $ctrl.selected.group || {}
      $ctrl.selected.group[group] = true
      $ctrl.selected.name = name
      $ctrl.selected.type = key
      $ctrl.selected.nomenclature = []
      angular.forEach(nomenclature, function (item) {
        $ctrl.selected.nomenclature.push(angular.copy(item))
      })
    }
  })

  $ctrl.remove = function (idx) {
    $ctrl.selected.nomenclature.splice(idx, 1)
    $scope.editform.$setDirty()
  }

  $ctrl.add = function (key) {
    $ctrl.selected.nomenclature.push(new Nomenclature({
      type: $ctrl.selected.type
    }))
    $scope.editform.$setDirty()
  }

  $ctrl.save = function () {
    if ($scope.editform.$invalid) return
    if (!$ctrl.selected.nomenclature.length) {
      return
    }
    Nomenclature.updateGroup({ type: $ctrl.selected.type }, { items: $ctrl.selected.nomenclature })
      .$promise.then(function (items) {
        $scope.editform.$setPristine()
        db.$updateNomenclatures()
      })
  }
})
