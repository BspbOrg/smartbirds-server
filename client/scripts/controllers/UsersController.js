/**
 * Created by groupsky on 18.11.15.
 */

require('../app').controller('UsersController', /* @ngInject */function ($filter, $scope, User) {
  var controller = this
  var filter = $filter('filter')

  $scope.rows = User.query({
    limit: 1000
  })

  controller.toggleAdmin = function (user) {
    user.isAdmin = !user.isAdmin
    user.$save()
  }

  controller.filterRows = function (config) {
    return function (row) {
      if (config && config.role) {
        if (config.role !== row.role) {
          return false
        }
      }
      if (config && config.search) {
        if (!filter([row], config.search).length) {
          return false
        }
      }
      return true
    }
  }
})
