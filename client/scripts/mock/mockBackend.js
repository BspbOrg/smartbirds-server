/**
 * Created by groupsky on 03.12.15.
 */

var escapeStringRegexp = require('escape-string-regexp');

require('../app').run(function ($httpBackend, $rootScope, ENDPOINT_URL) {

  // auth
  var sessionEndpoint = new RegExp(escapeStringRegexp(ENDPOINT_URL + '/session') + '.*')
  $httpBackend.whenPUT(sessionEndpoint).passThrough();
  $httpBackend.whenPOST(sessionEndpoint).passThrough();
  $httpBackend.whenDELETE(sessionEndpoint).passThrough();

  // views
  $httpBackend.whenGET(/\/views\/.*/).passThrough();

  // zones
  $httpBackend.whenGET(ENDPOINT_URL+'/zone').passThrough();

  // locations
  $httpBackend.whenGET(ENDPOINT_URL + '/locations').respond(function (method, url, data) {
    return [200, {data: $rootScope.locations}, {}];
  });
  $httpBackend.whenGET(new RegExp(escapeStringRegexp(ENDPOINT_URL + '/locations/')+"[^\/]+"+escapeStringRegexp('/zones/')+"[^\/]+")).respond(function(method, url, data){
    var path = url.split('/').slice(-3);
    var locationId = decodeURIComponent(path[0]);
    var filter = decodeURIComponent(path[2]);

    var location = null;
    $rootScope.locations.every(function(loc) {
      if (loc.id == locationId) {
        location = loc;
        return false;
      }
      return true;
    });
    if (location) {
      return [200, {data: location.zones}, {}];
    } else {
      return [404, {error: "Unknown location "+locationId}, {}];
    }
  });

});
