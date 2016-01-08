/**
 * Created by groupsky on 08.01.16.
 */

require('../app').controller('MonitoringController', /*@ngInject*/function($state, $stateParams, FormCBM) {

  var controller = this;

  controller.filter = $stateParams;

  controller.updateFilter = function() {
    $state.go($state.current.name, controller.filter, {
      notify: false
    });
    controller.requestRows();
  };

  controller.requestRows = function() {
    controller.rows = FormCBM.query(controller.filter);
  };
  controller.requestRows();
});
