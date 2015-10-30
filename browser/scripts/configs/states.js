var module = require('../app');

module.config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider
        .otherwise('/');


    //////////////////////////
    // State Configurations //
    //////////////////////////

    // Use $stateProvider to configure your states.
    $stateProvider

        //////////
        // Home //
        //////////
        .state("home", {
            url: "/",
            templateUrl: '/views/home.html',
            title: 'Home'
        })

        ///////////
        // Login //
        ///////////
        .state('login', {
            url: '/login',
            templateUrl: '/views/login.html',
            title: 'Login'
        })

        ///////////
        // Auth //
        ///////////
        .state('auth', {
            abstract: true,
            templateUrl: '/views/layout.html',
            controller: 'DataController',
            controllerAs: 'data'
        })

        ///////////
        // Dashboard //
        ///////////
        .state('auth.dashboard', {
            url: '/dashboard',
            views: {
                'content': {templateUrl: '/views/dashboard.html'}
            }
        })

        ///////////
        // Monitorings //
        ///////////
        .state('auth.monitoring', {
            url: '/monitoring',
            views: {
                'content': { templateUrl: '/views/monitorings/list.html'}
            }
        })

        ///////////
        // Zones //
        ///////////
        .state('auth.zones', {
            url: '/zones',
            views: {
                'content': {templateUrl: '/views/zones/index.html'}
            }
        })

        ///////////
        // Zones //
        ///////////
        .state('auth.zones.request', {
            url: '/request',
            views: {
                'content@auth': {templateUrl: '/views/zones/request.html'}
            }
        })
});
