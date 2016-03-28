/**
 * Created by groupsky on 13.01.16.
 */

require('../app').controller('UserController', /*@ngInject*/function ($state, $stateParams, $q, ngToast, User) {
  var controller = this;

  controller.data = User.get({id: $stateParams.id});

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

});
