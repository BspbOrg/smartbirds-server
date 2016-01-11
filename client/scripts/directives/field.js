/**
 * Created by groupsky on 11.01.16.
 */

require('../app').directive('field', /*@ngInject*/function() {
  return {
    restrict: 'AE',
    templateUrl: '/views/fields/general.html',
    scope: {
      name: '@',
      label: '@?',
      placeholder: '@?',
      help: '@?',
      model: '=?'
    }
  };
});
