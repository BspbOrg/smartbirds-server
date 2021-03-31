module.exports = {
  fields: {
    monitoringObservationType: {
      type: 'choice',
      relation: {
        model: 'nomenclature',
        filter: { type: 'main_observation_type' }
      }
    }
  }
}
