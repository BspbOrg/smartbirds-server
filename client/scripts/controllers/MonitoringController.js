/**
 * Created by groupsky on 08.01.16.
 */

var angular = require('angular');
require('../app').controller('MonitoringController', /*@ngInject*/function($state, $stateParams, FormCBM) {

  var controller = this;

  controller.filter = angular.copy($stateParams);

  controller.updateFilter = function() {
    if (angular.equals(controller.filter, $stateParams))
      return;
    $state.go('.', controller.filter, {
      notify: false
    });
    controller.requestRows();
  };

  controller.requestRows = function() {
    controller.rows = FormCBM.query(controller.filter);
  };
  controller.requestRows();
});
