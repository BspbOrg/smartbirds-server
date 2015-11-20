/**
 * Created by groupsky on 20.11.15.
 */

require('../app').controller('ZoneController', function($scope, $stateParams, Zone) {
  var controller = this;

  $scope.zone = Zone.get({id: $stateParams.id});
});
