module.exports.mailchimpUpdateAll = {
  name: 'mailchimp:update-all',
  description: 'updates mailchimp list with all user data',
  queue: 'default',
  // run manually:
  // npm run enqueue --name=mailchimp:update-all
  frequency: 0,
  run: function (api, params, next) {
    if (!api.config.mailchimp.enabled) {
      return next()
    }
    api.models.user.findAll()
      .then(api.mailchimp.batchUpdateUsers)
      .then(r => next(null, r))
      .catch(e => next(e))
  }
}

module.exports.mailchimpCreate = {
  name: 'stats:mailchimp',
  description: 'updates mailchimp list with a user data',
  queue: 'default',
  // manual run:
  // npm run enqueue --name=mailchimp:create --args='{"userId": 9999}'
  frequency: 0,
  run: function (api, { userId }, next) {
    api.models.user.findById(userId)
      .then(function (user) {
        if (!user) return Promise.reject(new Error(`User ${userId} was not found in db`))
        api.mailchimp.createUser(user)
      })
      .then(r => next(null, r))
      .catch(e => next(e))
  }
}

module.exports.mailchimpDelete = {
  name: 'mailchimp:delete',
  description: 'removes a user from mailchimp list',
  queue: 'default',
  // manual run:
  // npm run enqueue -- --name=mailchimp:delete --args='{"email": "EMAIL ADDRESS"}'
  frequency: 0,
  run: function (api, { email }, next) {
    api.mailchimp.deleteUser(email)
      .then(function (r) { next(null, r) })
      .catch(function (e) { next(e) })
  }
}
