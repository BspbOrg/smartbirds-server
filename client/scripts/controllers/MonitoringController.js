/**
 * Created by groupsky on 08.01.16.
 */

var angular = require('angular');
require('../app').controller('MonitoringController', /*@ngInject*/function($state, $stateParams, FormCBM, Zone, Nomenclature) {

  var controller = this;

  controller.filter = angular.copy($stateParams);
  controller.zones = Zone.query();
  controller.visits = Nomenclature.query({type: 'cbm_visit_number'});
  controller.years = Object.keys(new Int8Array(new Date().getFullYear()-1979)).map(function(year){return Number(year)+1980}).reverse();

  controller.updateFilter = function() {
    console.log($stateParams, '->', controller.filter);
    if (angular.equals(controller.filter, $stateParams))
      return;
    $state.go('.', controller.filter, {
      notify: false
    });
    angular.extend($stateParams, controller.filter);
    controller.requestRows();
  };

  controller.requestRows = function() {
    controller.rows = FormCBM.query(controller.filter);
  };
  controller.requestRows();
});
