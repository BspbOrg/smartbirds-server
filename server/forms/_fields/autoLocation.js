const localField = require('../../utils/localField')

module.exports = {
  fields: {
    autoLocation: {
      type: 'choice',
      relation: {
        model: 'settlement'
      },
      afterApiUpdate (model) {
        if (model.changed('latitude') || model.changed('longitude')) {
          localField('autoLocation').update(model, null)
        }
      }
    }
  }
}
