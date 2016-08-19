/**
 * Created by groupsky on 08.01.16.
 */

var _ = require('lodash');
var angular = require('angular');
require('../app').controller('MonitoringController', /*@ngInject*/function ($state, $stateParams, $q, model, ngToast, db, Raven, ENDPOINT_URL, $httpParamSerializer, $cookies, formName) {

  var controller = this;
  var lastModel = false;

  controller.db = db;
  controller.filter = angular.copy($stateParams);
  controller.years = Object.keys(new Int8Array(new Date().getFullYear() - 1979)).map(function (year) {
    return Number(year) + 1980
  }).reverse();
  controller.species = {};
  $q.resolve(db.species.$promise || db.species).then(function (species) {
    return species.birds.$promise || species.birds;
  }).then(function (species) {
    controller.species = species;
  });
  controller.visits = {};
  controller.map = {
    center: {latitude: 42.744820608, longitude: 25.2151370694},
    zoom: 8,
    options: {},
    zones: [],
    selected: {},
    polygon: {
      click: function (polygon, eventName, model) {
        if (controller.map.selected && controller.map.selected.zone === model) {
          controller.map.selected = {};
        } else {
          controller.map.selected = {zone: model};
        }
      }
    },
    marker: {
      click: function (marker, eventName, model) {
        if (controller.map.selected && controller.map.selected.pin === model) {
          controller.map.selected = {};
        } else {
          controller.map.selected = {pin: model};
        }
      }
    }
  };
  controller.tab = 'list';
  if (formName == 'cbm') {
    $q.resolve(db.nomenclatures.$promise || db.nomenclatures).then(function (nomenclatures) {
      return nomenclatures.cbm_visit_number.$promise || nomenclatures.cbm_visit_number;
    }).then(function (visits) {
      controller.visits = visits;
    });
    $q.resolve(db.zones.$promise || db.zones).then(function (zones) {
      controller.zones = [];
      angular.forEach(db.zones, function (zone, key) {
        controller.zones.push(zone);
      });
      controller.zones.sort(function (a, b) {
        return a.id < b.id ? -1 : a.id > b.id ? +1 : 0;
      })
    });
  }

  controller.updateFilter = function () {
    var filter = _.mapValues(controller.filter, function(value) {
      return value && angular.isFunction(value.toJSON) && value.toJSON() || value;
    });
    console.log($stateParams, '->', filter);
    if (angular.equals(filter, $stateParams))
      return;
    $state.go('.', filter, {
      notify: false
    });
    angular.extend($stateParams, filter);
    controller.requestRows();
  };

  controller.toggleSelected = function (row) {
    if (!row) {
      var selected = !controller.allSelected;
      controller.rows.forEach(function (row) {
        row.$selected = selected;
      });
      controller.allSelected = selected;
      controller.selectedRows = selected ? controller.rows : [];
    } else {
      row.$selected = !row.$selected;
      controller.selectedRows = controller.rows.filter(function (row) {
        return row.$selected;
      });
      controller.allSelected = controller.selectedRows.length === controller.rows.length;
    }
  };

  controller.deleteRows = function (rows) {
    $q.all(rows.map(function (row) {
      return row.$delete().then(function (res) {
        var idx = controller.rows.indexOf(row);
        if (idx !== -1) {
          controller.rows.splice(idx, 1);
        }
        return res;
      });
    })).then(function () {
      ngToast.create({
        className: 'success',
        content: "Deleted " + rows.length + " records"
      });
    }, function (error) {
      Raven.captureMessage(JSON.stringify(error));
      ngToast.create({
        className: 'danger',
        content: '<p>Error during deletion!</p><pre>' + (error && error.data && error.data.error || JSON.stringify(error, null, 2)) + '</pre>'
      });
      return $q.reject(error);
    });
  };

  function fetch(query) {
    controller.loading = true;
    controller.downloadLink = ENDPOINT_URL + '/'+formName+'.csv?' + $httpParamSerializer(angular.extend({}, query, {
        limit: -1,
        offset: 0,
        csrfToken: $cookies.get('sb-csrf-token')
      }));
    return model.query(query).$promise
      .then(function (rows) {
        controller.count = rows.$$response.data.$$response.count;
        controller.rows.push.apply(controller.rows, rows);
        controller.map.rows.push.apply(controller.map.rows, rows);
        controller.map.rows.length = Math.min(controller.map.rows.length, 1000);
        controller.endOfPages = !rows.length;
        rows.forEach(function (row) {
          var key = '$' + row.zone;
          if (!(key in controller.map.zones)) {
            controller.map.zones[key] = true;
            controller.map.zones.push(db.zones[row.zone]);
          }
        });
        return rows;
      })
      .finally(function () {
        controller.loading = false;
      });
  }

  controller.requestRows = function () {
    controller.rows = [];
    controller.endOfPages = false;
    controller.map.zones = [];
    controller.map.rows = [];
    controller.filter.limit = controller.tab == 'list' ? 50 : 1000;
    fetch(controller.filter);
  };
  controller.requestRows();

  controller.nextPage = function (count) {
    fetch(angular.extend({}, controller.filter, {
      offset: controller.rows.length,
      limit: count || (controller.tab == 'list' ? 50 : 1000)
    }));
  };

})
;
