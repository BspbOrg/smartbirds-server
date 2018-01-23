var lodash = require('lodash')

var baseModel = {
  latitude: 42.1463749,
  longitude: 24.7492006,
  monitoringCode: 'random_invertebrates_1234',
  species: 'Lucanus cervus',
  count: 10,
  marking: 'some marking',
  speciesNotes: 'some notes text',
  location: 'location somewhere',

  endDateTime: '2015-12-10T11:15Z',
  startDateTime: '2015-12-10T15:15Z',
  observers: 'Some test observers',
  notes: 'some notes'
}

module.exports = [
  {
    model: 'formInvertebrates',
    data: lodash.extend({}, baseModel, {
      species: 'Lucanus cervus',
      user: {email: 'user@smartbirds.com'},
      observationDateTime: '2016-12-10T10:15:01Z'
    })
  },
  {
    model: 'formInvertebrates',
    data: lodash.extend({}, baseModel, {
      species: 'Lucanus cervus',
      user: {email: 'user@smartbirds.com'},
      observationDateTime: '2016-12-20T10:15:02Z'
    })
  },
  {
    model: 'formInvertebrates',
    data: lodash.extend({}, baseModel, {
      species: 'Lucanus cervus',
      user: {email: 'user@smartbirds.com'},
      observationDateTime: '2016-12-30T10:15:03Z'
    })
  },
  {
    model: 'formInvertebrates',
    data: lodash.extend({}, baseModel, {
      species: 'Parnassius apollo',
      user: {email: 'admin@smartbirds.com'},
      observationDateTime: '2016-12-20T10:15:04Z'
    })
  },
  {
    model: 'formInvertebrates',
    data: lodash.extend({}, baseModel, {
      species: 'Rosalia alpina',
      user: {email: 'admin@smartbirds.com'},
      observationDateTime: '2016-12-20T10:15:05Z'
    })
  },
  {
    model: 'formInvertebrates',
    data: lodash.extend({}, baseModel, {
      species: 'Eriogaster catax',
      user: {email: 'admin@smartbirds.com'},
      observationDateTime: '2016-12-20T10:15:06Z'
    })
  },
  {
    model: 'formInvertebrates',
    data: lodash.extend({}, baseModel, {
      species: 'Eriogaster catax',
      user: {email: 'user2@smartbirds.com'},
      observationDateTime: '2016-12-20T10:15:07Z'
    })
  }
]
