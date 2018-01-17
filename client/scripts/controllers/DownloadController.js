require('../app')
  .controller('DownloadController', /* @ngInject */function ($stateParams, ENDPOINT_URL) {
    var $ctrl = this
    $ctrl.downloadUrl = ENDPOINT_URL + '/storage/' + $stateParams.id
  })
