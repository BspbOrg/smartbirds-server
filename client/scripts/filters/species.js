/**
 * Created by groupsky on 19.04.16.
 */

require('../app').filter('species', /*@ngInject*/function($parse, db) {
  return function(id, field) {
    return $parse(field)(db.species.birds[id]);
  }
});
