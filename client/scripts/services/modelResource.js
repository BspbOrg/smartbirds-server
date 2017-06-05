/**
 * Created by groupsky on 18.11.15.
 */

var angular = require('angular');

function extend(Model, obj) {
  Model.apply(obj);
}

function modify(Model, original) {
  return function() {
    var result = original.apply(this, arguments);

    if (angular.isArray(result)) {
      angular.forEach(result, function(item) {
        extend(Model, item);
      });

      result.push = function() {
        angular.forEach(arguments, function(item){
          extend(Model, item);
        });
        Array.prototype.push.apply(this, arguments);
      };

    } else {
      extend(Model, result);
    }

    return result;
  }
}

require('../app').factory('modelResource', /*@ngInject*/function($resource, ENDPOINT_URL){
  return function(Model, url, paramDefaults, actions, options) {
    var resource = $resource(ENDPOINT_URL+url, paramDefaults, actions, options);

    angular.forEach(resource.prototype, function(val, key) {
      if (key.charAt(0) !== '$') return;
      var name = key.substring(1);
      if (!angular.isFunction(resource[name])) return;

      resource[name] = modify(Model, resource[name]);
    });

    angular.extend(resource.prototype, Model.prototype);

    return resource;
  }
});
