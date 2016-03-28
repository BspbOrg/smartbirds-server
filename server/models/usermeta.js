'use strict';
module.exports = function (sequelize, DataTypes) {
  var UserMeta = sequelize.define('UserMeta', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    metaKey: {
      type: DataTypes.STRING,
      allowNull: false
    },
    metaValue: DataTypes.TEXT,
    imported: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    indexes: [
      {
        fields: ['userId', 'metaKey']
      },
      {
        fields: ['metaKey', 'metaValue']
      },
    ],
    classMethods: {
      associate: function (models) {
        // associations can be defined here

      }
    },
    instanceMethods: {
      apiData: function (api) {
        return {
          id: this.id,
          userId: this.userId,
          key: this.metaKey,
          value: this.metaValue
        }
      }
    }
  });
  return UserMeta;
};
