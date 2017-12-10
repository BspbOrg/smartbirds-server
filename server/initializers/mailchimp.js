var Mailchimp = require('mailchimp-api-v3')

module.exports = {
  initialize: function (api, next) {
    if (!api.config.mailchimp.enabled) {
      return next()
    }

    var client = new Mailchimp(api.config.mailchimp.api_key)

    api.mailchimp = {
      client: client
    }
    next()
  }
}
