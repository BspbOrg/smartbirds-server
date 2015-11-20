/**
 * Created by groupsky on 20.11.15.
 */

require('../app').controller('ZonesController', function($scope, Zone){
  var controller = this;

  $scope.rows = Zone.query();

  controller.filterRows = function(config) {
    return function(row) {
      return true;
    }
  }
});
