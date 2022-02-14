var lodash = require('lodash')

var baseModel = {
  latitude: 42.1463749,
  longitude: 24.7492006,
  monitoringCode: 'random_pylons_1234',
  endDateTime: '2015-12-10T11:15Z',
  startDateTime: '2015-12-10T15:15Z',
  pylonTypeEn: 'Type 1'
}

module.exports = [
  {
    model: 'formPylons',
    data: lodash.extend({}, baseModel, {
      user: { email: 'user@smartbirds.com' },
      observationDateTime: '2016-12-10T10:15:01Z'
    })
  },
  {
    model: 'formPylons',
    data: lodash.extend({}, baseModel, {
      user: { email: 'user@smartbirds.com' },
      observationDateTime: '2016-12-20T10:15:02Z'
    })
  },
  {
    model: 'formPylons',
    data: lodash.extend({}, baseModel, {
      user: { email: 'user@smartbirds.com' },
      observationDateTime: '2016-12-30T10:15:03Z'
    })
  },
  {
    model: 'formPylons',
    data: lodash.extend({}, baseModel, {
      user: { email: 'admin@smartbirds.com' },
      observationDateTime: '2016-12-20T10:15:04Z'
    })
  },
  {
    model: 'formPylons',
    data: lodash.extend({}, baseModel, {
      user: { email: 'admin@smartbirds.com' },
      observationDateTime: '2016-12-20T10:15:05Z'
    })
  },
  {
    model: 'formPylons',
    data: lodash.extend({}, baseModel, {
      user: { email: 'admin@smartbirds.com' },
      observationDateTime: '2016-12-20T10:15:06Z'
    })
  },
  {
    model: 'formPylons',
    data: lodash.extend({}, baseModel, {
      user: { email: 'user2@smartbirds.com' },
      observationDateTime: '2016-12-20T10:15:07Z'
    })
  }
]
