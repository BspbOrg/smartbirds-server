var _ = require('lodash');
var bcrypt = require('bcrypt');
var bcryptComplexity = 10;
var crypto = require('crypto');

module.exports = function (sequelize, DataTypes) {
  return sequelize.define("User", {
    'email': {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {isEmail: true},
    },
    'passwordHash': {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    'firstName': {
      type: DataTypes.STRING,
      allowNull: false,
    },
    'lastName': {
      type: DataTypes.STRING,
      allowNull: false,
    },
    'lastLoginAt': {
      type: DataTypes.DATE,
      allowNull: true,
    },
    'isAdmin': {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    imported: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    forgotPasswordHash: DataTypes.TEXT,
    forgotPasswordTimestamp: DataTypes.DATE
  }, {
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
    ],

    classMethods: {
      associate: function(models) {
        // associations can be defined here
        models.user.hasMany(models.usermeta);
        //models.user.hasMany(models.zone, {foreignKey: 'ownerId', as: 'zones'});
      }
    },

    instanceMethods: {
      name: function () {
        return [this.firstName, this.lastName].join(' ');
      },

      updatePassword: function (pw, callback) {
        var self = this;
        var salt = bcrypt.genSalt(bcryptComplexity, function (error, salt) {
          if (error) {
            return callback(error);
          }
          bcrypt.hash(pw, salt, function (error, hash) {
            if (error) {
              return callback(error);
            }
            self.passwordHash = hash;
            callback(null, self);
          });
        });
      },

      checkPassword: function (pw, callback) {
        bcrypt.compare(pw, this.passwordHash, callback);
      },

      genPasswordToken: function(callback) {
        var self = this;
        crypto.randomBytes(128, function (ex, buf) {
          var pwToken = buf.toString('hex');
          var salt = bcrypt.genSalt(bcryptComplexity, function (error, salt) {
            if (error) return callback(error);

            bcrypt.hash(pwToken, salt, function (error, hash) {
              if (error) return callback(error);

              self.forgotPasswordHash = hash;
              self.forgotPasswordTimestamp = new Date();

              callback(null, pwToken);
            });
          });
        });
      },

      checkPasswordToken: function(token, callback) {
        bcrypt.compare(token, this.forgotPasswordHash, callback);
      },

      apiData: function (api) {
        return {
          id: this.id,
          email: this.email,
          firstName: this.firstName,
          lastName: this.lastName,
          lastLoginAt: this.lastLoginAt,
          isAdmin: this.isAdmin
        };
      },

      apiUpdate: function (data) {
        _.assign(this, _.pick(data, 'firstName', 'lastName'));
      }
    }
  });
};
