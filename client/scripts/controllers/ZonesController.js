/**
 * Created by groupsky on 20.11.15.
 */

require('../app').controller('ZonesController', function($scope, Zone, GMAP_KEY){
  var controller = this;

  $scope.rows = Zone.query();

  controller.filterRows = function(config) {
    return function(row) {
      return true;
    }
  };

  controller.getStaticMap = function(zone) {
    var url = "//maps.googleapis.com/maps/api/staticmap?";
    url += "&center="+zone.getCenter().latitude+","+zone.getCenter().longitude;
    url += "&zoom=14&size=500x400&maptype=terrain";
    url += "&key="+GMAP_KEY;
    // {color: zone.getStatus()=='free'?'#fff':zone.getStatus()=='owned'?'#f00':'#f90', opacity: 0.7, weight: 0.5}
    url += "&path=color:";
    var color;
    switch (zone.getStatus()) {
      case 'free': color = '0x000000'; break;
      case 'owned': color = '0xFF0000'; break;
      default: color = '0xFF9900'; break;
    }
    url += color + '00|weight:0.5|fillcolor:' + color + '66';
    url += zone.coordinates.reduce(function(res, point){
      return res + '|' + point.latitude + ',' + point.longitude;
    }, '');
    return url;
  }
});
