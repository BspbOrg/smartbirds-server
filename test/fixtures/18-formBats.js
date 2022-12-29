const model = 'formBats'

var baseModel = {
  latitude: 42.1463749,
  longitude: 24.7492006,
  monitoringCode: 'random_bats_1234',
  endDateTime: '2015-12-10T11:15Z',
  startDateTime: '2015-12-10T15:15Z',
  species: 'Myotis sp.',
  count: 1
}

module.exports = [
  {
    model,
    data: {
      ...baseModel,
      user: { email: 'user@smartbirds.com' },
      observationDateTime: '2016-12-10T10:15:01Z'
    }
  },
  {
    model,
    data: {
      ...baseModel,
      user: { email: 'user@smartbirds.com' },
      observationDateTime: '2016-12-20T10:15:02Z'
    }
  },
  {
    model,
    data: {
      ...baseModel,
      user: { email: 'user@smartbirds.com' },
      observationDateTime: '2016-12-30T10:15:03Z'
    }
  },
  {
    model,
    data: {
      ...baseModel,
      user: { email: 'admin@smartbirds.com' },
      observationDateTime: '2016-12-20T10:15:04Z'
    }
  },
  {
    model,
    data: {
      ...baseModel,
      user: { email: 'admin@smartbirds.com' },
      observationDateTime: '2016-12-20T10:15:05Z'
    }
  },
  {
    model,
    data: {
      ...baseModel,
      user: { email: 'admin@smartbirds.com' },
      observationDateTime: '2016-12-20T10:15:06Z'
    }
  },
  {
    model,
    data: {
      ...baseModel,
      user: { email: 'user2@smartbirds.com' },
      observationDateTime: '2016-12-20T10:15:07Z'
    }
  }
]
