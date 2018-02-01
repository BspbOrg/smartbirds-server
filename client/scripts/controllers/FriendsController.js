require('../app').controller('FriendsController', /* @ngInject */function ($q, $translate, ngToast, Raven) {
  var $ctrl = this

  // TODO: fetch data from server
  $ctrl.sharers = [ 'geno@code6.ninja', 'dani@code6.ninja' ]
  $ctrl.sharees = [ 'dani@code6.ninja', 'geno@code6.ninja' ]

  $ctrl.addEmail = function () {
    $ctrl.sharees.push($ctrl.email)
    $ctrl.email = ''
    $ctrl.form.$setPristine()
    $ctrl.shareesForm.$setDirty()
  }

  $ctrl.remove = function (index) {
    $ctrl.sharees.splice(index, 1)
    $ctrl.shareesForm.$setDirty()
  }

  $ctrl.save = function () {
    // TODO: send data to server
    $q.resolve($ctrl.sharees)
      .then(function (res) {
        $ctrl.shareesForm.$setPristine()
        $ctrl.sharees = res
      })
      .then(function () {
        ngToast.create({
          className: 'success',
          content: $translate.instant('FRIENDS_SAVE_SUCCESS')
        })
      })
      .catch(function (error) {
        Raven.captureMessage(JSON.stringify(error))
        ngToast.create({
          className: 'danger',
          content: '<p>' + $translate.instant('FRIENDS_SAVE_ERROR') + '</p><pre>' + (error && error.data ? error.data.error : JSON.stringify(error, null, 2)) + '</pre>'
        })
        return $q.reject(error)
      })
  }
})
