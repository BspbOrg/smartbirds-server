const localField = require('../utils/localField')

const nameField = localField('name')

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('Settlement', {
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    ...nameField.attributes
  }, {
    tableName: 'settlements',
    timestamps: false
  })
}
