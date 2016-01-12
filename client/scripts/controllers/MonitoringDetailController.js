/**
 * Created by groupsky on 11.01.16.
 */

require('../app').controller('MonitoringDetailController', /*@ngInject*/function ($scope, $state, $stateParams, $q, FormCBM, ngToast) {

  var controller = this;

  controller.data = $stateParams.id ? FormCBM.get({id: $stateParams.id}) : new FormCBM();

  controller.save = function () {
    controller.data.$save().then(function (res){
      $scope.cbmform.$setPristine();
      return res;
    }).then(function (res) {
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
    }).then(function(res) {
      $state.go('^.detail', {id: res.id}, {location: 'replace'});
    });
  };
});
