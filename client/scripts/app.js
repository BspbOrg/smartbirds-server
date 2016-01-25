/**
 * Created by groupsky on 30.10.15.
 */

require('lodash');
var angular = require('angular');
var bulk = require('bulk-require');
var info = require('../../package.json');

// include angular dependencies
require('angular-i18n');
require('ui.bootstrap');
require('uiGmapgoogle-maps');
require('ui.router');
require('ngSanitize');
require('ui.select');
require('angular-resource');
require('angular-cookies');
require('angular-strap');
require('angular-strap-tpl');
require('nya-bootstrap-select');
require('ngAnimate');
require('ngToast');

var dependencies = [
  'ngLocale',
  'ngCookies',
  'ngResource',
  'ngSanitize',

  'ui.router',
  'ui.bootstrap',
  'ui.select',

  'mgcrea.ngStrap',

  'nya.bootstrap.select',

  'ngToast',

  'uiGmapgoogle-maps'
];

var app = module.exports = angular.module('sb', dependencies)
  .run(/*@ngInject*/function ($rootScope) {
    $rootScope.$system = info;
  });

// include all js files
bulk(__dirname, ['./**/!(app|*.spec).js']);

