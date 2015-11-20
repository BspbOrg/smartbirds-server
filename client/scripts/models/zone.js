/**
 * Created by groupsky on 20.11.15.
 */

require('../app').factory('Zone', function($resource, ENDPOINT_URL) {

  var Zone = $resource(ENDPOINT_URL+'/zone/:id', {
    id: '@id'
  });

  // methods
  angular.extend(Zone.prototype, {
    getCenter: function() {
      return this.center = this.center || {
          latitude: this.coordinates.reduce(function (sum, point) {
            return sum + point.latitude;
          }, 0) / this.coordinates.length,
          longitude: this.coordinates.reduce(function (sum, point) {
            return sum + point.longitude;
          }, 0) / this.coordinates.length
        }
    },
    getStatus: function() {
      return this.owner ? 'owned' : 'free';
    }
  });

  return Zone;
});
