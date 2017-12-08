/**
 * Created by groupsky on 22.11.15.
 */

exports.default = {
  mailchimp: function (api) {
    return {
      api_key: process.env.MAILCHIMP_API_KEY || '52aced25c7537b3cef939603d3785942-us15',
      list_id: process.env.MAILCHIMP_LIST_ID || '87b8efeae4'
    }
  }
}
