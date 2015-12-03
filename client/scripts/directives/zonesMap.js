/**
 * Created by groupsky on 03.12.15.
 */

var extend = require('angular').extend;

require('../app').directive('zonesMap', /*@ngInject*/function () {
  return {
    restrict: 'AE',
    templateUrl: '/views/directives/zonemap.html',
    scope: {
      zones: '=',
      model: '='
    },
    controllerAs: 'map',
    controller: /*@ngInject*/function ($scope) {
      var vc = extend(this, {
        center: {latitude: 42.744820608, longitude: 25.2151370694},
        zoom: 8,
        zones: {
          all: [],
          free: [],
          owned: []
        },
        events: {
          cluster: {
            clusteringend: function (markerClusterer) {
              Object.keys(vc.zones).forEach(function(status){
                if (status === 'all') return;
                vc.zones[status].length = 0;
              });
              markerClusterer.getClusters().forEach(function (cluster) {
                var visible = cluster.getSize() == 1;
                cluster.getMarkers().each(function (marker) {
                  marker.model.visible = visible;
                  if (visible && !marker.model.selected) {
                    vc.zones[marker.model.status].push(marker.model);
                  }
                });
              });
              //vc.zones.forEach(function(status){
              //  if (angular.isFunction($rootScope.zonesControl[status].updateModels))
              //    $rootScope.zonesControl[status].updateModels($rootScope.visibleZones[status]);
              //});
            }
          }
        }
      });



      function updateZones(){
        angular.forEach(vc.zones, function(zoneList) {
          zoneList.length = 0;
        });
        var center = {latitude: 0, longitude: 0};
        angular.forEach($scope.zones, function (zone) {
          zone.coordinates = zone.coordinates || zone.path;
          zone.center = zone.center || zone.getCenter();
          center.latitude += zone.center.latitude;
          center.longitude += zone.center.longitude;
          vc.zones.all.push(zone);
          vc.zones[zone.status].push(zone);
        });
        //if (vc.zones.all.length) {
        //  vc.center = {
        //    latitude: center.latitude/vc.zones.all.length,
        //    longitude: center.longitude/vc.zones.all.length
        //  };
        //}
      }

      $scope.$watch('zones', updateZones);
      $scope.$watch('zones.length', updateZones);
    }
  };
});
