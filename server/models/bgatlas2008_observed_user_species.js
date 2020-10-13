module.exports = function (sequelize, Sequelize) {
  return sequelize.define('bgatlas2008_observed_user_species', {
    utm_code: { type: Sequelize.STRING(4), primaryKey: true },
    user_id: { type: Sequelize.INTEGER, primaryKey: true },
    species: { type: Sequelize.STRING, primaryKey: true },
    count: { type: Sequelize.INTEGER, allowNull: true },
    existing: { type: Sequelize.BOOLEAN, allowNull: true }
  }, {
    tableName: 'bgatlas2008_observed_user_species',
    timestamps: false,
    underscored: true
  })
}
