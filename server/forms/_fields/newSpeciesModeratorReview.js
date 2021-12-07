module.exports = {
  fields: {
    newSpeciesModeratorReview: {
      type: 'boolean',
      required: false,
      public: false,
      uniqueHash: false,
      'afterApiUpdate:user' (model) {
        if (model.changed('latitude') ||
          model.changed('longitude') ||
          model.changed('pictures') ||
          model.changed('species') ||
          model.changed('moderatorReview')) {
          model.newSpeciesModeratorReview = null
        }
      },
      'afterApiUpdate:moderator' (model) {
        if (!model.moderatorReview) {
          model.newSpeciesModeratorReview = false
        }
      }
    }
  }
}
