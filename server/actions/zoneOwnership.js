/**
 * Created by groupsky on 09.12.15.
 */
const { upgradeAction } = require('../utils/upgrade')

function getZone (api, data, next) {
  const q = {
    where: { id: data.params.id },
    include: [{ model: api.models.location, as: 'location' }]
  }
  if (api.forms.userCanManage(data.session.user, 'formCBM')) {
    q.include.push({ model: api.models.user, as: 'owner' })
  }
  return api.models.zone.findOne(q)
    .catch(next)
}

exports.zoneOwnershipRequest = upgradeAction('ah17', {
  name: 'zone:requestOwnership',
  description: 'zone:requestOwnership',
  middleware: ['auth'],

  inputs: { id: { required: true } },

  run: function (api, data, next) {
    getZone(api, data, next).then(function (zone) {
      if (!zone) {
        data.connection.rawConnection.responseHttpCode = 404
        return next(new Error('zone not found'))
      }

      if (zone.status !== 'free' && zone.ownerId !== data.session.userId) {
        data.connection.rawConnection.responseHttpCode = 409
        return next(new Error('zone is not free'))
      }

      return zone.update({
        status: 'requested',
        ownerId: data.session.userId
      })
    })
      .then(function (zone) {
        return getZone(api, data, next)
      })
      .then(function (zone) {
        data.response.data = zone.apiData(api)
        next()
      })
  }

})

exports.zoneOwnershipRespond = upgradeAction('ah17', {
  name: 'zone:respondOwnershipRequest',
  description: 'zone:respondOwnershipRequest',
  middleware: ['auth'],

  inputs: {
    id: { required: true },
    response: { require: true }
  },

  run: function (api, data, next) {
    getZone(api, data, next).then(function (zone) {
      if (!api.forms.userCanManage(data.session.user, 'formCBM')) {
        data.connection.rawConnection.responseHttpCode = 403
        return next(new Error('Admin required'))
      }

      if (!zone) {
        data.connection.rawConnection.responseHttpCode = 404
        return next(new Error('zone not found'))
      }

      if (zone.status !== 'requested') {
        data.connection.rawConnection.responseHttpCode = 409
        return next(new Error('zone is not requested'))
      }

      if (data.params.response) {
        // approve ownership
        return zone.update({ status: 'owned' })
      } else {
        // reject ownership
        return zone.update({ status: 'free', ownerId: null })
      }
    })
      .then(function (zone) {
        return getZone(api, data, next)
      })
      .then(function (zone) {
        data.response.data = zone.apiData(api)
        next()
      })
  }
})

exports.zoneSetOwner = upgradeAction('ah17', {
  name: 'zone:setOwner',
  description: 'zone:setOwner',
  middleware: ['auth'],

  inputs: {
    id: { required: true },
    owner: { require: true }
  },

  run: function (api, data, next) {
    getZone(api, data, next).then(function (zone) {
      if (!api.forms.userCanManage(data.session.user, 'formCBM')) {
        data.connection.rawConnection.responseHttpCode = 403
        return next(new Error('Admin required'))
      }

      if (!zone) {
        data.connection.rawConnection.responseHttpCode = 404
        return next(new Error('zone not found'))
      }

      return api.models.user.findByPk(data.params.owner).then(function (user) {
        if (!user) {
          data.connection.rawConnection.responseHttpCode = 404
          return next(new Error('user not found'))
        }

        return zone.update({
          status: 'owned',
          ownerId: data.params.owner
        })
      })
    })
      .then(function (zone) {
        return getZone(api, data, next)
      })
      .then(function (zone) {
        data.response.data = zone.apiData(api)
        next()
      })
  }
})

exports.zoneClearOwner = upgradeAction('ah17', {
  name: 'zone:clearOwner',
  description: 'zone:clearOwner',
  middleware: ['auth'],

  inputs: {
    id: { required: true }
  },

  run: function (api, data, next) {
    getZone(api, data, next).then(function (zone) {
      if (!api.forms.userCanManage(data.session.user, 'formCBM')) {
        data.connection.rawConnection.responseHttpCode = 403
        return next(new Error('Admin required'))
      }

      if (!zone) {
        data.connection.rawConnection.responseHttpCode = 404
        return next(new Error('zone not found'))
      }

      return zone.update({
        status: 'free',
        ownerId: null,
        owner: null
      })
    })
      .then(function (zone) {
        return getZone(api, data, next)
      })
      .then(function (zone) {
        data.response.data = zone.apiData(api)
        next()
      })
  }
})
