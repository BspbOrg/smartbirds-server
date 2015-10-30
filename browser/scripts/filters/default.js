var module = require('../app');

module.filter('default', function () {
    return function (val, def) {
        return val || def;
    }
});
