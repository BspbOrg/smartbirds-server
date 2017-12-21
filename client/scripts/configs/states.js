var angular = require('angular')
var forms = require('./forms')
var module = require('../app')

module.config(/* @ngInject */function ($locationProvider, $stateProvider, $urlRouterProvider) {
  $locationProvider.html5Mode(true)

  $urlRouterProvider
    .otherwise('/')

  /// ///////////////////////
  // State Configurations //
  /// ///////////////////////

  var resolveUser = {
    user: /* @ngInject */function ($rootScope, user) {
      return user.resolve(true).then(function (identity) {
        $rootScope.$user = user
        return user
      }, function () {
        return undefined
      })
    }
  }

  // Use $stateProvider to configure your states.
  $stateProvider

  /// ///////
  // Home //
  /// ///////
    .state('home', {
      url: '/',
      templateUrl: '/views/home.html',
      title: 'Home',
      resolve: resolveUser
    })

    .state('cbm', {
      url: '/cbm',
      templateUrl: '/views/home-cbm.html',
      title: 'МОВП',
      resolve: resolveUser
    })

    .state('birds', {
      url: '/birds',
      templateUrl: '/views/home-birds.html',
      title: 'Птици',
      resolve: resolveUser
    })

    .state('herp', {
      url: '/herp',
      templateUrl: '/views/home-herp.html',
      title: 'ЗВБ',
      resolve: resolveUser
    })

    .state('herptiles', {
      url: '/herptiles',
      templateUrl: '/views/home-herptiles.html',
      title: 'ЗиВ',
      resolve: resolveUser
    })

    .state('mammals', {
      url: '/mammals',
      templateUrl: '/views/home-mammals.html',
      title: 'Бозайници',
      resolve: resolveUser
    })

    .state('ciconia', {
      url: '/ciconia',
      templateUrl: '/views/home-ciconia.html',
      title: 'ЗВБ',
      resolve: resolveUser
    })

    /// ////////
    // Login //
    /// ////////
    .state('login', {
      url: '/login?email',
      templateUrl: '/views/login.html',
      controller: 'SessionController',
      controllerAs: 'sessionController',
      title: 'Login'
    })

    /// ////////
    // Register //
    /// ////////
    .state('register', {
      url: '/register?email',
      templateUrl: '/views/register.html',
      controller: 'SessionController',
      controllerAs: 'sessionController',
      title: 'Register'
    })

    /// ////////
    // Forgot //
    /// ////////
    .state('forgot', {
      url: '/forgot?email',
      templateUrl: '/views/forgot.html',
      controller: 'SessionController',
      controllerAs: 'sessionController',
      title: 'Forgot password'
    })

    /// ////////
    // Reset //
    /// ////////
    .state('reset', {
      url: '/reset?email&token',
      templateUrl: '/views/reset.html',
      controller: 'SessionController',
      controllerAs: 'sessionController',
      title: 'Reset password'
    })

    /// ////////
    // Auth //
    /// ////////
    .state('auth', {
      // parent: 'base',
      abstract: true,
      templateUrl: '/views/layout.html',
      controller: 'MainController',
      controllerAs: 'main',
      data: {
        roles: [ 'user' ]
      },
      resolve: {
        authorize: /* @ngInject */function (authorization, localization) {
          return authorization.authorize()
        },
        db: /* @ngInject */function (db) {
          return db.$promise || db
        }
      }
    })

    /// ////////
    // Dashboard //
    /// ////////
    .state('auth.dashboard', {
      url: '/dashboard',
      views: {
        'content': {
          templateUrl: '/views/dashboard.html',
          controller: 'DashboardController as dashboard'
        }
      }
    })

    /// ////////
    // Users //
    /// ////////
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

    /// ////////
    // Users //
    /// ////////
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

    /// ////////
    // User New //
    /// ////////
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

    /// ////////
    // User Change Password //
    /// ////////
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

    /// ////////
    // Monitorings //
    /// ////////
    .state('auth.monitoring', {
      url: '/monitoring'
    })

  angular.forEach(forms, function (formDef, formName) {
    $stateProvider

    /// ////////
    // Monitoring List //
    /// ////////
      .state('auth.monitoring.' + formName, {
        url: '/' + formName + '?' + (formDef || []).filters.join('&'),
        views: {
          'content@auth': {
            templateUrl: '/views/monitorings/list_' + formName + '.html',
            controller: 'MonitoringController',
            controllerAs: 'monitoringController'
          }
        },
        resolve: {
          model: [ formDef.model, function (model) {
            return model
          } ],
          formName: function () {
            return formName
          },
          formDef: function () {
            return formDef
          }
        }
      })

      /// ////////
      // Monitoring Detail //
      /// ////////
      .state('auth.monitoring.' + formName + '.detail', {
        url: '/{id:int}',
        views: {
          'content@auth': {
            templateUrl: '/views/monitorings/' + formName + '.html',
            controller: 'MonitoringDetailController',
            controllerAs: 'monitoringDetailController'
          }
        },
        resolve: {
          formName: function () {
            return formName
          }
        }
      })

      /// ////////
      // Monitoring New //
      /// ////////
      .state('auth.monitoring.' + formName + '.new', {
        url: '/new',
        views: {
          'content@auth': {
            templateUrl: '/views/monitorings/' + formName + '.html',
            controller: 'MonitoringDetailController',
            controllerAs: 'monitoringDetailController'
          }
        }
      })

      /// ////////
      // Monitoring Copy //
      /// ////////
      .state('auth.monitoring.' + formName + '.copy', {
        url: '/copy?{fromId:int}',
        views: {
          'content@auth': {
            templateUrl: '/views/monitorings/' + formName + '.html',
            controller: 'MonitoringDetailController',
            controllerAs: 'monitoringDetailController'
          }
        }
      })
  })
  $stateProvider

  /// ////////
  // Zones //
  /// ////////
    .state('auth.zones', {
      url: '/zones?status&{location:int}&{owner:int}&zone',
      views: {
        'content': {
          templateUrl: '/views/zones/list.html',
          controller: 'ZonesController',
          controllerAs: 'zonesController'
        }
      }
    })

    /// ////////
    // View Zone //
    /// ////////
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

    /// ////////
    // Request Zone //
    /// ////////
    .state('auth.zones.request', {
      url: '/request',
      views: {
        'content@auth': {
          templateUrl: '/views/zones/request.html',
          controller: 'RequestZoneController as requestZone'
        }
      }
    })

    /// ////////
    // Visits //
    /// ////////
    .state('auth.visits', {
      url: '/visits',
      views: {
        'content@auth': {
          templateUrl: '/views/visits/list.html',
          controller: 'VisitsController as visits'
        }
      }
    })

    /// ////////
    // Nomenclatures //
    /// ////////
    .state('auth.nomenclatures', {
      url: '/nomenclatures?group&nomenclature',
      views: {
        'content@auth': {
          templateUrl: '/views/nomenclatures/list.html',
          controller: 'NomenclaturesController as $ctrl'
        }
      }
    })

    /// ////////
    // Species //
    /// ////////
    .state('auth.species', {
      url: '/species?type',
      views: {
        'content@auth': {
          templateUrl: '/views/species/list.html',
          controller: 'SpeciesController as $ctrl'
        }
      }
    })
})
  .run(/* @ngInject */function ($rootScope, $state, $stateParams, authorization, user) {
    $rootScope.$state = $state
    $rootScope.$stateParams = $stateParams
    $rootScope.$on('$stateChangeStart', function (event, toState, toStateParams) {
      $rootScope.toState = toState
      $rootScope.toStateParams = toStateParams

      if (user.isResolved()) {
        if (!authorization.authorize()) { event.preventDefault() }
      }
    })
  })
