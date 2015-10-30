/**
 * Created by groupsky on 30.10.15.
 */

var app = require('../app');
var chance = require('chance');

app.constant('locations', require('./locations'));
app.constant('zones', require('./zones'));

app.run(function ($rootScope, zones, locations) {
    $rootScope.map = {
        center: {latitude: 42.744820608, longitude: 25.2151370694},
        zoom: 11
    };

    $rootScope.monitorings = ['2015 II', '2015 I', '2014 II', '2014 I', 'никога'];
    $rootScope.zoneStatuses = ['owned', 'requested', 'free'];
    $rootScope.visibleZones = {};
    $rootScope.zonesControl = {};
    $rootScope.zoneStatuses.forEach(function(status){
        $rootScope.visibleZones[status] = [];
        $rootScope.zonesControl[status] = {};
    });
    $rootScope.zones = zones.map(function (zone) {
        zone = {
            id: zone.id,
            status: zone.owned?'owned':'free',
            path: zone.points.map(function (point) {
                return {latitude: point.y, longitude: point.x}
            }),
            center: {
                latitude: zone.points.reduce(function (sum, point) {
                    return sum + point.y;
                }, 0) / zone.points.length,
                longitude: zone.points.reduce(function (sum, point) {
                    return sum + point.x;
                }, 0) / zone.points.length
            }
        };
        zone.map_center = zone.center;
        locations.every(function (location) {
            if (location.zone_id != zone.id) return true;
            location.zones = location.zones || [];
            location.zones.push(zone);
            return false;
        });
        return zone;
    });
    $rootScope.locations = [];
    locations.forEach(function (location) {
        location.id = location.area_bg + '/' + location.city_bg;
        if ($rootScope.locations.every(function (loc) {
                if (loc.id != location.id) return true;
                loc.zones = loc.zones.concat(location.zones);
                return false;
            })) {
            $rootScope.locations.push(location);
        }
    });
    $rootScope.areas = [];
    $rootScope.locations.forEach(function (location) {
        var area = {
            id: location.area_bg,
            area_bg: location.area_bg,
            area_en: location.area_en,
            zones: location.zones,
            locations: [location]
        };
        if ($rootScope.areas.every(function (a) {
                if (a.id != area.id) return true;
                a.zones = a.zones.concat(area.zones);
                a.locations = a.locations.concat(area.locations);
                return false;
            })) {
            $rootScope.areas.push(area);
        }
    });
    $rootScope.areas.forEach(function(area){
        area.locations.forEach(function(location){
            location.zones.forEach(function(zone){
                zone.location = location.id;
            });
        });
    });
    $rootScope.areas.forEach(function(area){
        area.locations.forEach(function(location){
            location.center = {
                latitude: location.zones.reduce(function(sum,zone){return sum+zone.center.latitude},0)/location.zones.length,
                longitude: location.zones.reduce(function(sum,zone){return sum+zone.center.longitude},0)/location.zones.length
            }
        });
        area.center = {
            latitude: area.locations.reduce(function(sum,location){return sum+location.center.latitude},0)/area.locations.length,
            longitude: area.locations.reduce(function(sum,location){return sum+location.center.longitude},0)/area.locations.length
        }
    });
    $rootScope.areaLocations = [].concat($rootScope.areas, $rootScope.locations);
    $rootScope.updateCenter = function(from, to) {
        console.log(from, to);
        if (from && from.center)
            to.center = angular.copy(from.center);
    };
    var addZone = function (zone) {
        var zones = $rootScope.visibleZones[zone.status];
        var ctrl = $rootScope.zonesControl[zone.status];
        zones.push(zone);
        ctrl.updateModels(zones);
    };
    var remZone = function (zone) {
        var zones = $rootScope.visibleZones[zone.status];
        var ctrl = $rootScope.zonesControl[zone.status];
        var idx = zones.indexOf(zone);
        if (idx != -1) {
            zones.splice(idx, 1);
        }
        ctrl.updateModels(zones);
    };
    $rootScope.zonesEvents = {
        click: function (poly, event, model, args) {
            console.log('clicked a zone', arguments);
            (model.id ? $rootScope.zones : (function () {
                model.id = $rootScope.selectedZone.id;
                return [$rootScope.selectedZone];
            })()).every(function (zone) {
                    if (zone.id != model.id) {
                        return true;
                    }
                    zone.selected = !zone.selected;
                    var zones = $rootScope.visibleZones[zone.status];
                    var ctrl = $rootScope.visibleZones[zone.status];
                    if (zone.selected) {
                        if ($rootScope.selectedZone) {
                            $rootScope.selectedZone.selected = false;
                            addZone($rootScope.selectedZone);
                        }
                        $rootScope.selectedZone = zone;
                        remZone(zone);
                    } else {
                        if ($rootScope.selectedZone) {
                            $rootScope.selectedZone.selected = false;
                            addZone($rootScope.selectedZone);
                        }
                        $rootScope.selectedZone = null;
                    }
                    return false;
                });
        }
    };
    $rootScope.clusterEvents = {
        clusteringend: function (markerClusterer) {
            for (status in $rootScope.visibleZones) {
                $rootScope.visibleZones[status].length = 0;
            };
            markerClusterer.getClusters().forEach(function (cluster) {
                var visible = cluster.getSize() == 1;
                cluster.getMarkers().each(function (marker) {
                    marker.model.visible = visible;
                    if (visible && !marker.model.selected) {
                        $rootScope.visibleZones[marker.model.status].push(marker.model);
                    }
                });
            });
            $rootScope.zoneStatuses.forEach(function(status){
                if (angular.isFunction($rootScope.zonesControl[status].updateModels))
                    $rootScope.zonesControl[status].updateModels($rootScope.visibleZones[status]);
            });
        }
    };
});
