/**
 * Created by dani on 29.11.17.
 */

require('../app').directive('languageSwitcher', function () {
  return {
    controller: /*@ngInject*/function($translate) {
      var ctrl = this
      ctrl.changeLanguage= function (language) {
        $translate.use(language)
      }
    },
    controllerAs: "$ctrl"
  }
})
