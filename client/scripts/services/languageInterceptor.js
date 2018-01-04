require('../app').factory('languageInterceptor', /* @ngInject */function ($translate) {
  return {
    request: function (config) {
      config.headers['Language'] = $translate.$language
      return config
    }
  }
})
