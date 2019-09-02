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
      resolve: resolveUser
    })

    .state('cbm', {
      url: '/cbm',
      templateUrl: '/views/home-cbm.html',
      title: 'FORM_CBM_SHORT',
      resolve: resolveUser
    })

    .state('birds', {
      url: '/birds',
      templateUrl: '/views/home-birds.html',
      title: 'FORM_BIRDS_SHORT',
      resolve: resolveUser
    })

    .state('herp', {
      url: '/herp',
      templateUrl: '/views/home-herp.html',
      title: 'FORM_HERP_SHORT',
      resolve: resolveUser
    })

    .state('herptiles', {
      url: '/herptiles',
      templateUrl: '/views/home-herptiles.html',
      title: 'FORM_HERPTILES_SHORT',
      resolve: resolveUser
    })

    .state('mammals', {
      url: '/mammals',
      templateUrl: '/views/home-mammals.html',
      title: 'FORM_MAMMALS_SHORT',
      resolve: resolveUser
    })

    .state('invertebrates', {
      url: '/invertebrates',
      templateUrl: '/views/home-invertebrates.html',
      title: 'FORM_INVERTEBRATES_SHORT',
      resolve: resolveUser
    })

    .state('plants', {
      url: '/plants',
      templateUrl: '/views/home-plants.html',
      title: 'FORM_PLANTS_SHORT',
      resolve: resolveUser
    })

    .state('ciconia', {
      url: '/ciconia',
      templateUrl: '/views/home-ciconia.html',
      title: 'FORM_CICONIA_SHORT',
      resolve: resolveUser
    })

    .state('gdpr', {
      url: '/gdpr',
      templateUrl: '/views/gdpr/gdpr-page.html'
    })

    .state('mobileStats', {
      url: '/mobile-stats',
      templateUrl: '/views/mobile-stats.html',
      controller: 'MobileStatsController',
      controllerAs: '$ctrl'
    })

    .state('threats', {
      url: '/threats',
      templateUrl: '/views/home-threats.html',
      title: 'FORM_THREATS_SHORT',
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
      title: 'TITLE_LOGIN'
    })

    /// ////////
    // Register //
    /// ////////
    .state('register', {
      url: '/register?email',
      templateUrl: '/views/register.html',
      controller: 'SessionController',
      controllerAs: 'sessionController',
      title: 'TITLE_REGISTER'
    })

    /// ////////
    // Forgot //
    /// ////////
    .state('forgot', {
      url: '/forgot?email',
      templateUrl: '/views/forgot.html',
      controller: 'SessionController',
      controllerAs: 'sessionController',
      title: 'TITLE_FORGOT_PASSWORD'
    })

    /// ////////
    // Reset //
    /// ////////
    .state('reset', {
      url: '/reset?email&token',
      templateUrl: '/views/reset.html',
      controller: 'SessionController',
      controllerAs: 'sessionController',
      title: 'TITLE_RESET_PASSWORD'
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
        roles: ['user']
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

    /// //////////
    // Download //
    /// //////////
    .state('auth.download', {
      url: '/download/{id}',
      views: {
        'content': {
          templateUrl: '/views/download.html',
          controller: 'DownloadController as $ctrl'
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
    // User Friends Management //
    /// ////////
    .state('auth.users.friends', {
      url: '/friends',
      views: {
        'content@auth': {
          templateUrl: '/views/users/friends.html',
          controller: 'FriendsController',
          controllerAs: '$ctrl'
        }
      }
    })

    /// ////////
    // Monitorings //
    /// ////////
    .state('auth.monitoring', {
      url: '/monitoring'
    })

    .state('auth.monitoring.private', {
      abstract: true,
      resolve: {
        context: function () {
          return 'private'
        }
      }
    })

    /// ////////
    // Monitorings public//
    /// ////////
    .state('auth.monitoring.public', {
      url: '/public',
      resolve: {
        context: function () {
          return 'public'
        }
      }
    })

  angular.forEach(forms, function (formDef, formName) {
    $stateProvider

    /// ////////
    // Monitoring List public //
    /// ////////
      .state('auth.monitoring.public.' + formName, {
        url: '/' + formName + '?' + (formDef || []).filters.join('&'),
        views: {
          'content@auth': {
            templateUrl: formDef.publicTemplate || '/views/monitorings/list_public.html',
            controller: 'MonitoringController',
            controllerAs: 'monitoringController'
          }
        },
        resolve: {
          model: [formDef.model, function (model) {
            return model
          }],
          formName: function () {
            return formName
          },
          formDef: function () {
            return formDef
          }
        }
      })

      /// ////////
      // Monitoring List //
      /// ////////
      .state('auth.monitoring.private.' + formName, {
        url: '/' + formName + '?' + (formDef || []).filters.join('&'),
        views: {
          'content@auth': {
            templateUrl: '/views/monitorings/list_' + formName + '.html',
            controller: 'MonitoringController',
            controllerAs: 'monitoringController'
          }
        },
        resolve: {
          model: [formDef.model, function (model) {
            return model
          }],
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
      .state('auth.monitoring.private.' + formName + '.detail', {
        url: '/{id:int}?{offset:int}',
        views: {
          'content@auth': {
            templateUrl: '/views/monitorings/' + formName + '.html',
            controller: 'MonitoringDetailController',
            controllerAs: 'monitoringDetailController'
          }
        },
        resolve: {
          local: function () { return false }
        }
      })

      /// ////////
      // Monitoring Local Detail //
      /// ////////
      .state('auth.monitoring.private.' + formName + '.local-detail', {
        url: '/local-{id:int}?{offset:int}',
        views: {
          'content@auth': {
            templateUrl: '/views/monitorings/' + formName + '.html',
            controller: 'MonitoringDetailController',
            controllerAs: 'monitoringDetailController'
          }
        },
        resolve: {
          local: function () { return true }
        }
      })

      /// ////////
      // Monitoring New //
      /// ////////
      .state('auth.monitoring.private.' + formName + '.new', {
        url: '/new',
        views: {
          'content@auth': {
            templateUrl: '/views/monitorings/' + formName + '.html',
            controller: 'MonitoringDetailController',
            controllerAs: 'monitoringDetailController'
          }
        },
        resolve: {
          local: function () { return false }
        }
      })

      /// ////////
      // Monitoring Copy //
      /// ////////
      .state('auth.monitoring.private.' + formName + '.copy', {
        url: '/copy?{fromId}',
        views: {
          'content@auth': {
            templateUrl: '/views/monitorings/' + formName + '.html',
            controller: 'MonitoringDetailController',
            controllerAs: 'monitoringDetailController'
          }
        },
        resolve: {
          local: function () { return false }
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

    /// ////////
    // Stats //
    /// ////////
    .state('auth.stats', {
      url: '/stats'
    })

  var statForms = ['birds', 'herptiles', 'mammals', 'plants', 'invertebrates']
  angular.forEach(statForms, function (form) {
    $stateProvider
      .state('auth.stats.' + form, {
        url: '/' + form,
        views: {
          'content@auth': {
            templateUrl: 'views/stats.html',
            controller: 'StatsController as $ctrl'
          }
        },
        resolve: {
          form: function () {
            return form
          },
          prefix: function () {
            return form.toUpperCase()
          }
        }
      })
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
