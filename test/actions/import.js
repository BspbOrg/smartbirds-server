/* global describe, before, after, it */

const should = require('should')
const setup = require('../_setup')

const testData = [
  {
    'Clouds_%': '',
    'Clouds_%.en': '',
    Clouds_Type: '',
    Date_Begin: '19.04.2023',
    Date_End: '19.04.2023',
    Hour_Beginning: '14:09:11',
    Hour_End: '14:10:23',
    Location: '',
    Meteo_Other: '',
    Monitoring_Code: '20230419-110911-15f5a32df6ca',
    Notes: '',
    Observation_Methodology: 'Complete list',
    'Observation_Methodology.en': 'Complete list',
    Rain: '',
    'Rain.en': '',
    Source: '',
    'Source.en': '',
    Temperature_C: '',
    Visibility_km: '',
    Wind_Direction: '',
    'Wind_Direction.en': '',
    Wind_Strength: '',
    'Wind_Strength.en': '',
    email: 'dani@code6.ninja',
    firstName: 'Даниел',
    lastName: 'Петров',
    otherObservers: '',
    userId: 1296,
    version: 4,
    A: 34,
    Age: 'Juv',
    'Age.en': 'Juv',
    C: 23,
    Confidential: 0,
    Count: 1,
    'Distance from axis': 12,
    Findings: 'Molehill | Other',
    'Findings.json': '[{"label":{"bg":"Къртичина","en":"Molehill","sq":"Pirg dheu","mk":"Дупка од крт"},"type":"mammals_findings"},{"label":{"bg":"Други","en":"Other","sq":"Tjetër","mk":"Друго"},"type":"mammals_findings"}]',
    GeolocationAccuracy: -1,
    Habitat: '3.1. Meadows, pastures, meadows with scattered shrubs',
    'Habitat.en': '3.1. Meadows, pastures, meadows with scattered shrubs',
    Hour_Observation: '14:10:03',
    L: 12,
    Lat: '42.1529496495837',
    Long: '24.751660153269768',
    Marking: 'ghv',
    'Mass (g)': 56,
    Moderator_Review: 0,
    Note_Species: 'some notes',
    Observation_Date: '19.04.2023',
    Picture0: '',
    Picture1: '',
    Picture2: '',
    Pl: 45,
    Sex: 'F (Female)',
    'Sex.en': 'F (Female)',
    Species_Scientific_Name: 'Apodemus sp. | Unidentified Wood Mouse',
    'Species_Scientific_Name.en': 'Apodemus sp. | Unidentified Wood Mouse',
    'Temp air': 78,
    'Temp substrate': 67,
    Threats: 'Collision with powerline | Dead on road',
    'Threats.json': '[{"label":{"bg":"Сблъсък с електропровод","en":"Collision with powerline"},"type":"main_threats"},{"label":{"bg":"Опасен път","en":"Dead on road","sq":"I ngordhur në rrugë"},"type":"main_threats"}]'
  },
  {
    'Clouds_%': '',
    'Clouds_%.en': '',
    Clouds_Type: '',
    Date_Begin: '19.04.2023',
    Date_End: '19.04.2023',
    Hour_Beginning: '14:09:11',
    Hour_End: '14:10:23',
    Location: '',
    Meteo_Other: '',
    Monitoring_Code: '20230419-110911-15f5a32df6ca',
    Notes: '',
    Observation_Methodology: 'Complete list',
    'Observation_Methodology.en': 'Complete list',
    Rain: '',
    'Rain.en': '',
    Source: '',
    'Source.en': '',
    Temperature_C: '',
    Visibility_km: '',
    Wind_Direction: '',
    'Wind_Direction.en': '',
    Wind_Strength: '',
    'Wind_Strength.en': '',
    email: 'dani@code6.ninja',
    firstName: 'Даниел',
    lastName: 'Петров',
    otherObservers: '',
    userId: 1296,
    version: 4,
    A: null,
    Age: '',
    'Age.en': '',
    C: null,
    Confidential: 0,
    Count: 1,
    'Distance from axis': null,
    Findings: '',
    'Findings.json': '[]',
    GeolocationAccuracy: -1,
    Habitat: '',
    'Habitat.en': '',
    Hour_Observation: '14:10:21',
    L: null,
    Lat: '42.15142472204146',
    Long: '24.75202862173319',
    Marking: '',
    'Mass (g)': null,
    Moderator_Review: 0,
    Note_Species: '',
    Observation_Date: '19.04.2023',
    Picture0: '',
    Picture1: '',
    Picture2: '',
    Pl: null,
    Sex: '',
    'Sex.en': '',
    Species_Scientific_Name: 'Apodemus uralensis | Pygmy Field Mouse',
    'Species_Scientific_Name.en': 'Apodemus uralensis | Pygmy Field Mouse',
    'Temp air': null,
    'Temp substrate': null,
    Threats: '',
    'Threats.json': '[]'
  }
]

describe('Import', () => {
  before(async () => {
    await setup.init()
  })

  after(async () => {
    await setup.finish()
  })

  it('imports data to given form', async () => {
    const response = await setup.runActionAsUser('import', { form: 'formMammals', data: [] })
    response.data.should.have.property('success', true)
  })
})
