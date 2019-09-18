/**
 * Created by groupsky on 15.08.16.
 */

var forms = module.exports = {
  cbm: {
    model: 'FormCBM',
    serverModel: 'formCBM',
    label: 'FORM_LABEL_CBM',
    translatePrefix: 'CBM',
    speciesType: 'birds',
    hasCount: true,
    longLabel: 'FORM_CBM_LONG',
    shortLabel: 'FORM_CBM_SHORT',
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
      'tab',
      'threat'
    ]
  },
  birds: {
    model: 'FormBirds',
    serverModel: 'formBirds',
    label: 'FORM_LABEL_BIRDS',
    translatePrefix: 'BIRDS',
    speciesType: 'birds',
    hasCount: true,
    longLabel: 'FORM_BIRDS_LONG',
    shortLabel: 'FORM_BIRDS_SHORT',
    hasStats: true,
    filters: [
      'location',
      '{user:int}',
      'species',
      'from_date',
      'to_date',
      'latitude',
      'longitude',
      'radius',
      'tab',
      'threat'
    ]
  },
  herptiles: {
    model: 'FormHerptiles',
    serverModel: 'formHerptiles',
    label: 'FORM_LABEL_HERPTILES',
    translatePrefix: 'HERPTILES',
    speciesType: 'herptiles',
    hasCount: true,
    longLabel: 'FORM_HERPTILES_LONG',
    shortLabel: 'FORM_HERPTILES_SHORT',
    hasStats: true,
    filters: [
      'location',
      '{user:int}',
      'species',
      'from_date',
      'to_date',
      'latitude',
      'longitude',
      'radius',
      'tab',
      'threat'
    ]
  },
  mammals: {
    model: 'FormMammals',
    serverModel: 'formMammals',
    label: 'FORM_LABEL_MAMMALS',
    translatePrefix: 'MAMMALS',
    speciesType: 'mammals',
    hasCount: true,
    longLabel: 'FORM_MAMMALS_LONG',
    shortLabel: 'FORM_MAMMALS_SHORT',
    hasStats: true,
    filters: [
      'location',
      '{user:int}',
      'species',
      'from_date',
      'to_date',
      'latitude',
      'longitude',
      'radius',
      'tab',
      'threat'
    ]
  },
  invertebrates: {
    model: 'FormInvertebrates',
    serverModel: 'formInvertebrates',
    label: 'FORM_LABEL_INVERTEBRATES',
    translatePrefix: 'INVERTEBRATES',
    speciesType: 'invertebrates',
    hasCount: true,
    longLabel: 'FORM_INVERTEBRATES_LONG',
    shortLabel: 'FORM_INVERTEBRATES_SHORT',
    hasStats: true,
    filters: [
      'location',
      '{user:int}',
      'species',
      'from_date',
      'to_date',
      'latitude',
      'longitude',
      'radius',
      'tab',
      'threat'
    ]
  },
  plants: {
    model: 'FormPlants',
    serverModel: 'formPlants',
    label: 'FORM_LABEL_PLANTS',
    translatePrefix: 'PLANTS',
    speciesType: 'plants',
    hasCount: true,
    longLabel: 'FORM_PLANTS_LONG',
    shortLabel: 'FORM_PLANTS_SHORT',
    hasStats: true,
    filters: [
      'location',
      '{user:int}',
      'species',
      'from_date',
      'to_date',
      'latitude',
      'longitude',
      'radius',
      'tab',
      'threat'
    ]
  },
  ciconia: {
    model: 'FormCiconia',
    serverModel: 'formCiconia',
    label: 'FORM_LABEL_CICONIA',
    translatePrefix: 'CICONIA',
    hasCount: false,
    longLabel: 'FORM_CICONIA_LONG',
    shortLabel: 'FORM_CICONIA_SHORT',
    filters: [
      'location',
      '{user:int}',
      'from_date',
      'to_date',
      'latitude',
      'longitude',
      'radius',
      'tab',
      'threat'
    ]
  },
  threats: {
    model: 'FormThreats',
    serverModel: 'formThreats',
    label: 'FORM_LABEL_THREATS',
    translatePrefix: 'THREATS',
    hasCount: true,
    longLabel: 'FORM_THREATS_LONG',
    shortLabel: 'FORM_THREATS_SHORT',
    publicTemplate: '/views/monitorings/list_threats_public.html',
    filters: [
      'location',
      '{user:int}',
      'from_date',
      'to_date',
      'latitude',
      'longitude',
      'radius',
      'tab',
      'class',
      'primaryType',
      'species',
      'category'
    ]
  }
}

require('../app')
  .run(
    // this generates an injectable method with injections being the form models
    // ['FormCBM', 'FormBirds', ..., function () {}]
    Object
      .keys(forms)
      .map(function (key) { return forms[key].model })
      .concat([function () {
        var args = arguments
        Object
          .keys(forms)
          .forEach(function (key, idx) {
            forms[key].modelRef = args[idx]
          })
      }])
  )
