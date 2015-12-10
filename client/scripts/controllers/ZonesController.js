/**
 * Created by groupsky on 20.11.15.
 */

require('../app').controller('ZonesController', function ($scope, Zone, GMAP_KEY, zones, user, User) {
  var controller = this;

  $scope.rows = zones;
  $scope.visibleRows = [].concat(zones);
  $scope.zoneStatuses = Zone.statuses();
  controller.filter = {
    status: ['requested', 'owned']
  };

  controller.getUsers = function (filter) {
    if (controller.loadingUsers && controller.loadingUsers.cancel)
      controller.loadingUsers.cancel();
    var users = User.query({q: filter});
    controller.loadingUsers = users.$promise;
    users.$promise.finally(function () {
      controller.loadingUsers = null;
    });
    return users.$promise;
  };

  controller.filterRows = function() {
    var filter = controller.filterZones(controller.filter);
    $scope.visibleRows = [];
    $scope.rows.every(function(row){
      if (filter(row)) $scope.visibleRows.push(row);
      return $scope.visibleRows.length < 25;
    });
  };
  zones.$promise.then(controller.filterRows);
  $scope.$watch(function(){return controller.filter;}, controller.filterRows, true);

  controller.getStaticMap = function (zone) {
    var url = "//maps.googleapis.com/maps/api/staticmap?";
    url += "&center=" + zone.getCenter().latitude + "," + zone.getCenter().longitude;
    url += "&zoom=14&size=500x400&maptype=terrain";
    url += "&key=" + GMAP_KEY;
    // {color: zone.getStatus()=='free'?'#fff':zone.getStatus()=='owned'?'#f00':'#f90', opacity: 0.7, weight: 0.5}
    url += "&path=color:";
    var color;
    switch (zone.getStatus()) {
      case 'free':
        color = '0x000000';
        break;
      case 'owned':
        color = '0xFF0000';
        break;
      default:
        color = '0xFF9900';
        break;
    }
    url += color + '00|weight:0.5|fillcolor:' + color + '66';
    url += zone.coordinates.reduce(function (res, point) {
      return res + '|' + point.latitude + ',' + point.longitude;
    }, '');
    return url;
  };

  controller.rejectRequest = function (zone) {
    zone.$respond(false);
  };

  controller.approveRequest = function (zone) {
    zone.$respond(true);
  };

  controller.removeOwner = function (zone) {
    zone.$removeOwner();
  };

  controller.setOwner = function (zone, owner) {
    zone.$setOwner(owner);
  };

  controller.filterZones = function (filter) {
    return function (zone) {
      if (filter && filter.status && filter.status.length) {
        if (filter.status.indexOf(zone.status) == -1) return false;
      }

      if (filter && filter.owner) {
        if (angular.isArray(filter.owner)) {
          if (filter.owner.length) {
            if (filter.owner.indexOf(zone.ownerId) === -1) return false;
          }
        } else if (angular.isObject(filter.owner)) {
          if (filter.owner.id) {
            if (filter.owner.id !== zone.ownerId) return false;
          }
        } else {
          if (filter.owner !== zone.ownerId) return false;
        }
      }

      if (filter && filter.location && filter.location.zones && filter.location.zones.indexOf(zone) == -1) {
        return false;
      }

      if (filter && filter.last_monitoring) {
        var fidx = vc.monitorings.indexOf(filter.last_monitoring);
        var zidx = vc.monitorings.indexOf(zone.last_monitoring);
        if (fidx < zidx) return false;
      }

      if (!user.isAdmin() && zone.status != 'free') {
        if (user.getIdentity().id != zone.ownerId) return false;
      }
      return true;
    }
  };
});
