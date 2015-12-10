/**
 * Created by groupsky on 03.12.15.
 */

var esc = require('escape-string-regexp');

require('../app').run(function ($httpBackend, $rootScope, ENDPOINT_URL) {

  // auth
  var sessionEndpoint = new RegExp(esc(ENDPOINT_URL + '/session') + '.*');
  $httpBackend.whenPUT(sessionEndpoint).passThrough();
  $httpBackend.whenPOST(sessionEndpoint).passThrough();
  $httpBackend.whenDELETE(sessionEndpoint).passThrough();

  // views
  $httpBackend.whenGET(/\/views\/.*/).passThrough();

  // users
  $httpBackend.whenGET(new RegExp(esc(ENDPOINT_URL+'/user')+'.*')).passThrough();

  // zones
  $httpBackend.whenGET(new RegExp(esc(ENDPOINT_URL+'/zone')+'.*')).passThrough();
  $httpBackend.whenPOST(new RegExp(esc(ENDPOINT_URL+'/zone')+'.*')).passThrough();
  $httpBackend.whenDELETE(new RegExp(esc(ENDPOINT_URL+'/zone/')+'[^/]+'+esc('/owner'))).passThrough();
  $httpBackend.whenPUT(new RegExp(esc(ENDPOINT_URL+'/zone/')+'[^/]+'+esc('/owner'))).passThrough();

  // locations
  $httpBackend.whenGET(new RegExp(esc(ENDPOINT_URL + '/locations')+'.*')).passThrough();

});
