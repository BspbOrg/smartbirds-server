var module = require('../app');

module.config(function ($locationProvider, $stateProvider, $urlRouterProvider) {

    $locationProvider.html5Mode(true);

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
        title: 'Home',
        resolve: {
          user: /*@ngInject*/function($rootScope, user) {
            return user.resolve(true).then(function(identity) {
              return $rootScope.$user = user;
            }, function() {
              return undefined;
            })
          }
        }
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
          authorize: /*@ngInject*/function (authorization) {
            return authorization.authorize();
          },
          db: /*@ngInject*/function (db) {
            return db.$promise || db;
          }
        }
      })

      ///////////
      // Dashboard //
      ///////////
      .state('auth.dashboard', {
        url: '/dashboard',
        views: {
          'content': {
            templateUrl: '/views/dashboard.html',
            controller: 'DashboardController as dashboard'
          }
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
      // Users //
      ///////////
      .state('auth.users.detail', {
        url: '/{id:int}',
        views: {
          'content@auth': {
            templateUrl: '/views/users/detail.html',
            controller: 'UserController',
            controllerAs: 'user'
          }
        }
      })


      ///////////
      // User New //
      ///////////
      .state('auth.users.new', {
        url: '/new',
        views: {
          'content@auth': {
            templateUrl: '/views/users/detail.html',
            controller: 'UserController',
            controllerAs: 'user'
          }
        }
      })


      ///////////
      // User Change Password //
      ///////////
      .state('auth.users.changepw', {
        url: '/password',
        views: {
          'content@auth': {
            templateUrl: '/views/users/changepw.html',
            controller: 'UserController',
            controllerAs: 'user'
          }
        }
      })


      ///////////
      // Monitorings //
      ///////////
      .state('auth.monitoring', {
        url: '/monitoring?{location:int}&zone&{user:int}&visit&{year:int}&species',
        views: {
          'content': {
            templateUrl: '/views/monitorings/list.html',
            controller: 'MonitoringController',
            controllerAs: 'monitoringController'
          }
        }
      })

      ///////////
      // Monitoring Detail //
      ///////////
      .state('auth.monitoring.detail', {
        url: '/{id:int}',
        views: {
          'content@auth': {
            templateUrl: '/views/monitorings/detail.html',
            controller: 'MonitoringDetailController',
            controllerAs: 'monitoringDetailController'
          }
        }
      })

      ///////////
      // Monitoring New //
      ///////////
      .state('auth.monitoring.new', {
        url: '/new',
        views: {
          'content@auth': {
            templateUrl: '/views/monitorings/detail.html',
            controller: 'MonitoringDetailController',
            controllerAs: 'monitoringDetailController'
          }
        }
      })

      ///////////
      // Monitoring Detail //
      ///////////
      .state('auth.monitoring.copy', {
        url: '/copy?{fromId:int}',
        views: {
          'content@auth': {
            templateUrl: '/views/monitorings/detail.html',
            controller: 'MonitoringDetailController',
            controllerAs: 'monitoringDetailController'
          }
        }
      })

      ///////////
      // Zones //
      ///////////
      .state('auth.zones', {
        url: '/zones?status&{location:int}&{owner:int}',
        views: {
          'content': {
            templateUrl: '/views/zones/list.html',
            controller: 'ZonesController',
            controllerAs: 'zonesController'
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
  .run(/*@ngInject*/function ($rootScope, $state, $stateParams, authorization, user) {
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
