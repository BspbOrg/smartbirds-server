/**
 * Created by groupsky on 13.01.16.
 */

var angular = require('angular');

require('../app').controller('UserController', /*@ngInject*/function ($state, $stateParams, $q, $timeout, ngToast, User) {
  var controller = this;

  var id = $stateParams.id || $stateParams.fromId;

  controller.data = id ? User.get({id: id}) : new User();
  controller.data.id = id;

  controller.save = function () {
    $q.resolve(controller.data)
      .then(function (user) {
        return user.$save()
      })
      .then(function (res) {
        controller.form.$setPristine();
        return res;
      })
      .then(function (res) {
        ngToast.create({
          className: 'success',
          content: "Save success."
        });
        return res;
      }, function (error) {
        ngToast.create({
          className: 'danger',
          content: '<p>Could not save!</p><pre>' + (error && error.data && error.data.error || JSON.stringify(error, null, 2)) + '</pre>'
        });
        return $q.reject(error);
      })
      .then(function (res) {
        $state.go('^.detail', {id: res.id}, {location: 'replace'});
      });
  };

  (function () {
    var timeout = false;
    var deregister = $scope.$watch(function () {
      if (timeout) $timeout.cancel(timeout);
      timeout = $timeout(function () {
        deregister();
        controller.hideFake = true;
      });
    }, angular.noop);
  })();
});
