/**
 * Created by dani on 11.01.16.
 */

var lodash = require('lodash')

var baseModel = {
  plotLocal: '1',
  plotEn: '1',
  visitLocal: 'e-early-visit',
  visitEn: 'e-early-visit',
  secondaryHabitatLocal: 'a-1-broadleaved-woodland',
  secondaryHabitatEn: 'a-1-broadleaved-woodland',
  primaryHabitatLocal: 'a-2-coniferous-woodland',
  primaryHabitatEn: 'a-2-coniferous-woodland',
  count: 10,
  distanceLocal: '3-over-100-m',
  distanceEn: '3-over-100-m',
  species: 'Accipiter nisus',
  notes: 'Some test notes',
  visibility: 5.5,
  mto: 'pretty nice weather',
  cloudinessLocal: '33-66',
  cloudinessEn: '33-66',
  cloudsType: 'Light grey clouds',
  windDirectionLocal: 'ene',
  windDirectionEn: 'ene',
  windSpeedLocal: '2-light-breeze',
  windSpeedEn: '2-light-breeze',
  temperature: 24.3,
  rainLocal: 'drizzle',
  rainEn: 'drizzle',
  observers: 'Some test observers',
  endDateTime: '2015-12-10T10:15:00Z',
  startDateTime: '2015-12-09T08:10:00Z',
  monitoringCode: 'formCBM_mon_code',
  latitude: 42.1463749,
  longitude: 24.7492006
}

module.exports = [
  {
    model: 'formCBM',
    data: lodash.extend({}, baseModel, {
      observationDateTime: '2016-12-30T10:15:01Z',
      zone: {id: 'freeZonePlovdiv'},
      user: {email: 'user@smartbirds.com'}
    })
  },
  {
    model: 'formCBM',
    data: lodash.extend({}, baseModel, {
      observationDateTime: '2016-12-30T10:15:02Z',
      zone: {id: 'freeZonePlovdiv'},
      user: {email: 'admin@smartbirds.com'}
    })
  },
  {
    model: 'formCBM',
    data: lodash.extend({}, baseModel, {
      observationDateTime: '2016-12-30T10:15:03Z',
      zone: {id: 'freeZonePlovdiv'},
      user: {email: 'admin@smartbirds.com'}
    })
  },
  {
    model: 'formCBM',
    data: lodash.extend({}, baseModel, {
      observationDateTime: '2016-12-30T10:15:04Z',
      zone: {id: 'freeZoneSofia'},
      user: {email: 'admin@smartbirds.com'}
    })
  }
]
