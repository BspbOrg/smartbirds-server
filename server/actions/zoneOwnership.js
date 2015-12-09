/**
 * Created by groupsky on 09.12.15.
 */

exports.zoneOwnershipRequest = {
  name: 'zone:requestOwnership',
  description: 'zone:requestOwnership',
  middleware: ['auth'],

  inputs: {id: {required: true}},

  run: function (api, data, next) {
    next(null, 'Not implemented, yet');
  }

};
