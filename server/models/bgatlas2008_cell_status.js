module.exports = function (sequelize, DataTypes) {
  return sequelize.define('bgatlas2008_cell_status', {
    utm_code: {
      type: DataTypes.TEXT,
      primaryKey: true
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    }
  }, {
    tableName: 'bgatlas2008_cell_status',
    underscored: true,
    classMethods: {
      associate: function (models) {
        models.bgatlas2008_cell_status.hasOne(models.bgatlas2008_cells, {
          as: 'utmCoordinates',
          sourceKey: 'utm_code',
          foreignKey: 'utm_code'
        })

        models.bgatlas2008_cell_status.belongsToMany(models.user, {
          as: 'users',
          through: 'bgatlas2008_user_selected',
          timestamps: false,
          foreignKey: 'utm_code',
          otherKey: 'user_id'
        })
      }
    },
    instanceMethods: {
      apiData: function () {
        const data = {
          utm_code: this.utm_code,
          completed: this.completed
        }

        if (this.utmCoordinates) {
          data.coordinates = this.utmCoordinates.coordinates()
        }

        return data
      }
    }
  })
}
