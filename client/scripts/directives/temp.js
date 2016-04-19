/**
 * Created by groupsky on 19.04.16.
 */

var moment = require('moment');
require('../app').directive('temp', /*@ngInject*/function() {
  return {
    restrict: 'A',
    scope: true,
    link: function($scope) {
      $scope.row = {
        year:2016,
        early: {
          from: moment('2016-05-15').toDate(),
          to: moment('2016-06-15').toDate()
        },
        late: {
          from: moment('2016-06-15').toDate(),
          to: moment('2016-07-15').toDate()
        }
      }
    }
  }
});
