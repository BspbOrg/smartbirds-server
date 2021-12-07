module.exports = {
  fields: {
    bgatlas2008UtmCode: {
      type: 'text',
      length: 4,
      required: false,
      public: false,
      uniqueHash: false,
      afterApiUpdate (model) {
        if (model.changed('latitude') || model.changed('longitude') || model.changed('observationDateTime')) {
          model.bgatlas2008UtmCode = null
        }
      }
    }
  }
}
