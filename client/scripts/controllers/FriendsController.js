require('../app').controller('FriendsController', /* @ngInject */function ($q, $translate, user, ngToast, Raven, User) {
  var $ctrl = this

  $ctrl.fetchData = function () {
    $ctrl.sharers = User.getSharers({id: user.getIdentity().id})
    $ctrl.sharees = User.getSharees({id: user.getIdentity().id})
  }
  $ctrl.fetchData()

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
