/**
 * Created by groupsky on 20.10.15.
 */

var sb = angular.module('sb', [
    'ngSanitize',

    'ui.router',
    'ui.bootstrap',
    'ui.select',

    'uiGmapgoogle-maps'
]);

sb.run(function ($rootScope, $state, $stateParams) {
    // It's very handy to add references to $state and $stateParams to the $rootScope
    // so that you can access them from any scope within your applications.For example,
    // <li ng-class="{ active: $state.includes('contacts.list') }"> will set the <li>
    // to active whenever 'contacts.list' or one of its decendents is active.
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $rootScope.$user = {
        isAdmin: true,
        name: "Иван Петров"
    };
    window.$rootScope = $rootScope;
});

sb.config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider
        .otherwise('/');


    //////////////////////////
    // State Configurations //
    //////////////////////////

    // Use $stateProvider to configure your states.
    $stateProvider

        //////////
        // Home //
        //////////
        .state("home", {
            url: "/",
            templateUrl: '/views/home.html',
            title: 'Home'
        })

        ///////////
        // Login //
        ///////////
        .state('login', {
            url: '/login',
            templateUrl: '/views/login.html',
            title: 'Login'
        })

        ///////////
        // Auth //
        ///////////
        .state('auth', {
            abstract: true,
            templateUrl: '/views/layout.html',
            controller: 'DataController',
            controllerAs: 'data'
        })

        ///////////
        // Dashboard //
        ///////////
        .state('auth.dashboard', {
            url: '/dashboard',
            views: {
                'content': {templateUrl: '/views/dashboard.html'}
            }
        })

        ///////////
        // Zones //
        ///////////
        .state('auth.zones', {
            url: '/zones',
            views: {
                'content': {templateUrl: '/views/zones/index.html'}
            }
        })

        ///////////
        // Zones //
        ///////////
        .state('auth.zones.request', {
            url: '/request',
            views: {
                'content@auth': {templateUrl: '/views/zones/request.html'}
            }
        })
});

sb.filter('default', function () {
    return function (val, def) {
        return val || def;
    }
});

sb.config(function (uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyDvQcR1ysfLv2FpuQJ6twvQbJB-ttp-l00',
        libraries: 'geometry,visualization'
    });
});

sb.run(function ($rootScope, zones, locations) {
    $rootScope.map = {
        center: {latitude: 42.744820608, longitude: 25.2151370694},
        zoom: 11
    };
    $rootScope.freeVisibleZones = [];
    $rootScope.ownedVisibleZones = [];
    $rootScope.freeZonesControl = {};
    $rootScope.ownedZonesControl = {};
    $rootScope.zones = zones.map(function (zone) {
        zone = {
            id: zone.id,
            owned: zone.owned,
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
    $rootScope.updateCenter = function(from, to) {
        console.log(from, to);
        if (from && from.center)
            to.center = angular.copy(from.center);
    }
    var addZone = function (zone) {
        var zones = zone.owned ? $rootScope.ownedVisibleZones : $rootScope.freeVisibleZones;
        var ctrl = zone.owned ? $rootScope.ownedZonesControl : $rootScope.freeZonesControl;
        zones.push(zone);
    };
    var remZone = function (zone) {
        var zones = zone.owned ? $rootScope.ownedVisibleZones : $rootScope.freeVisibleZones;
        var ctrl = zone.owned ? $rootScope.ownedZonesControl : $rootScope.freeZonesControl;
        var idx = zones.indexOf(zone);
        if (idx != -1) {
            zones.splice(idx, 1);
        }
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
                    var zones = zone.owned ? $rootScope.ownedVisibleZones : $rootScope.freeVisibleZones;
                    var ctrl = zone.owned ? $rootScope.ownedZonesControl : $rootScope.freeZonesControl;
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
                    ctrl.updateModels(zones);
                    return false;
                });
        }
    };
    $rootScope.clusterEvents = {
        clusteringend: function (markerClusterer) {
            $rootScope.freeVisibleZones.length = 0;
            $rootScope.ownedVisibleZones.length = 0;
            markerClusterer.getClusters().forEach(function (cluster) {
                var visible = cluster.getSize() == 1;
                cluster.getMarkers().each(function (marker) {
                    marker.model.visible = visible;
                    if (visible && !marker.model.selected) {
                        (marker.model.owned ? $rootScope.ownedVisibleZones : $rootScope.freeVisibleZones).push(marker.model);
                    }
                });
            });
            $rootScope.freeZonesControl.updateModels($rootScope.freeVisibleZones);
            $rootScope.ownedZonesControl.updateModels($rootScope.ownedVisibleZones);
        }
    };
});
