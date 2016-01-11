/**
 * Created by groupsky on 11.01.16.
 */

require('../app').controller('MonitoringDetailController', /*@ngInject*/function ($stateParams, FormCBM) {

  var controller = this;

  controller.data = FormCBM.get({id: $stateParams.id});

});
