var _ = require('lodash')
var bcrypt = require('bcrypt')
var bcryptComplexity = 10
var crypto = require('crypto')

const privacyTypes = [ 'public', 'private' ]

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('User', {
    'email': {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true }
    },
    'passwordHash': {
      type: DataTypes.TEXT,
      allowNull: false
    },
    'firstName': {
      type: DataTypes.STRING,
      allowNull: false
    },
    'lastName': {
      type: DataTypes.STRING,
      allowNull: false
    },
    'lastLoginAt': {
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
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'user',
      validate: {
        isIn: [ [ 'user', 'admin', 'moderator' ] ]
      }
    },
    imported: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    language: {
      type: DataTypes.STRING,
      defaultValue: 'bg'
    },
    forgotPasswordHash: DataTypes.TEXT,
    forgotPasswordTimestamp: DataTypes.DATE,
    address: DataTypes.TEXT,
    birdsKnowledge: DataTypes.TEXT,
    city: DataTypes.TEXT,
    level: DataTypes.TEXT,
    mobile: DataTypes.TEXT,
    notes: DataTypes.TEXT,
    phone: DataTypes.TEXT,
    postcode: DataTypes.TEXT,
    profile: DataTypes.TEXT,
    privacy: {
      type: DataTypes.STRING,
      defaultValue: 'public',
      allowNull: false,
      validate: {
        isIn: { args: [ privacyTypes ], msg: `Must be one of "${privacyTypes.join('", "')}"` }
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
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: [ 'email' ]
      }
    ],

    classMethods: {
      associate: function (models) {
        // associations can be defined here
        // models.user.hasMany(models.usermeta);
        // models.user.hasMany(models.zone, {foreignKey: 'ownerId', as: 'zones'});
        models.user.belongsToMany(models.user, {as: 'sharers', through: 'Share', foreignKey: 'sharee', otherKey: 'sharer'})
        models.user.belongsToMany(models.user, {as: 'sharees', through: 'Share', foreignKey: 'sharer', otherKey: 'sharee'})
      }
    },

    instanceMethods: {
      name: function () {
        return [ this.firstName, this.lastName ].join(' ')
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
        bcrypt.compare(pw, this.passwordHash, callback)
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
        if (context === 'public') {
          return {
            firstName: this.firstName,
            lastName: this.lastName
          }
        }
        return {
          id: this.id,
          email: this.email,
          firstName: this.firstName,
          lastName: this.lastName,
          lastLoginAt: this.lastLoginAt,
          address: this.address,
          birdsKnowledge: this.birdsKnowledge,
          city: this.city,
          level: this.level,
          mobile: this.mobile,
          notes: this.notes,
          phone: this.phone,
          postcode: this.postcode,
          profile: this.profile,
          language: this.language,
          role: this.role,
          isAdmin: this.isAdmin,
          isModerator: this.isModerator,
          forms: this.forms,
          privacy: this.privacy
        }
      },

      apiUpdate: function (data) {
        _.assign(this, _.pick(data, 'firstName', 'lastName', 'address', 'birdsKnowledge',
          'city', 'level', 'mobile', 'notes', 'phone', 'postcode', 'profile', 'language', 'forms',
          'privacy'))
      }
    }
  })
}
