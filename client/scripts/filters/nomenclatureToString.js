/**
 * Created by groupsky on 22.01.16.
 */

require('../app').filter('nomenclatureToString', /* @ngInject */function (Nomenclature) {
  return function (item, locale) {
    return Nomenclature.prototype.toString.apply(item, locale)
  }
})
