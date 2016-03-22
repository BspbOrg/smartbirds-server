/**
 * Created by groupsky on 22.03.16.
 */

var path = require('path');

module.exports = {
  initialize: function (api, next) {
    api.staticFile.checkExistence = (function (checkExistence) {
      return function(file, callback) {
        return checkExistence(file, function(exists, truePath) {
          if (exists)
            return callback(true, truePath);
          return checkExistence(path.normalize(api.staticFile.path() + '/'), callback);
        });
      };
    })(api.staticFile.checkExistence);
    next();
  }
};
