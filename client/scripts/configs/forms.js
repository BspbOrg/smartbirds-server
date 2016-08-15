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
      '{location:int}',
      '{user:int}',
      '{year:int}',
      'species'
    ]
  }
};
