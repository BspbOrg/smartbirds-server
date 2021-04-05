module.exports = {
  fields: {
    observationMethodology: {
      type: 'choice',
      relation: {
        model: 'nomenclature',
        filter: { type: 'main_observation_methodology' }
      }
    }
  }
}
