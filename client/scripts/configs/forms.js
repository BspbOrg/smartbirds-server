/**
 * Created by groupsky on 15.08.16.
 */

module.exports = {
  cbm: {
    model: 'FormCBM',
    filters: [
      '{location:int}',
      'zone',
      '{user:int}',
      'visit',
      '{year:int}',
      'species'
    ]
  },
  birds: {
    model: 'FormBirds',
    filters: [
      'location',
      '{user:int}',
      'species',
      'from_date',
      'to_date'
    ]
  },
  herp: {
    model: 'FormHerp',
    filters: [
      'location',
      '{user:int}',
      'species',
      'from_date',
      'to_date'
    ]
  },
  herptiles: {
    model: 'FormHerptiles',
    filters: [
      'location',
      '{user:int}',
      'species',
      'from_date',
      'to_date'
    ]
  },
  mammals: {
    model: 'FormMammals',
    filters: [
      'location',
      '{user:int}',
      'species',
      'from_date',
      'to_date'
    ]
  },
  ciconia: {
    model: 'FormCiconia',
    filters: [
      'location',
      '{user:int}',
      'from_date',
      'to_date'
    ]
  }
}
