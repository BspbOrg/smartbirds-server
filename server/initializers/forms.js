module.exports = {
  initialize: function (api, next) {
    api.forms = {
      isModerator: function (user, modelName) {
        if (user.role === 'moderator') {
          if (user.forms && user.forms[modelName]) {
            return true
          }
        }
        return false
      }
    }
    next()
  }
}
