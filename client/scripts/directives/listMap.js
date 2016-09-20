var angular = require('angular');

require("../app").directive('listMap', /*@ngInject*/function (db) {
  return {
    templateUrl: '/views/directives/listmap.html',
    scope: {
      rows: '=?',
      ctrl: '=?',
    },
    bindToController: true,
    controller: function ($scope) {
      var $ctrl = this;

      angular.extend($ctrl, {
        center: {latitude: 42.744820608, longitude: 25.2151370694},
        zoom: 8,
        zones: [],
        zonesIndex: {},
        options: {},
        selected: {},
        polygon: {
          click: function (polygon, eventName, model) {
            if ($ctrl.selected && $ctrl.selected.zone === model) {
              $ctrl.selected = {};
            } else {
              $ctrl.selected = {zone: model};
            }
          }
        },
        marker: {
          control: {},
          click: function (marker, eventName, model) {
            if ($ctrl.selected && $ctrl.selected.pin === model) {
              $ctrl.selected = {};
            } else {
              $ctrl.selected = {pin: model};
            }
          }
        },
        addRows: function (rows) {
          $ctrl.rows = [].concat($ctrl.rows || [], rows || []);
          $ctrl.refresh();
        },
        extractZones: function (rows) {
          (rows || $ctrl.rows).forEach(function (row) {
            if (!row.zone || !db.zones[row.zone]) return;
            if ($ctrl.zonesIndex[row.zone]) return;
            $ctrl.zonesIndex[row.zone] = $ctrl.zones.length;
            $ctrl.zones.push(db.zones[row.zone]);
          });
        },
        refresh: function (rows) {
          $ctrl.extractZones(rows);
          if (angular.isFunction($ctrl.marker.control.newModels)) {
            $ctrl.marker.control.newModels($ctrl.rows);
          }
        },
        clear: function() {
          $ctrl.zones = [];
          $ctrl.zonesIndex = {};
          $ctrl.rows = {};
          $ctrl.selected = {};
        },
      });

      // expose ctrl interface
      if (angular.isObject($ctrl.ctrl)) {
        $ctrl.ctrl.clear = function(){
          if ($ctrl) $ctrl.clear.apply(this, arguments);
        };
        $ctrl.ctrl.refresh = function() {
          if ($ctrl) $ctrl.refresh.apply(this, arguments);
        };
        // prevent memory leaks
        $scope.$on('$destroy', function() {
          delete $ctrl.ctrl.clear;
          delete $ctrl.ctrl.refresh;
          delete $ctrl.zones;
          $ctrl = null;
        });
      }
    },
    controllerAs: '$ctrl',
  }
});
