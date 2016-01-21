/**
 * Created by groupsky on 21.01.16.
 */

require('../app').controller('DashboardController', /*@ngInject*/function(Zone, user){
  var vc = this;

  vc.pendingZones = Zone.query({
    status: 'requested',
    limit: 10,
  });

  vc.ownedZones = Zone.query({
    status: 'owned',
    limit: 100,
    owner: user.getIdentity().id,
  });
});
