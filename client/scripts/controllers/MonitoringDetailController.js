/**
 * Created by groupsky on 11.01.16.
 */

require('../app').controller('MonitoringDetailController', /*@ngInject*/function ($stateParams, FormCBM) {

  var controller = this;

  controller.data = $stateParams.id?FormCBM.get({id: $stateParams.id}):new FormCBM();

  controller.save = function() {
    controller.data.$save();
  };
});
