/**
 * Created by groupsky on 20.11.15.
 */

var angular = require('angular'),
  isDefined = angular.isDefined,
  isUndefined = angular.isUndefined;

require('../app').factory('Zone', function ($resource, ENDPOINT_URL) {

  var Zone = $resource(ENDPOINT_URL + '/zone/:id', {
    id: '@id'
  }, {
    listByLocation: {
      method: 'GET',
      params: {
        locationId: '@locationId',
        filter: '@filter'
      },
      url: ENDPOINT_URL + '/locations/:locationId/zones/:filter',
      isArray: true
    },
    request: {
      method: 'POST',
      params: {
        zoneId: '@zoneId',
        userId: '@userId'
      },
      url: ENDPOINT_URL + '/zone/:zoneId/owner/:userId'
    }
  });

  // methods
  angular.extend(Zone.prototype, {
    getCenter: function () {
      if (isUndefined(this.coordinates)) return;
      return this.center = this.center || {
          latitude: this.coordinates.reduce(function (sum, point) {
            return sum + point.latitude;
          }, 0) / this.coordinates.length,
          longitude: this.coordinates.reduce(function (sum, point) {
            return sum + point.longitude;
          }, 0) / this.coordinates.length
        }
    },
    getStatus: function () {
      if (isUndefined(this.owner)) return;
      return this.owner ? 'owned' : 'free';
    }
  });

  return Zone;
});
