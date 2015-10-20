/**
 * Created by groupsky on 20.10.15.
 */

var sb = angular.module('sb', [
    'ui.router',
    'ui.bootstrap'
]);

sb.run(function ($rootScope, $state, $stateParams) {
    // It's very handy to add references to $state and $stateParams to the $rootScope
    // so that you can access them from any scope within your applications.For example,
    // <li ng-class="{ active: $state.includes('contacts.list') }"> will set the <li>
    // to active whenever 'contacts.list' or one of its decendents is active.
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
});

sb.config(function ($stateProvider, $urlRouterProvider) {

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
            templateUrl: '/views/layout.html'
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
