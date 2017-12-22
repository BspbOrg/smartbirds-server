module.exports = {
  initialize: function (api, next) {
    api.forms = {
      isModerator: function (user, modelName) {
        return user.role === 'moderator' && user.forms && user.forms[ modelName ]
      }
    }
    next()
  }
}
