/**
 * Created by groupsky on 12.04.16.
 */

var _ = require('lodash');
var Promise = require('bluebird');

module.exports.mailchimp = {
  name: 'stats:mailchimp',
  description: 'updates mailchimp list with user data',
  queue: 'default',
  // every 7 days
  frequency: 7 * 24 * 60 * 60 * 1000,
  run: function (api, params, next) {
    Promise.resolve(params)

      .then(function () {
        return api.models.user.findAll()
      })

      .then(function (users) {
        var res = []
        while (users.length) {
          var u = users.splice(0, 250)
          var p = api.mailchimp.client.post('/lists/'+api.config.mailchimp.list_id, {
            members: u.map(function (user) {
              return {
                email_address: user.email,
                status: 'subscribed',
                merge_fields: {
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
                  PROFILE: user.profile,
                },
              }
            }),
            update_existing: true,
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
        next();
      }, function (error) {
        next(error);
      });
  }
};
