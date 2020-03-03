'use strict'

// error messages can be strings of objects
exports.default = {
  errors: function (api) {
    return {
      _toExpand: false,

      // ///////////////
      // SERIALIZERS //
      // ///////////////

      serializers: {
        servers: {
          web: function (error) {
            if (error.message) {
              return String(error.message)
            } else {
              return error
            }
          },
          websocket: function (error) {
            if (error.message) {
              return String(error.message)
            } else {
              return error
            }
          },
          socket: function (error) {
            if (error.message) {
              return String(error.message)
            } else {
              return error
            }
          },
          specHelper: function (error) {
            if (error.message) {
              if (process.env.NODE_ENV === 'test') return `Error: ${error.message}\n${error.stack}`
              return 'Error: ' + String(error.message)
            } else {
              return error
            }
          }
        }
      },

      // ///////////
      // ACTIONS //
      // ///////////

      // When a params for an action is invalid
      invalidParams: function (data, validationErrors) {
        if (process.env.NODE_ENV === 'test') return `invalid params: ${JSON.stringify(validationErrors)}`
        if (validationErrors && validationErrors.length >= 0) { return data.connection.localize(validationErrors[0]) }
        return data.connection.localize('actionhero.errors.invalidParams')
      },

      // When a required param for an action is not provided
      missingParams: function (data, missingParams) {
        if (process.env.NODE_ENV === 'test') return `missing params: ${JSON.stringify(missingParams)}`
        return data.connection.localize(['actionhero.errors.missingParams', { param: missingParams[0] }])
      },

      // user requested an unknown action
      unknownAction: function (data) {
        return data.connection.localize('actionhero.errors.unknownAction')
      },

      // action not useable by this client/server type
      unsupportedServerType: function (data) {
        return data.connection.localize(['actionhero.errors.unsupportedServerType', { type: data.connection.type }])
      },

      // action failed because server is mid-shutdown
      serverShuttingDown: function (data) {
        return data.connection.localize('actionhero.errors.serverShuttingDown')
      },

      // action failed because this client already has too many pending acitons
      // limit defined in api.config.general.simultaneousActions
      tooManyPendingActions: function (data) {
        return data.connection.localize('actionhero.errors.tooManyPendingActions')
      },

      dataLengthTooLarge: function (maxLength, receivedLength) {
        return api.i18n.localize(['actionhero.errors.dataLengthTooLarge', {
          maxLength: maxLength,
          receivedLength: receivedLength
        }])
      },

      // ///////////////
      // FILE SERVER //
      // ///////////////

      // The body message to accompany 404 (file not found) errors regarding flat files
      // You may want to load in the contnet of 404.html or similar
      fileNotFound: function (connection) {
        return connection.localize(['actionhero.errors.fileNotFound'])
      },

      // user didn't request a file
      fileNotProvided: function (connection) {
        return connection.localize('actionhero.errors.fileNotProvided')
      },

      // something went wrong trying to read the file
      fileReadError: function (connection, error) {
        return connection.localize(['actionhero.errors.fileReadError', { error: String(error) }])
      },

      // ///////////////
      // CONNECTIONS //
      // ///////////////

      verbNotFound: function (connection, verb) {
        return connection.localize(['actionhero.errors.verbNotFound', { verb: verb }])
      },

      verbNotAllowed: function (connection, verb) {
        return connection.localize(['actionhero.errors.verbNotAllowed', { verb: verb }])
      },

      connectionRoomAndMessage: function (connection) {
        return connection.localize('actionhero.errors.connectionRoomAndMessage')
      },

      connectionNotInRoom: function (connection, room) {
        return connection.localize(['actionhero.errors.connectionNotInRoom', { room: room }])
      },

      connectionAlreadyInRoom: function (connection, room) {
        return connection.localize(['actionhero.errors.connectionAlreadyInRoom', { room: room }])
      },

      connectionRoomHasBeenDeleted: function (room) {
        return api.i18n.localize('actionhero.errors.connectionRoomHasBeenDeleted')
      },

      connectionRoomNotExist: function (room) {
        return api.i18n.localize('actionhero.errors.connectionRoomNotExist')
      },

      connectionRoomExists: function (room) {
        return api.i18n.localize('actionhero.errors.connectionRoomExists')
      },

      connectionRoomRequired: function (room) {
        return api.i18n.localize('actionhero.errors.connectionRoomRequired')
      },

      // //////////////
      // Application //
      // //////////////
      sessionInvalidCredentials: function (connection) {
        return connection.localize('Invalid credentials')
      },

      sessionRequireAuthentication: function (connection) {
        return connection.localize('Authentication is required')
      },

      sessionNoPermission: function (connection) {
        return connection.localize('No permission')
      },

      formNotFound: function (connection, type, id) {
        return connection.localize('Form {{type}} #{{id}} not found', { type, id })
      },

      locationNotFound: function (connection, id) {
        return connection.localize('Location #{{id} not found', { id })
      },

      invalidLocationFilter: function (connection, filter) {
        return connection.localize('Invalid location filter "{{filter}}"', { filter })
      },

      missingGDPRconsent: function (connection) {
        return connection.localize('Missing GDPR consent')
      }
    }
  }
}
