/**
 * Created by groupsky on 10.12.15.
 */

require('../app').directive('userSelector', /*@ngInject*/function(){

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
      cancel: '&onCancel'
    },
    templateUrl: '/views/directives/userselector.html',
    controllerAs: 'field',
    controller: /*@ngInject*/function($scope, $timeout, User) {
      var field = this;

      $scope.$watch('model', function(userId) {
        if ($scope.model) {
          if (!field.value || field.value.id != $scope.model.id) {
            field.value = $scope.model;
          }
        } else if ($scope.modelId) {
          if (!field.value || field.value.id != $scope.modelId) {
            field.value = User.get({id: $scope.modelId});
          }
        } else {
          field.value = null;
        }
      });

      field.getUsers = function (filter) {
        return User.query({q: filter}).$promise;
      };

      field.confirm = function() {
        $scope.model = field.value;
        $scope.modelId = field.value ? field.value.id : null;

        if ($scope.select)
          $timeout(function(){
            $scope.select();
          });
      };

      field.cancel = function() {
        if ($scope.cancel)
          $scope.cancel();
      };

      field.onSelect = function() {
        if ($scope.confirm) return;
        field.confirm();
      };
    }
  }

});
