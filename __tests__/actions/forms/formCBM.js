/* eslint-env node, jest */
/* globals setup */

const { omit } = require('lodash')

describe('Action: fromCBM.create', () => {
  const action = 'formCBM:create'

  const cbmRecord = {
    plot: {
      type: 'cbm_sector',
      slug: '1',
      label: {
        bg: '1',
        en: '1'
      }
    },
    visit: {
      type: 'cbm_visit_number',
      slug: 'e-early-visit',
      label: {
        bg: 'E - първо посещение',
        en: 'E - early visit'
      }
    },
    secondaryHabitat: {
      type: 'cbm_habitat',
      slug: 'a-1-broadleaved-woodland',
      label: {
        bg: 'A.1 - Широколистни гори',
        en: 'A.1 Broadleaved woodland'
      }
    },
    primaryHabitat: {
      type: 'cbm_habitat',
      slug: 'a-2-coniferous-woodland',
      label: {
        bg: 'A.2 - Иглолистни гори',
        en: 'A.2 Coniferous woodland'
      }
    },
    count: 10,
    distance: {
      type: 'cbm_distance',
      slug: '3-over-100-m',
      label: {
        bg: '3 - (над 100 m)',
        en: '3 - (over 100 m)'
      }
    },
    species: 'Accipiter nisus',
    notes: 'Some test notes',
    threats: [
      {
        type: 'main_threats',
        slug: 'cultivation',
        label: {
          bg: 'Култивация',
          en: 'Cultivation'
        }
      },
      {
        type: 'main_threats',
        slug: 'mulching',
        label: {
          bg: 'Наторяване',
          en: 'Mulching'
        }
      }
    ],
    visibility: 5.5,
    mto: 'pretty nice weather',
    cloudiness: {
      type: 'main_cloud_level',
      slug: '33-66',
      label: {
        bg: '33-66%',
        en: '33-66%'
      }
    },
    cloudsType: 'Light grey clouds',
    windDirection: {
      type: 'main_wind_direction',
      slug: 'ene',
      label: {
        bg: 'ENE',
        en: 'ENE'
      }
    },
    windSpeed: {
      type: 'main_wind_force',
      slug: '2-light-breeze',
      label: {
        bg: '2 - Лек бриз',
        en: '2 - Light breeze'
      }
    },
    temperature: 24.3,
    rain: {
      type: 'main_rain',
      slug: 'drizzle',
      label: {
        bg: 'Ръми',
        en: 'Drizzle'
      }
    },
    observers: 'Some test observers',
    endDateTime: '2015-12-10T10:15Z',
    startDateTime: '2015-12-09T08:10Z',
    zone: 'userZonePl',
    latitude: 42.1463749,
    longitude: 24.7492006,
    monitoringCode: 'formCBM_mon_code',
    observationDateTime: '2016-12-30T10:15Z'
  }

  afterEach(async () => {
    await setup.api.models.formCBM.destroy({ force: true, where: {} })
  })

  setup.describeAsAuth((runAction) => {
    test('can create with default values', async () => {
      const response = await runAction(action, cbmRecord)
      expect(response.error).toBeFalsy()
      expect(response.data).toEqual(expect.objectContaining({
        id: expect.any(Number)
      }))
    })

    test.each(['count', 'distance', 'species'])('cannot create without %s', async (field) => {
      const response = await runAction(action, omit(cbmRecord, field))
      expect(response.error).toMatchSnapshot('Missing param')
    })

    test.each(['plot', 'visit', 'primaryHabitat', 'secondaryHabitat'])('can create without %s', async (field) => {
      const response = await runAction(action, omit(cbmRecord, field))
      expect(response.error).toBeFalsy()
      expect(response.data).toEqual(expect.objectContaining({
        id: expect.any(Number)
      }))
    })
  })
})
