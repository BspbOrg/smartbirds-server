const autoLocation = require('./_fields/autoLocation')
const observationMethodology = require('./_fields/observationMethodology')

exports.fields = {
  ...autoLocation.fields,
  ...observationMethodology.fields,
  moderatorReview: 'boolean'
}

exports.validate = {
  validateModeratorReview: function () {
    if (this.moderatorReview) {
      let hasPicture = false
      if (this.pictures) {
        const pictures = JSON.parse(this.pictures) || []
        hasPicture = pictures.length > 0
      }

      if (!hasPicture) {
        throw new Error('ModeratorReview is allowed only when picture(s) are attached')
      }
    }
  }
}
