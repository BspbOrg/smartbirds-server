/**
 * Created by groupsky on 15.08.16.
 */

module.exports = {
  cbm: {
    model: 'FormCBM',
    serverModel: 'formCBM',
    label: 'FORM_LABEL_CBM',
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
    serverModel: 'formBirds',
    label: 'FORM_LABEL_BIRDS',
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
    serverModel: 'formHerps',
    label: 'FORM_LABEL_HERP',
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
    serverModel: 'formHerptiles',
    label: 'FORM_LABEL_HERPTILES',
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
    serverModel: 'formMammals',
    label: 'FORM_LABEL_MAMMALS',
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
    serverModel: 'formCiconia',
    label: 'FORM_LABEL_CICONIA',
    filters: [
      'location',
      '{user:int}',
      'from_date',
      'to_date'
    ]
  }
}
