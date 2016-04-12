/**
 * Created by groupsky on 01.04.16.
 */

var angular = require('angular');
var extend = require('angular').extend;

require('../app').directive('homeMap', /*@ngInject*/function() {
  return {
    restrict: 'AE',
    templateUrl: '/views/directives/homemap.html',
    controller: /*@ngInject*/function($q, db) {
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

      $q.resolve(db.zones.$promise || db.zones).then(function(zones) {
        angular.forEach(zones, function(zone) {
          if (zone.getStatus() === 'free') return;
          zone.coordinates = zone.coordinates || zone.path;
          zone.center = zone.center || zone.getCenter();
          vc.zones.all.push(zone);
          vc.zones[zone.getStatus()].push(zone);
        });
      });
    },
    controllerAs: 'map'
  }
});
