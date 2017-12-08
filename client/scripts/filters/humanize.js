/**
 * Created by groupsky on 25.10.16.
 */

var humanize = require('underscore.string/humanize')

require('../app').filter('humanize', /* @ngInject */function () {
  return function (value) {
    return humanize(value)
  }
})
