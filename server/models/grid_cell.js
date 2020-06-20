module.exports = function (sequelize, DataTypes) {
  return sequelize.define('GridCell', {
    gridId: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    cellId: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    v1Longitude: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    v1Latitude: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    v2Longitude: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    v2Latitude: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    v3Longitude: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    v3Latitude: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    v4Longitude: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    v4Latitude: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  }, {
    timestamps: false,
    underscored: true
  })
}
