/**
 * Created by groupsky on 11.01.16.
 */
var angular = require('angular');
var moment = require('moment');

require('../app').directive('field', /*@ngInject*/function() {
  return {
    restrict: 'AE',
    scope: {
      name: '@',
      label: '@?',
      placeholder: '@?',
      help: '@?',
      model: '=?'
    },
    require: '^form',
    templateUrl: function ($element, $attrs) {
      return '/views/fields/' + ($attrs.type || 'general') + '.html';
    },
    link: function($scope, $element, $attrs, formCtrl) {
      $scope.form = formCtrl;
      $scope.type = $attrs.type;
      $scope.required = angular.isDefined($attrs.required);
    },
    controllerAs: 'field',
    controller: /*@ngInject*/function($scope, $attrs, $filter, Nomenclature) {
      var field = this;

      switch ($attrs.type) {
        case 'date':
        case 'time': {
          $scope.$watch('model', function() {
            if (angular.isString($scope.model)) {
              $scope.model = moment($scope.model).toDate();
            }
          });
          break;
        }
        case 'single-choice': {
          var filter = $filter('filter');
          var limitTo = $filter('limitTo');
          field.type = $attrs.nomenclature;
          field.values = Nomenclature.query({type: field.type});

          $scope.$watch('model', function() {
            if ($scope.model) {
              if (!field.value || field.value.slug != $scope.model.slug) {
                field.value = angular.copy($scope.model);
                field.value.prototype = Nomenclature.prototype;
                field.values.$promise.then(function(models) {
                  field.value = undefined;
                  models.every(function(model){
                    if (model.slug === $scope.model.slug) {
                      field.value = model;
                      return false;
                    }
                    return true;
                  });
                });
              }
            } else {
              field.value = undefined;
            }
          });

          field.getModels = function (q) {
            //return field.values.$promise.then(function(models){
              return limitTo(filter(field.values, q), 25);
            //});
          };

          field.confirm = function() {
            $scope.model = field.value;

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

          break;
        }
      }
    }
  };
});
