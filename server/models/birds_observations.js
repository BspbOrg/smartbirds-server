module.exports = function (sequelize, Sequelize) {
  return sequelize.define('birds_observations', {
    form_name: { type: Sequelize.STRING, primaryKey: true },
    id: { type: Sequelize.INTEGER, primaryKey: true },
    latitude: { type: Sequelize.FLOAT, allowNull: false },
    longitude: { type: Sequelize.FLOAT, allowNull: false },
    user_id: { type: Sequelize.INTEGER, allowNull: false },
    organization: Sequelize.STRING,
    observation_date_time: { type: Sequelize.DATE, allowNull: false },
    species: { type: Sequelize.STRING, allowNull: false },
    count: Sequelize.INTEGER,
    monitoring_code: Sequelize.STRING,
    start_datetime: Sequelize.DATE,
    end_datetime: Sequelize.DATE,
    confidential: Sequelize.BOOLEAN,
    moderatorReview: Sequelize.BOOLEAN,
    newSpeciesModeratorReview: Sequelize.BOOLEAN,
    auto_location_en: Sequelize.STRING,
    auto_location_local: Sequelize.STRING,
    auto_location_lang: Sequelize.STRING,
    bgatlas2008_utm_code: Sequelize.STRING,
    observation_methodology_en: Sequelize.STRING,
    observation_methodology_local: Sequelize.STRING,
    observation_methodology_lang: Sequelize.STRING
  }, {
    tableName: 'birds_observations',
    timestamps: false,
    underscored: true
  })
}
