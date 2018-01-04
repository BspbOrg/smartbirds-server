exports['default'] = {
  i18n: function (api) {
    return {
      // visit https://github.com/mashpie/i18n-node to see all configuration options
      // locale path can be configired from within ./config/api.js
      locales: ['en', 'bg'],

      // how would you like your lanaguages to fall back if a translation string is missing?
      fallbacks: {
        // 'es': 'en'
      },

      // configure i18n to allow for object-style key lookup
      objectNotation: true,

      updateFiles: true,

      // this will configure logging and error messages in the log(s)
      defaultLocale: 'en',

      // the name of the method by which to determine the connection's locale
      // by default, every request will be in the 'en' locale
      // this method will be called witin the localiazation middleware on all requests
      determineConnectionLocale: 'api.i18n.determineConnectionLocale'
    }
  }
}

exports.test = {
  i18n: function () {
    return {
      updateFiles: true
    }
  }
}

exports.production = {
  i18n: function () {
    return {
      updateFiles: false
    }
  }
}
