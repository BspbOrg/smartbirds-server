/**
 * Created by groupsky on 12.04.16.
 */

var Promise = require('bluebird')

module.exports.mailchimpDelete = {
  name: 'mailchimp:delete',
  description: 'removes a user from mailchimp list',
  queue: 'default',
  // manual run:
  // npm run enqueue -- --name=mailchimp:delete --args='{"email": "EMAIL ADDRESS"}'
  frequency: 0,
  run: function (api, {email}, next) {
    api.mailchimp.deleteUser(email)
      .then(function (r) { next(null, r) })
      .catch(function (e) { next(e) })
  }
}

module.exports.mailchimp = {
  name: 'stats:mailchimp',
  description: 'updates mailchimp list with user data',
  queue: 'default',
  // use cronjob to schedule the task
  // npm run enqueue stats:mailchimp
  frequency: 0,
  run: function (api, params, next) {
    if (!api.config.mailchimp.enabled) {
      return next()
    }
    Promise.resolve(params)

      .then(function () {
        return api.models.user.findAll()
      })

      .then(function (users) {
        var res = []
        while (users.length) {
          var u = users.splice(0, 250)
          var p = api.mailchimp.client.post('/lists/' + api.config.mailchimp.list_id, {
            members: u.map(function (user) {
              var fields = {
                FNAME: user.firstName,
                LNAME: user.lastName,
                ADDRESS: user.address,
                BIRDSKNOW: user.birdsKnowledge,
                CITY: user.city,
                CBMLEVEL: user.level,
                MOBILE: user.mobile,
                NOTES: user.notes,
                PHONE: user.phone,
                POSTCODE: user.postcode,
                PROFILE: user.profile
              }

              for (var key in fields) {
                if (!fields.hasOwnProperty(key)) continue
                if (!fields[ key ]) delete fields[ key ]
              }

              api.log('update ' + user.email, 'info', fields)

              return {
                email_address: user.email,
                status: 'subscribed',
                merge_fields: fields
              }
            }),
            update_existing: true
          })
          res.push(p)
        }
        return res
      })
      .then(function (res) {
        api.log('Mailchimp sync result', 'info', res)
      })

      // final statement
      .then(function () {
        next()
      }, function (error) {
        next(error)
      })
  }
}
