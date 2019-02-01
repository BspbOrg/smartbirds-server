/**
 * Created by groupsky on 15.08.16.
 */

module.exports = {
  cbm: {
    model: 'FormCBM',
    serverModel: 'formCBM',
    label: 'FORM_LABEL_CBM',
    translatePrefix: 'CBM',
    speciesType: 'birds',
    hasCount: true,
    filters: [
      '{location:int}',
      'zone',
      '{user:int}',
      'visit',
      '{year:int}',
      'species',
      'latitude',
      'longitude',
      'radius',
      'tab'
    ]
  },
  birds: {
    model: 'FormBirds',
    serverModel: 'formBirds',
    label: 'FORM_LABEL_BIRDS',
    translatePrefix: 'BIRDS',
    speciesType: 'birds',
    hasCount: true,
    filters: [
      'location',
      '{user:int}',
      'species',
      'from_date',
      'to_date',
      'latitude',
      'longitude',
      'radius',
      'tab'
    ]
  },
  herptiles: {
    model: 'FormHerptiles',
    serverModel: 'formHerptiles',
    label: 'FORM_LABEL_HERPTILES',
    translatePrefix: 'HERPTILES',
    speciesType: 'herptiles',
    hasCount: true,
    filters: [
      'location',
      '{user:int}',
      'species',
      'from_date',
      'to_date',
      'latitude',
      'longitude',
      'radius',
      'tab'
    ]
  },
  mammals: {
    model: 'FormMammals',
    serverModel: 'formMammals',
    label: 'FORM_LABEL_MAMMALS',
    translatePrefix: 'MAMMALS',
    speciesType: 'mammals',
    hasCount: true,
    filters: [
      'location',
      '{user:int}',
      'species',
      'from_date',
      'to_date',
      'latitude',
      'longitude',
      'radius',
      'tab'
    ]
  },
  invertebrates: {
    model: 'FormInvertebrates',
    serverModel: 'formInvertebrates',
    label: 'FORM_LABEL_INVERTEBRATES',
    translatePrefix: 'INVERTEBRATES',
    speciesType: 'invertebrates',
    hasCount: true,
    filters: [
      'location',
      '{user:int}',
      'species',
      'from_date',
      'to_date',
      'latitude',
      'longitude',
      'radius',
      'tab'
    ]
  },
  plants: {
    model: 'FormPlants',
    serverModel: 'formPlants',
    label: 'FORM_LABEL_PLANTS',
    translatePrefix: 'PLANTS',
    speciesType: 'plants',
    hasCount: true,
    filters: [
      'location',
      '{user:int}',
      'species',
      'from_date',
      'to_date',
      'latitude',
      'longitude',
      'radius',
      'tab'
    ]
  },
  ciconia: {
    model: 'FormCiconia',
    serverModel: 'formCiconia',
    label: 'FORM_LABEL_CICONIA',
    translatePrefix: 'CICONIA',
    hasCount: false,
    filters: [
      'location',
      '{user:int}',
      'from_date',
      'to_date',
      'latitude',
      'longitude',
      'radius',
      'tab'
    ]
  }
}
