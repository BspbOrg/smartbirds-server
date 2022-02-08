const { api } = require('actionhero')

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
          model.changed('species')) {
          model.newSpeciesModeratorReview = null
        }
      },
      'afterApiUpdate:moderator' (model) {
        if (!model.moderatorReview) {
          model.newSpeciesModeratorReview = false
        }
      },
      'afterApiUpdate:org-admin' (model) {
        if (!model.moderatorReview) {
          model.newSpeciesModeratorReview = false
        }
      },
      'afterApiUpdate:admin' (model) {
        if (!model.moderatorReview) {
          model.newSpeciesModeratorReview = false
        }
      },
      'afterApiUpdate' (model) {
        if (model.changed('newSpeciesModeratorReview') && model.bgatlas2008UtmCode && model.newSpeciesModeratorReview === false) {
          const afterUpdate = (inst) => {
            if (model !== inst) return
            model.constructor.removeHook(afterUpdate)
            api.tasks.enqueue('birdsNewSpeciesModeratorReview', {
              filter: {
                bgatlas2008UtmCode: model.bgatlas2008UtmCode,
                species: model.species
              },
              force: true
            })
          }
          model.constructor.addHook('afterUpdate', afterUpdate)
        }
      }
    }
  }
}
