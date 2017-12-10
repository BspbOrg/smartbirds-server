/**
 * Created by groupsky on 22.11.15.
 */

exports.default = {
  mailchimp: function (api) {
    return {
      enabled: !!process.env.MAILCHIMP_API_KEY,
      api_key: process.env.MAILCHIMP_API_KEY,
      list_id: process.env.MAILCHIMP_LIST_ID
    }
  }
}
