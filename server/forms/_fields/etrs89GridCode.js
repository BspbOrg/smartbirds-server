module.exports = {
  fields: {
    etrs89GridCode: {
      type: 'text',
      length: 8,
      required: false,
      public: false,
      uniqueHash: false,
      afterApiUpdate (model) {
        if (model.changed('latitude') || model.changed('longitude')) {
          model.etrs89GridCode = null
        }
      }
    }
  }
}
