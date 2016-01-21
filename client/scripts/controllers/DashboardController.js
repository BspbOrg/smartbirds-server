/**
 * Created by groupsky on 21.01.16.
 */

require('../app').controller('DashboardController', /*@ngInject*/function(Zone){
  var vc = this;

  vc.pendingZones = Zone.query({
    status: 'requested',
    limit: 10,
  });
});
