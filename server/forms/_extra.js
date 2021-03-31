const autoLocation = require('./_fields/autoLocation')
const monitoringObservationType = require('./_fields/monitoringObservationType')

exports.fields = {
  ...autoLocation.fields,
  ...monitoringObservationType.fields,
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
