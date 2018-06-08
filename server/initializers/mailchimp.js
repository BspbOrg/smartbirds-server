const crypto = require('crypto')
const Mailchimp = require('mailchimp-api-v3')

module.exports = {
  initialize: function (api, next) {
    if (!api.config.mailchimp.enabled) {
      return next()
    }

    api.mailchimp = {
      client: new Mailchimp(api.config.mailchimp.api_key),
      /**
       * Low level api to perform multiple operations in a batch
       * @internal
       * @param {Function} cb - callback to generate the operation
       * @returns {Promise<*>}
       */
      batchOperations: async function (cb) {
        return (function (original) {
          const operations = []
          api.mailchimp.client.request = function (operation) {
            api.log('queing batch operation', 'debug', operation)
            operations.push(operation)
          }
          let error
          try {
            cb()
          } catch (e) {
            error = e
          }
          api.mailchimp.client.request = original
          if (error) throw error
          return api.mailchimp.client.batch(operations)
        })(api.mailchimp.client.request)
      },
      /**
       * Update multiple users in a batch
       * @param {[User]} users - array of users
       * @returns {Promise<*|Promise<*>>}
       */
      batchUpdateUsers: async function (users) {
        if (!api.config.mailchimp.enabled) return
        if (!users) return

        return api.mailchimp.batchOperations(() => {
          users.map(user => api.mailchimp.updateUser(user))
        })
      },
      /**
       * Create user in mailchimp list
       * @param {User} user - user
       * @returns {Promise<*>}
       */
      createUser: async function (user) {
        if (!api.config.mailchimp.enabled) return
        if (!user) return

        const listId = api.config.mailchimp.list_id
        const data = {
          email_address: user.email,
          status: 'subscribed',
          merge_fields: api.mailchimp.userFields(user),
          language: user.language
        }

        return api.mailchimp.client.post(`/lists/${listId}/members`, data)
      },
      /**
       * Delete user from mailchimp list
       * @param {String} email email of the user to delete
       * @returns {Promise<*>}
       */
      deleteUser: async function (email) {
        if (!api.config.mailchimp.enabled) return
        if (!email) return

        const listId = api.config.mailchimp.list_id
        const subscriberHash = api.mailchimp.subscriberHash(email)
        return api.mailchimp.client.delete(`/lists/${listId}/members/${subscriberHash}`)
      },
      /**
       * Compute subscriber hash
       * @internal
       * @param {String} email email to compute subscriber hash from
       * @returns {*}
       */
      subscriberHash: function (email) {
        return email && crypto.createHash('md5').update(email.toLowerCase()).digest('hex')
      },
      /**
       * Update user in mailchimp
       * @param {User} user
       * @returns {Promise<*>}
       */
      updateUser: async function (user) {
        if (!api.config.mailchimp.enabled) return
        if (!user) return

        const listId = api.config.mailchimp.list_id
        const subscriberHash = api.mailchimp.subscriberHash(user.email)
        const data = {
          email_address: user.email,
          status_if_new: 'subscribed',
          merge_fields: api.mailchimp.userFields(user),
          language: user.language
        }

        return api.mailchimp.client.put(`/lists/${listId}/members/${subscriberHash}`, data)
      },
      /**
       * Convert user model to merge_fields
       * @internal
       * @param {User} user
       * @returns {Promise<{FNAME: *, LNAME: *, NOTES: *}>}
       */
      userFields: async function (user) {
        const fields = {
          FNAME: user.firstName,
          LNAME: user.lastName,
          NOTES: user.notes
        }

        for (let key in fields) {
          if (!fields.hasOwnProperty(key)) continue
          if (!fields[ key ]) delete fields[ key ]
        }

        return fields
      }
    }

    next()
  }
}
