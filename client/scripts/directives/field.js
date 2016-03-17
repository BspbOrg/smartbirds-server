/**
 * Created by groupsky on 11.01.16.
 */
var angular = require('angular');
var moment = require('moment');

require('../app').directive('field', /*@ngInject*/function () {
  return {
    restrict: 'AE',
    scope: {
      name: '@',
      label: '@?',
      placeholder: '@?',
      help: '@?',
      model: '=',
      nomenclature: '@?',
      select: '&?onSelect'
    },
    bindToController: true,
    require: '^form',
    templateUrl: function ($element, $attrs) {
      return '/views/fields/' + ($attrs.type || 'general') + '.html';
    },
    link: function ($scope, $element, $attrs, formCtrl) {
      $scope.form = formCtrl;
    },
    controllerAs: 'field',
    controller: /*@ngInject*/function ($scope, $attrs, $filter, $timeout, Nomenclature, Zone, db) {
      var field = this;

      $scope.$watch('form', function (form) {
        field.form = form;
      });
      field.type = $attrs.type;
      field.required = angular.isDefined($attrs.required);
      field.order = function (item) {
        return item && item.toString().replace(/\d+/g, function(digits) {
            return ((new Array(20).join('0'))+digits).substr(-20, 20);
          });
      };

      field.onSelect = function() {
        $timeout(function(){
          if (angular.isFunction(field.select)) {
            field.select()({model: field.model});
          }
        });
      };

      switch ($attrs.type) {
        case 'date':
        case 'time':
        {
          $scope.$watch('field.model', function () {
            if (angular.isString(field.model)) {
              field.model = moment(field.model).toDate();
            }
          });
          break;
        }
        case 'single-choice':
        case 'multiple-choice':
        {
          field.values = Nomenclature.query({type: field.nomenclature});

          $scope.$watch('field.model', function () {
            if (field.model) {
              if (angular.isArray(field.model)) {
                field.model.forEach(function(item, idx, array){
                  if (angular.isObject(item) && !(item instanceof Nomenclature)) {
                    array[idx] = new Nomenclature(item);
                  }
                });
              } else if (angular.isObject(field.model)) {
                if (!(field.model instanceof Nomenclature)) {
                  field.model = new Nomenclature(field.model);
                }
              }
            }
          });

          break;
        }
        case 'zone': {
          field.values = [];
          angular.forEach(db.zones, function(zone) {
            if (zone.status !== 'owned') return;
            field.values.push(zone);
          });
          field.values.sort(function(a,b){
            return a.id < b.id ? -1 : a.id > b.id ? +1 : 0;
          });
          break;
        }

      }
    }
  };
});
