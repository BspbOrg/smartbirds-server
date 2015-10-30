var module = require('../app.js');

module.run(function ($rootScope) {
    $rootScope.$user = {
        isAdmin: true,
        name: "Иван Петров"
    };
});
