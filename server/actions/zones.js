/**
 * Created by groupsky on 20.11.15.
 */

var _ = require('lodash');

exports.zoneList = {
  name: 'zone:list',
  description: 'zone:list',
  middleware: ['auth'],

  inputs: {
    status: {},
    owner: {},
    limit: {required: false, default: 20},
    offset: {required: false, default: 0},
  },

  run: function (api, data, next) {
    //var limit = Math.min(1000, data.params.limit || 20);
    //var offset = data.params.offset || 0;

    var q = {
      include: [
        {model: api.models.location, as: 'location'}
      ],
      //limit: limit,
      //offset: offset
    };
    if (!data.session.user.isAdmin) {
      q.where = _.extend(q.where || {}, {
        ownerId: data.session.userId
      });
    } else {
      (q.include = q.include || []).push({model: api.models.user, as: 'owner'});
      if (data.params.owner) {
        q.where = _.extend(q.where || {}, {
          ownerId: data.params.owner
        });
      }
    }
    if (data.params.status) {
      q.where = _.extend(q.where || {}, {
        status: {
          $in: _.isArray(data.params.status)?data.params.status:[data.params.status]
        }
      })
    }
    try {
      return api.models.zone.findAndCountAll(q).then(function (result) {
        data.response.count = result.count;
        data.response.data = result.rows.map(function (zone) {
          return zone.apiData(api);
        });
        next();
      }).catch(function(e){
        console.error('Failure to retrieve zones', e);
        next(e);
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
    var q = {
      where: {id: data.params.id},
      include: [
        {model: api.models.location, as: 'location'}
      ]
    };
    if (data.session.user.isAdmin) {
      q.include.push({model: api.models.user, as: 'owner'});
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
