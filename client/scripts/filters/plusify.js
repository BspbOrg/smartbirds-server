/**
 * Created by groupsky on 21.01.16.
 */

require('../app').filter('plusify', /*@ngInject*/function () {
  return function (value, max) {
    return value < max ? value : max+'+';
  };
});
