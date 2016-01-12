/**
 * Created by groupsky on 12.01.16.
 */

require('../app').service('Nomenclature', /*@ngInject*/function($resource, ENDPOINT_URL) {
  var Nomenclature = $resource(ENDPOINT_URL+'/nomenclature/:type/:slug', {
    type: '@type',
    slug: '@slug'
  });

  // instance methods
  angular.extend(Nomenclature.prototype, {
    toString: function() {
      return (this.label||{}).bg;
    }
  });

  return Nomenclature;
});
