/**
 * Created by groupsky on 20.11.15.
 */

exports.zoneList = {
  name: 'zone:list',
  description: 'zone:list',
  middleware: ['auth'],

  run: function (api, data, next) {
    var q = {
    };
    if (!data.session.user.isAdmin) {
      q.where = {
        ownerId: data.session.userId
      };
    } else {
      q.include = [{model: api.models.user, as: 'owner'}];
    }
    try {
      api.models.zone.findAndCountAll(q).then(function (result) {
        data.response.count = result.count;
        data.response.data = result.rows.map(function (zone) {
          return zone.apiData(api);
        });
        next();
      });
    } catch (e) {
      console.error(e);
      next(e);
    }
  }
};

exports.zoneView = {
  name: 'zone:view',
  description: 'zone:view',
  middleware: ['auth'],
  inputs: {id: {required: true}},

  run: function (api, data, next) {
    var q = {where: {id: data.params.id}};
    if (data.session.user.isAdmin) {
      q.include = [{model: api.models.user, as: 'owner'}];
    }
    api.models.zone.findOne(q).then(function (zone) {
        if (!zone) {
          data.connection.rawConnection.responseHttpCode = 404;
          return next(new Error('zone not found'));
        }

        if (!data.session.user.isAdmin && zone.ownerId != data.session.userId) {
          data.connection.rawConnection.responseHttpCode = 401;
          return next(new Error('no permission'));
        }

        data.response.data = zone.apiData(api);
        next();
      })
      .catch(next)
    ;
  }
};
