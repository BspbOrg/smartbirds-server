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
      selectedZone: '=model'
    },
    controllerAs: 'map',
    controller: /*@ngInject*/function ($scope) {
      var vc = extend(this, {
        center: {latitude: 42.744820608, longitude: 25.2151370694},
        zoom: 8,
        zones: {
          all: [],
          free: [],
          requested: [],
          owned: []
        },
        options: {
          maxZoom: 15
        },
        controls: {
          free: {},
          owned: {}
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
                    vc.zones[marker.model.getStatus()].push(marker.model);
                  }
                });
              });
              //vc.zones.forEach(function(status){
              //  if (angular.isFunction($rootScope.zonesControl[status].updateModels))
              //    $rootScope.zonesControl[status].updateModels($rootScope.visibleZones[status]);
              //});
            }
          },
          free: {
            click: function (poly, event, model, args) {
              var idx = vc.zones.free.indexOf(model);
              if (idx !== -1) {
                vc.zones.free.splice(idx, 1);
              }
              if ($scope.selectedZone) {
                vc.zones.free.push($scope.selectedZone);
              }
              vc.controls.free.updateModels(vc.zones.free);
              $scope.selectedZone = model;
            }
          },
          selected: {
            click: function (poly, event, model, args) {
              vc.zones.free.push($scope.selectedZone);
              $scope.selectedZone = null;
              vc.controls.free.updateModels(vc.zones.free);
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
          vc.zones[zone.getStatus()].push(zone);
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
