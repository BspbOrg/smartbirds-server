/**
 * Created by groupsky on 01.04.16.
 */

var angular = require('angular');
var extend = require('angular').extend;

require('../app').directive('homeMap', /*@ngInject*/function () {
  var lastModel = undefined;
  return {
    restrict: 'AE',
    templateUrl: '/views/directives/homemap.html',
    controller: /*@ngInject*/function ($scope, $q, api, Zone) {
      var vc = extend(this, {
        center: {latitude: 42.744820608, longitude: 25.2151370694},
        zoom: 8,
        zones: [],
        options: {
          maxZoom: 15,
          scrollwheel: false
        },
        marker: {
          click: function(marker, eventName, model) {
            if (lastModel && lastModel !== model) lastModel.show = false;
            model.show = !model.show;
            lastModel = model;
          }
        }
      });

      api.stats.homepage().then(function (zones) {
        angular.forEach(zones, function (zone) {
          zone.coordinates = [
            {latitude: zone.lat1, longitude: zone.lon1},
            {latitude: zone.lat2, longitude: zone.lon2},
            {latitude: zone.lat3, longitude: zone.lon3},
            {latitude: zone.lat4, longitude: zone.lon4}
          ];
          zone.center = Zone.prototype.getCenter.apply(zone);
          vc.zones.push(zone);
        });
      });
    },
    controllerAs: 'map'
  }
});
