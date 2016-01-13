/**
 * Created by dani on 12.01.16.
 */

module.exports = function (sequelize, DataTypes) {
  var FormCBMThreat = sequelize.define('FormCBMThreat', {
    threatSlug: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    formCBMId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    classMethods: {
      associate: function (models) {
        // define nomenclature relations
        models.formCBMThreat.belongsTo(models.nomenclature, {as: 'threat', foreignKey: 'threatSlug', targetKey: 'slug'});
      }
    },
  });
  return FormCBMThreat;
};
