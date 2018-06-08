const crypto = require('crypto')
const Mailchimp = require('mailchimp-api-v3')

module.exports = {
  initialize: function (api, next) {
    if (!api.config.mailchimp.enabled) {
      return next()
    }

    var client = new Mailchimp(api.config.mailchimp.api_key)

    api.mailchimp = {
      client: client,
      deleteUser: async function (email) {
        if (!api.config.mailchimp.enabled) return
        if (!email) return

        const listId = api.config.mailchimp.list_id
        const subscriberHash = crypto.createHash('md5').update(email.toLowerCase()).digest('hex')

        return api.mailchimp.client.delete(`/lists/${listId}/members/${subscriberHash}`)
      }
    }
    next()
  }
}
