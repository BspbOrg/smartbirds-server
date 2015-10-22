/**
 * Created by groupsky on 22.10.15.
 */

angular.module('sb')
    .controller('DataController', function DataController($rootScope, $scope) {
        var vc = window.dataController = this;
        var i = null;

        vc.users = chance.unique(chance.name, 300);
        vc.users.push($rootScope.$user.name);
        vc.locations = chance.unique(chance.address, 1100);
        vc.monitorings = ['2015 II', '2015 I', '2014 II', '2014 I', 'никога'];
        vc.statuses = ['owned', 'requested', 'free'];
        vc.zones = [];
        for (i = 0; i < 500; i++) {
            zone = {
                id: i + 1,
                location: chance.pick(vc.locations),
                last_monitoring: chance.pick(vc.monitorings),
                status: chance.pick(vc.statuses)
            };
            if (zone.status != 'free')
                zone.owner = chance.pick(vc.users);
            vc.zones.push(zone);
        }

        vc.filterZones = function(filter) {
            return function(zone) {
                if (filter && filter.owner && filter.owner.length) {
                    if (filter.owner.indexOf(zone.owner) == -1) return false;
                }

                if (filter && filter.location && filter.location != zone.location) {
                    return false;
                }

                if (filter && filter.last_monitoring) {
                    var fidx = vc.monitorings.indexOf(filter.last_monitoring);
                    var zidx = vc.monitorings.indexOf(zone.last_monitoring);
                    if (fidx < zidx) return false;
                }

                if (filter && filter.status && filter.status.length) {
                    if (filter.status.indexOf(zone.status) == -1) return false;
                }

                if (!$rootScope.$user.isAdmin && (zone.owner || !filter.status == 'free')) {
                    if ($rootScope.$user.name != zone.owner) return false;
                }
                return true;
            }
        };
    });
