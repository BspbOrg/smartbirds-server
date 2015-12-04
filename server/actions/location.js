/**
 * Created by groupsky on 04.12.15.
 */

exports.locationList = {
  name: 'location:list',
  description: 'location:list',
  middleware: ['auth'],

  run: function (api, data, next) {
    try {
      return api.models.location.findAndCountAll({}).then(function (result) {
        data.response.count = result.count;
        data.response.data = result.rows.map(function (location) {
          return location.apiData(api);
        });
        return next();
      }).catch(function (e) {
        console.error('Failure for list all locations', e);
        return next(e);
      });
    } catch (e) {
      console.error(e);
      return next(e);
    }
  }
};

exports.locationListZones = {
  name: 'location:listZones',
  description: 'location:listZones',
  middleware: ['auth'],
  inputs: {
    id: {required: true},
    filter: {}
  },

  run: function (api, data, next) {
    try {
      var q = {
        where: {
          locationId: data.params.id
        }
      };
      if (data.params.filter) {
        switch (data.params.filter) {
          case 'free': {
            q.where.ownerId = null;
            break;
          }
          default: {
            return next(new Error("Invalid filter '"+data.params.filter+"'"));
          }
        }
      }
      return api.models.zone.findAndCountAll(q).then(function (result) {
        data.response.count = result.count;
        data.response.data = result.rows.map(function (zone) {
          return zone.apiData(api);
        });
        return next();
      }).catch(function (e) {
        console.error('Failure to find all zones for location ' + data.params.id, e);
        return next(e);
      });
    } catch (e) {
      console.error(e);
      return next(e);
    }
  }
};
