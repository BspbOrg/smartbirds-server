/**
 * Created by groupsky on 11.01.16.
 */

require('../app').controller('MonitoringDetailController', /*@ngInject*/function ($scope, $stateParams, FormCBM, ngToast) {

  var controller = this;

  controller.data = $stateParams.id ? FormCBM.get({id: $stateParams.id}) : new FormCBM();

  controller.save = function () {
    controller.data.$save().then(function (){
      $scope.cbmform.$setPristine();
    }).then(function () {
      ngToast.create({
        className: 'success',
        content: "Save success."
      });
    }, function (error) {
      ngToast.create({
        className: 'danger',
        content: '<p>Could not save!</p><pre>' + (error && error.data && error.data.error || JSON.stringify(error, null, 2)) + '</pre>'
      });
    });
  };
});
