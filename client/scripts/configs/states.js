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
      // Auth //
      ///////////
      .state('auth', {
        //parent: 'base',
        abstract: true,
        templateUrl: '/views/layout.html',
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
          'content': {templateUrl: '/views/dashboard.html'}
        }
      })

      ///////////
      // Monitorings //
      ///////////
      .state('auth.monitoring', {
        url: '/monitoring',
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
