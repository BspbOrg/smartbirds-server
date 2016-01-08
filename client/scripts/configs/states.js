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
        url: '/login?email',
        templateUrl: '/views/login.html',
        controller: 'SessionController',
        controllerAs: 'sessionController',
        title: 'Login'
      })

      ///////////
      // Register //
      ///////////
      .state('register', {
        url: '/register?email',
        templateUrl: '/views/register.html',
        controller: 'SessionController',
        controllerAs: 'sessionController',
        title: 'Register'
      })

      ///////////
      // Forgot //
      ///////////
      .state('forgot', {
        url: '/forgot?email',
        templateUrl: '/views/forgot.html',
        controller: 'SessionController',
        controllerAs: 'sessionController',
        title: 'Forgot password'
      })

      ///////////
      // Reset //
      ///////////
      .state('reset', {
        url: '/reset?email&token',
        templateUrl: '/views/reset.html',
        controller: 'SessionController',
        controllerAs: 'sessionController',
        title: 'Reset password'
      })

      ///////////
      // Auth //
      ///////////
      .state('auth', {
        //parent: 'base',
        abstract: true,
        templateUrl: '/views/layout.html',
        controller: 'MainController',
        controllerAs: 'main',
        data: {
          roles: ['user']
        },
        resolve: {
          authorize: function (authorization) {
            return authorization.authorize();
          }
        }
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
      // Users //
      ///////////
      .state('auth.users', {
        url: '/users',
        views: {
          'content': {
            templateUrl: '/views/users/list.html',
            controller: 'UsersController',
            controllerAs: 'usersController'
          }
        }
      })


      ///////////
      // Monitorings //
      ///////////
      .state('auth.monitoring', {
        url: '/monitoring?{location:int}&zone',
        views: {
          'content': {
            templateUrl: '/views/monitorings/list.html',
            controller: 'MonitoringController',
            controllerAs: 'monitoringController'
          }
        }
      })

      ///////////
      // Zones //
      ///////////
      .state('auth.zones', {
        url: '/zones',
        views: {
          'content': {
            templateUrl: '/views/zones/list.html',
            controller: 'ZonesController',
            controllerAs: 'zonesController'
          }
        },
        resolve: {
          zones: /*@ngInject*/function(Zone) {
            return Zone.query();
          }
        }
      })

      ///////////
      // View Zone //
      ///////////
      .state('auth.zones.view', {
        url: '/{id:[a-zA-Z]+[0-9]+}',
        views: {
          'content@auth': {
            templateUrl: '/views/zones/view.html',
            controller: 'ZoneController',
            controllerAs: 'zoneController'
          }
        }
      })

      ///////////
      // Request Zone //
      ///////////
      .state('auth.zones.request', {
        url: '/request',
        views: {
          'content@auth': {
            templateUrl: '/views/zones/request.html',
            controller: 'RequestZoneController as requestZone'
          }
        }
      })
  })
  .run(function ($rootScope, $state, $stateParams, authorization, user) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $rootScope.$on('$stateChangeStart', function (event, toState, toStateParams) {
      $rootScope.toState = toState;
      $rootScope.toStateParams = toStateParams;

      if (user.isResolved())
        if (!authorization.authorize())
          event.preventDefault();
    });
  })
;
