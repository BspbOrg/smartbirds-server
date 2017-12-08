/**
 * Created by groupsky on 10.12.15.
 */

require('../app').directive('userSelector', /* @ngInject */function () {
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
    templateUrl: '/views/directives/userselector.html',
    controllerAs: 'field',
    controller: /* @ngInject */function ($filter, $scope, $timeout, User) {
      var field = this
      var filter = $filter('filter')
      var limitTo = $filter('limitTo')

      $scope.$watch('model || modelId', function (userId) {
        if ($scope.model) {
          if (!field.value || field.value.id != $scope.model.id) {
            field.value = $scope.model
          }
        } else if ($scope.modelId) {
          if (!field.value || field.value.id != $scope.modelId) {
            field.value = User.get({id: $scope.modelId})
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
        return User.query({q: q}).$promise.then(function (models) {
          return filter(models, q)
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
