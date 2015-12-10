/**
 * Created by groupsky on 22.10.15.
 */

var chance = require('chance');

require('../app')
    .controller('DataController', function DataController($rootScope, $scope) {
        var vc = window.dataController = this;
        var i = null;

        vc.users = chance.unique(chance.name, 50);
        vc.users.push($rootScope.$user && $rootScope.$user.getIdentity().firstName || 'Иван Петров');
        vc.locations = $rootScope.locations;
        vc.monitorings = $rootScope.monitorings;
        vc.statuses = $rootScope.zoneStatuses;
        vc.zones = $rootScope.zones;
        vc.ownZones = [];
        vc.zones.forEach(function(zone){
            zone.last_monitoring = chance.pick(vc.monitorings);
            if (zone.status != 'free') {
                zone.owner = chance.pick(vc.users);
                if (zone.owner == $rootScope.$user.name)
                    vc.ownZones.push(zone);
            }
        });
        var id=1;
        //$rootScope.rows = chance.n(function() {
        //    var row = {
        //        id: id++,
        //        monitoring: chance.pick($rootScope.monitorings),
        //        zone: chance.pick(vc.ownZones),
        //        date: chance.date(),
        //        species: chance.word(),
        //        species_count: chance.integer({min:0,max:100})
        //    };
        //
        //    $rootScope.locations.every(function(location){
        //        if (location.zones.indexOf(row.zone) == -1) return true;
        //        row.location = location;
        //        return false;
        //    });
        //
        //    return row;
        //}, 100);


        vc.filterRows = function(filter) {
            return function(row) {
                if (filter && filter.monitoring && filter.monitoring != row.monitoring) {
                    return false;
                }
                if (filter && filter.zone && filter.zone != row.zone) {
                    return false;
                }
                if (filter && filter.location && filter.location.zones && filter.location.zones.indexOf(row.zone) == -1) {
                    return false;
                }
                return true;
            }
        }
    });
