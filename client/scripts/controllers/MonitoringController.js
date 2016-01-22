/**
 * Created by groupsky on 08.01.16.
 */

var angular = require('angular');
require('../app').controller('MonitoringController', /*@ngInject*/function($state, $stateParams, $q, FormCBM, Zone, Nomenclature, ngToast) {

  var controller = this;

  controller.filter = angular.copy($stateParams);
  controller.zones = Zone.query();
  controller.visits = Nomenclature.query({type: 'cbm_visit_number'});
  controller.years = Object.keys(new Int8Array(new Date().getFullYear()-1979)).map(function(year){return Number(year)+1980}).reverse();
  controller.species = Nomenclature.query({type: 'birds_name'});

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

  controller.toggleSelected = function(row) {
    if (!row) {
      var selected = !controller.allSelected;
      controller.rows.forEach(function(row) {
        row.$selected = selected;
      });
      controller.allSelected = selected;
      controller.selectedRows = selected?controller.rows:[];
    } else {
      row.$selected = !row.$selected;
      controller.selectedRows = controller.rows.filter(function(row){
        return row.$selected;
      });
      controller.allSelected = controller.selectedRows.length === controller.rows.length;
    }
  };

  controller.deleteRows = function(rows) {
    $q.all(rows.map(function(row){
      return row.$delete().then(function(res){
        var idx = controller.rows.indexOf(row);
        if (idx !== -1) {
          controller.rows.splice(idx, 1);
        }
        return res;
      });
    })).then(function(){
      ngToast.create({
        className: 'success',
        content: "Deleted "+rows.length+" records"
      });
    }, function(error){
      ngToast.create({
        className: 'danger',
        content: '<p>Error during deletion!</p><pre>' + (error && error.data && error.data.error || JSON.stringify(error, null, 2)) + '</pre>'
      });
      return $q.reject(error);
    });
  };

  controller.requestRows = function() {
    controller.rows = FormCBM.query(controller.filter);
  };
  controller.requestRows();
});
