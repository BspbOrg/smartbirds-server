exports.default = {
  sentry: function (api) {
    return {
      dsn: process.env.SENTRY_DSN
    }
  }
}
