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
    instanceMethods: {
      apiData: function () {
        return {
          gridId: this.gridId,
          cellId: this.cellId,
          vertexes: [
            { lat: this.v1Latitude, lon: this.v1Longitude },
            { lat: this.v2Latitude, lon: this.v2Longitude },
            { lat: this.v3Latitude, lon: this.v3Longitude },
            { lat: this.v4Latitude, lon: this.v4Longitude }
          ]
        }
      }
    },
    timestamps: false,
    underscored: true
  })
}
