/**
 * Created by groupsky on 12.01.16.
 */

require('../app').service('Species', /*@ngInject*/function($resource, ENDPOINT_URL) {
  var Species = $resource(ENDPOINT_URL+'/species/:type/:la', {
    type: '@type',
    la: '@la'
  });

  // instance methods
  angular.extend(Species.prototype, {
    toString: function(locale) {
      locale = locale || 'bg';
      return (this.label||{})[locale];
    }
  });

  return Species;
});
