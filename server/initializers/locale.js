module.exports = {
  initialize: function (api, next) {
    api.i18n.determineConnectionLocale = (function (defaultLocale) {
      return function(connection) {
        var locale = defaultLocale(connection);

        if (connection.type === 'web') {
          locale = connection.rawConnection.req.headers.language || locale
        }

        return locale;
      };
    })(api.i18n.determineConnectionLocale);
    next();
  }
};
