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
      model: '='
    },
    bindToController: true,
    require: '^form',
    templateUrl: function ($element, $attrs) {
      return '/views/fields/' + ($attrs.type || 'general') + '.html';
    },
    link: function($scope, $element, $attrs, formCtrl) {
      $scope.form = formCtrl;
    },
    controllerAs: 'field',
    controller: /*@ngInject*/function($scope, $attrs, $filter, Nomenclature) {
      var field = this;

      field.form = $scope.form;
      field.type = $attrs.type;
      field.required = angular.isDefined($attrs.required);

      switch ($attrs.type) {
        case 'date':
        case 'time': {
          $scope.$watch('field.model', function() {
            if (angular.isString(field.model)) {
              field.model = moment(field.model).toDate();
            }
          });
          break;
        }
        case 'single-choice':
        case 'multiple-choice': {
          var filter = $filter('filter');
          var limitTo = $filter('limitTo');
          field.type = $attrs.nomenclature;
          field.values = Nomenclature.query({type: field.type});

          $scope.$watch('field.model', function() {
            if (field.model) {
              if (!field.value || field.value.slug != field.model.slug) {
                field.value = angular.copy(field.model);
                field.value.prototype = Nomenclature.prototype;
                field.values.$promise.then(function(models) {
                  field.value = undefined;
                  models.every(function(model){
                    if (model.slug === field.model.slug) {
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
            field.model = field.value;

            if (field.select)
              $timeout(function(){
                field.select();
              });
          };

          field.cancel = function() {
            if (field.onCancel)
              field.onCancel();
          };

          field.onSelect = function() {
            if (field.onConfirm) return;
            field.onConfirm();
          };

          break;
        }
      }
    }
  };
});
