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
});
