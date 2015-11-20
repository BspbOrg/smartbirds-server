/**
 * Created by groupsky on 20.11.15.
 */

exports.zoneList = {
  name: 'zone:list',
  description: 'zone:list',
  middleware: ['auth'],

  run: function (api, data, next) {
    var q = {};
    if (!data.session.user.isAdmin) {
      q.where = {
        ownerId: data.session.userId
      };
    }
    api.models.zone.findAndCountAll(q).then(function(result){
      data.response.count = result.count;
      data.response.data = result.rows.map(function(zone){
        return zone.apiData(api);
      });
      next();
    });
  }
};
//
//exports.zoneView = {
//  name: 'zone:view',
//  middleware: ['auth'],
//  inputs: {id: {required: true}},
//
//  run: function (api, data, next) {
//    next();
//  }
//};
