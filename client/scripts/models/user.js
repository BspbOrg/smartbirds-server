/**
 * Created by groupsky on 12.11.15.
 */

var angular = require('angular');
var md5 = require('blueimp-md5');

require('../app').factory('User', /*@ngInject*/function ($resource, BANNER_BASE_URL, ENDPOINT_URL) {
  var ROLE_ADMIN = 'admin';

  var User = $resource(ENDPOINT_URL+'/user/:id', {
    id: '@id'
  });

  // methods
  angular.extend(User.prototype, {
    getName: function () {
      return [this.firstName, this.lastName].filter(function (s) {
        return !!s;
      }).join(' ');
    },
    hasRole: function (role) {
      if (!this.roles) return false;
      return this.roles.indexOf(role) !== -1;
    },
    toString: function () {
      return this.getName();
    },
    getBannerUrl: function () {
      return this.bannerUrl = this.bannerUrl || BANNER_BASE_URL + md5(this.id)+ '.png'
    },
  });

  return User;
});
