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
        template: require('../../views/home.html'),
        title: 'Home'
      })

      ///////////
      // Login //
      ///////////
      .state('login', {
        url: '/login?email',
        template: require('../../views/login.html'),
        controller: 'SessionController',
        controllerAs: 'sessionController',
        title: 'Login'
      })

      ///////////
      // Register //
      ///////////
      .state('register', {
        url: '/register?email',
        template: require('../../views/register.html'),
        controller: 'SessionController',
        controllerAs: 'sessionController',
        title: 'Register'
      })

      ///////////
      // Forgot //
      ///////////
      .state('forgot', {
        url: '/forgot?email',
        template: require('../../views/forgot.html'),
        controller: 'SessionController',
        controllerAs: 'sessionController',
        title: 'Forgot password'
      })

      ///////////
      // Reset //
      ///////////
      .state('reset', {
        url: '/reset?email&token',
        template: require('../../views/reset.html'),
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
        template: require('../../views/layout.html'),
        controller: 'DataController',
        controllerAs: 'data',
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
          'content': {template: require('../../views/dashboard.html')}
        }
      })

      ///////////
      // Users //
      ///////////
      .state('auth.users', {
        url: '/users',
        views: {
          'content': {
            template: require('../../views/users/list.html'),
            controller: 'UsersController',
            controllerAs: 'usersController'
          }
        }
      })


      ///////////
      // Monitorings //
      ///////////
      .state('auth.monitoring', {
        url: '/monitoring',
        views: {
          'content': {
            template: require('../../views/monitorings/list.html'),
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
            template: require('../../views/zones/list.html'),
            controller: 'ZonesController',
            controllerAs: 'zonesController'
          }
        }
      })

      ///////////
      // Zones //
      ///////////
      .state('auth.zones.view', {
        url: '/:id',
        views: {
          'content@auth': {
            template: require('../../views/zones/view.html'),
            controller: 'ZoneController',
            controllerAs: 'zoneController'
          }
        }
      })

      ///////////
      // Zones //
      ///////////
      .state('auth.zones.request', {
        url: '/request',
        views: {
          'content@auth': {template: require('../../views/zones/request.html')}
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
