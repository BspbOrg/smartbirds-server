const _ = require('lodash')
const bcrypt = require('bcrypt')
const bcryptComplexity = 10
const crypto = require('crypto')

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
    },
    allowDataMosv: DataTypes.BOOLEAN,
    allowDataSciencePublications: DataTypes.BOOLEAN,
    moderatorOrganizations: {
      type: DataTypes.TEXT,
      allowNull: true,
      get () {
        const raw = this.getDataValue('moderatorOrganizations')
        if (!raw) return []
        try {
          return JSON.parse(raw)
        } catch (e) {
          return []
        }
      },
      set (value) {
        this.setDataValue('moderatorOrganizations', value ? JSON.stringify(value) : null)
      }
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
        models.user.belongsToMany(models.bgatlas2008_stats_global, {
          as: 'bgatlas2008Cells',
          through: 'bgatlas2008_user_selected',
          timestamps: false,
          foreignKey: 'user_id',
          otherKey: 'utm_code'
        })
      }
    },

    instanceMethods: {
      name: function () {
        if (!this.gdprConsent) return ''
        return [this.firstName, this.lastName].join(' ')
      },

      updatePassword: function (pw, callback) {
        if (callback == null) {
          return new Promise((resolve, reject) => {
            this.updatePassword(pw, (error, res) => {
              if (error) {
                return reject(error)
              }
              resolve(res)
            })
          })
        }

        const self = this
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
        const self = this
        crypto.randomBytes(64, function (ex, buf) {
          const pwToken = buf.toString('hex')
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
              organization: this.organizationSlug,
              allowDataMosv: this.allowDataMosv,
              allowDataSciencePublications: this.allowDataSciencePublications
            }
        }
      },

      apiUpdate: function (data) {
        _.assign(this, _.pick(data, 'firstName', 'lastName', 'notes', 'language', 'forms', 'privacy', 'organization'))
      },

      getAllModeratorOrganizations: function () {
        // ONLY moderators get multi-org access (NOT org-admin, NOT admin)
        if (this.role !== 'moderator') return []

        // Start with primary organization
        const orgs = [this.organizationSlug]

        // Add additional organizations from moderatorOrganizations field
        if (this.moderatorOrganizations && Array.isArray(this.moderatorOrganizations)) {
          orgs.push(...this.moderatorOrganizations)
        }

        // Return deduplicated list
        return [...new Set(orgs)]
      },

      canModerateInOrganization: function (organizationSlug) {
        if (this.role === 'admin') return true

        // org-admin can only moderate in their primary organization
        if (this.role === 'org-admin') {
          return this.organizationSlug === organizationSlug
        }

        // moderator can moderate in primary + additional orgs
        if (this.role === 'moderator') {
          if (this.organizationSlug === organizationSlug) return true
          return this.moderatorOrganizations && this.moderatorOrganizations.includes(organizationSlug)
        }

        return false
      }
    }
  })
}
