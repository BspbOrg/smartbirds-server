module.exports = function (sequelize, DataTypes) {
  return sequelize.define('Duplicate', {
    form: DataTypes.TEXT,
    id1: DataTypes.INTEGER,
    id2: DataTypes.INTEGER,
    hash: DataTypes.STRING(64)
  }, {
    underscored: true,
    tableName: 'duplicates',
    timestamps: false
  })
}
