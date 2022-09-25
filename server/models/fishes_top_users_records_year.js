'use strict'
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('fishes_top_users_records_year', {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    count: DataTypes.INTEGER
  }, {
    timestamps: false,
    tableName: 'fishes_top_users_records_year',
    classMethods: {
      associate: function ({ user }) {
        this.belongsTo(user, {
          as: 'user',
          foreignKey: 'user_id'
        })
      }
    },
    instanceMethods: {
      apiData: function (api) {
        return {
          user: this.user ? this.user.apiData(api, 'public') : null,
          count: this.count
        }
      }
    }
  })
}
