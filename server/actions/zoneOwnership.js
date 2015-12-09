/**
 * Created by groupsky on 09.12.15.
 */

exports.zoneOwnershipRequest = {
  name: 'zone:requestOwnership',
  description: 'zone:requestOwnership',
  middleware: ['auth'],

  inputs: {id: {required: true}},

  run: function (api, data, next) {
    api.models.zone.findById(data.params.id).then(function (zone) {
        if (!zone) {
          data.connection.rawConnection.responseHttpCode = 404;
          return next(new Error('zone not found'));
        }

        if (zone.status !== 'free' && zone.ownerId !== data.session.userId) {
          data.connection.rawConnection.responseHttpCode = 409;
          return next(new Error('zone is not free'));
        }

        return zone.update({
          status: 'requested',
          ownerId: data.session.userId
        }).then(function (zone) {
          data.response.data = zone.apiData(api);
          next();
        });
      })
      .catch(next)
    ;
  }

};

exports.zoneOwnershipRespond = {
  name: 'zone:respondOwnershipRequest',
  description: 'zone:respondOwnershipRequest',
  middleware: ['admin'],

  inputs: {
    id: {required: true},
    response: {require: true}
  },

  run: function (api, data, next) {
    api.models.zone.findById(data.params.id).then(function (zone) {
        if (!zone) {
          data.connection.rawConnection.responseHttpCode = 404;
          return next(new Error('zone not found'));
        }

        if (zone.status !== 'requested') {
          data.connection.rawConnection.responseHttpCode = 409;
          return next(new Error('zone is not requested'));
        }

        if (data.params.response) {
          // approve ownership
          return zone.update({status: 'owned'});
        } else {
          // reject ownership
          return zone.update({status: 'free', ownerId: null});
        }
      })
      .then(function (zone) {
        data.response.data = zone.apiData(api);
        next();
      })
      .catch(next)
    ;
  }
};

exports.zoneSetOwner = {
  name: 'zone:setOwner',
  description: 'zone:setOwner',
  middleware: ['admin'],

  inputs: {
    id: {required: true},
    owner: {require: true}
  },

  run: function (api, data, next) {
    api.models.zone.findById(data.params.id).then(function (zone) {
        if (!zone) {
          data.connection.rawConnection.responseHttpCode = 404;
          return next(new Error('zone not found'));
        }

        return api.models.user.findById(data.params.owner).then(function (user) {
          if (!user) {
            data.connection.rawConnection.responseHttpCode = 404;
            return next(new Error('user not found'));
          }

          return zone.update({
            status: 'owned',
            ownerId: data.params.owner
          });
        });
      })
      .then(function (zone) {
        data.response.data = zone.apiData(api);
        next();
      })
      .catch(next)
    ;
  }
};

exports.zoneClearOwner = {
  name: 'zone:clearOwner',
  description: 'zone:clearOwner',
  middleware: ['admin'],

  inputs: {
    id: {required: true}
  },

  run: function (api, data, next) {
    api.models.zone.findById(data.params.id).then(function (zone) {
        if (!zone) {
          data.connection.rawConnection.responseHttpCode = 404;
          return next(new Error('zone not found'));
        }

        return zone.update({
          status: 'free',
          ownerId: null
        });
      })
      .then(function (zone) {
        data.response.data = zone.apiData(api);
        next();
      })
      .catch(next)
    ;
  }
};
