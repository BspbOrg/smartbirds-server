var _ = require('lodash')
var bcrypt = require('bcrypt')
var bcryptComplexity = 10
var crypto = require('crypto')

const privacyTypes = ['public', 'private']

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('User', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true }
    },
    passwordHash: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isAdmin: {
      type: DataTypes.VIRTUAL,
      get: function () {
        return this.getDataValue('role') === 'admin'
      }
    },
    isModerator: {
      type: DataTypes.VIRTUAL,
      get: function () {
        return this.getDataValue('role') === 'moderator'
      }
    },
    isOrgAdmin: {
      type: DataTypes.VIRTUAL,
      get: function () {
        return this.getDataValue('role') === 'org-admin'
      }
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'user',
      validate: {
        isIn: [['user', 'admin', 'moderator', 'org-admin']]
      }
    },
    imported: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    language: {
      type: DataTypes.STRING,
      defaultValue: 'en'
    },
    forgotPasswordHash: DataTypes.TEXT,
    forgotPasswordTimestamp: DataTypes.DATE,
    notes: DataTypes.TEXT,
    privacy: {
      type: DataTypes.STRING,
      defaultValue: 'public',
      allowNull: false,
      validate: {
        isIn: { args: [privacyTypes], msg: `Must be one of "${privacyTypes.join('", "')}"` }
      }
    },
    forms: {
      type: DataTypes.TEXT,
      get: function () {
        return this.getDataValue('forms') && JSON.parse(this.getDataValue('forms'))
      },
      set: function (val) {
        this.setDataValue('forms', JSON.stringify(val))
      }
    },
    gdprConsent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    organizationSlug: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: ['email']
      }
    ],

    setterMethods: {
      organization (value) {
        if (value) {
          this.setDataValue('organizationSlug', value)
        }
      }
    },

    classMethods: {
      associate: function (models) {
        // associations can be defined here
        // models.user.hasMany(models.zone, {foreignKey: 'ownerId', as: 'zones'});
        models.user.belongsToMany(models.user, {
          as: 'sharers',
          through: 'Share',
          foreignKey: 'sharee',
          otherKey: 'sharer'
        })
        models.user.belongsToMany(models.user, {
          as: 'sharees',
          through: 'Share',
          foreignKey: 'sharer',
          otherKey: 'sharee'
        })
      }
    },

    instanceMethods: {
      name: function () {
        if (!this.gdprConsent) return ''
        return [this.firstName, this.lastName].join(' ')
      },

      updatePassword: function (pw, callback) {
        var self = this
        bcrypt.genSalt(bcryptComplexity, function (error, salt) {
          if (error) {
            return callback(error)
          }
          bcrypt.hash(pw, salt, function (error, hash) {
            if (error) {
              return callback(error)
            }
            self.passwordHash = hash
            callback(null, self)
          })
        })
      },

      checkPassword: function (pw, callback) {
        return bcrypt.compare(pw, this.passwordHash, callback)
      },

      genPasswordToken: function (callback) {
        var self = this
        crypto.randomBytes(64, function (ex, buf) {
          var pwToken = buf.toString('hex')
          bcrypt.genSalt(bcryptComplexity, function (error, salt) {
            if (error) return callback(error)

            bcrypt.hash(pwToken, salt, function (error, hash) {
              if (error) return callback(error)

              self.forgotPasswordHash = hash
              self.forgotPasswordTimestamp = new Date()

              callback(null, pwToken)
            })
          })
        })
      },

      checkPasswordToken: function (token, callback) {
        bcrypt.compare(token, this.forgotPasswordHash, callback)
      },

      apiData: function (api, context) {
        switch (context) {
          case 'public':
            return {
              id: this.id,
              firstName: this.gdprConsent ? this.firstName : '',
              lastName: this.gdprConsent ? this.lastName : ''
            }
          case 'foreign':
            return {
              id: this.id,
              firstName: this.firstName,
              lastName: this.lastName
            }
          case 'sharer':
          case 'sharee':
            return {
              id: this.id,
              email: this.email,
              firstName: this.firstName,
              lastName: this.lastName
            }
          default:
            return {
              id: this.id,
              email: this.email,
              firstName: this.firstName,
              lastName: this.lastName,
              lastLoginAt: this.lastLoginAt,
              notes: this.notes,
              language: this.language,
              role: this.role,
              isAdmin: this.isAdmin,
              isModerator: this.isModerator,
              isOrgAdmin: this.isOrgAdmin,
              forms: this.forms,
              privacy: this.privacy,
              gdprConsent: this.gdprConsent,
              organization: this.organizationSlug
            }
        }
      },

      apiUpdate: function (data) {
        _.assign(this, _.pick(data, 'firstName', 'lastName', 'notes', 'language', 'forms', 'privacy', 'organization'))
      }
    }
  })
}
