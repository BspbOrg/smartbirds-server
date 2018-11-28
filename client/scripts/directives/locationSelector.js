/**
 * Created by groupsky on 10.12.15.
 */

require('../app').directive('locationSelector', /* @ngInject */function () {
  return {
    restrict: 'AE',
    scope: {
      model: '=?',
      modelId: '=?',
      name: '@?',
      placeholder: '@?',
      inputClass: '@?',
      btnClass: '@?',
      confirm: '=?',
      select: '&onSelect',
      cancel: '&onCancel',
      required: '=?'
    },
    templateUrl: '/views/directives/locationselector.html',
    controllerAs: 'field',
    controller: /* @ngInject */function ($filter, $scope, $timeout, Location) {
      var field = this
      var orderBy = $filter('orderBy')
      var filter = $filter('filter')
      var limitTo = $filter('limitTo')

      $scope.$watch('model || modelId', function () {
        if ($scope.model) {
          if (!field.value || field.value.id !== $scope.model.id) {
            field.value = $scope.model
          }
        } else if ($scope.modelId) {
          if (!field.value || field.value.id !== $scope.modelId) {
            field.value = Location.get({ id: $scope.modelId })
            field.value.$promise.then(function (value) {
              field.value = false
              $timeout(function () {
                field.value = value
              })
            })
          }
        } else {
          field.value = null
        }
      })

      field.getModels = function (q) {
        return Location.query({ q: q }).$promise.then(function (models) {
          return limitTo(orderBy(filter(models, q), ['name.bg', 'area.bg']), 25)
        })
      }

      field.confirm = function () {
        $scope.model = field.value
        $scope.modelId = field.value ? field.value.id : undefined

        if ($scope.select) {
          $timeout(function () {
            $scope.select()
          })
        }
      }

      field.cancel = function () {
        if ($scope.cancel) { $scope.cancel() }
      }

      field.onSelect = function () {
        if ($scope.confirm) return
        field.confirm()
      }
    }
  }
})
