/**
 * Created by groupsky on 11.01.16.
 */
var angular = require('angular');
var moment = require('moment');

require('../app').directive('field', /*@ngInject*/function ($q) {
  return {
    restrict: 'AE',
    scope: {
      name: '@',
      label: '@?',
      placeholder: '@?',
      help: '@?',
      model: '=',
      nomenclature: '@?',
      select: '&?onSelect',
      match: '=?',
      format: '=?',
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
    controller: /*@ngInject*/function ($scope, $attrs, $filter, $parse, $timeout, Nomenclature, Species, db) {
      var field = this;

      $scope.$watch('form', function (form) {
        field.form = form;
      });
      field.type = $attrs.type;
      field.required = angular.isDefined($attrs.required);
      field.readonly = 'readonly' in $attrs ? (angular.isDefined($attrs.readonly) ? $parse($attrs.readonly)($scope.$parent) : true) : false;
      field.autocomplete = $attrs.autocomplete;
      field.order = function (item) {
        return item && item.toString().replace(/\d+/g, function (digits) {
            return ((new Array(20).join('0')) + digits).substr(-20, 20);
          });
      };

      field.onSelect = function () {
        $timeout(function () {
          if (angular.isFunction(field.select)) {
            field.select({model: field.model});
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
        case 'species':
        {
          field.values = [];
          angular.forEach(db.species[field.nomenclature], function (item) {
            field.values.push(item);
          });

          $scope.$watch('field.model', function () {
            if (field.model) {
              if (angular.isArray(field.model)) {
                field.model.forEach(function (item, idx, array) {
                  if (angular.isObject(item) && !(item instanceof Species)) {
                    array[idx] = db.species[field.nomenclature][item.label.bg] || new Species(item);
                  }
                });
              } else if (angular.isObject(field.model)) {
                if (!(field.model instanceof Species)) {
                  field.model = db.species[field.nomenclature][field.model.label.bg] || new Species(field.model);
                }
              }
            }
          });

          break;
        }
        case 'user':
        {
          field.values = [];
          angular.forEach(db.users, function (item) {
            field.values.push(item);
          });
          break;
        }
        case 'single-choice':
        case 'multiple-choice':
        {
          field.values = [];
          angular.forEach(db.nomenclatures[field.nomenclature], function (item) {
            field.values.push(item);
          });

          $scope.$watch('field.model', function () {
            if (field.model) {
              if (angular.isArray(field.model)) {
                field.model.forEach(function (item, idx, array) {
                  if (angular.isObject(item) && !(item instanceof Nomenclature)) {
                    array[idx] = db.nomenclatures[field.nomenclature][item.label.bg] || new Nomenclature(item);
                  }
                });
              } else if (angular.isObject(field.model)) {
                if (!(field.model instanceof Nomenclature)) {
                  field.model = db.nomenclatures[field.nomenclature][field.model.label.bg] || new Nomenclature(field.model);
                }
              }
            }
          });

          break;
        }
        case 'zone':
        {
          field.values = [];
          angular.forEach(db.zones, function (zone) {
            if (zone.status !== 'owned') return;
            field.values.push(zone);
          });
          field.values.sort(function (a, b) {
            return a.id < b.id ? -1 : a.id > b.id ? +1 : 0;
          });
          break;
        }

        case 'select':
        {
          field.values = $parse($attrs.choices)($scope.$parent);
        }

      }
    }
  };
});
