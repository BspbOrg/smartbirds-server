/**
 * Created by dani on 06.01.16.
 */

'use strict';
module.exports = function (sequelize, DataTypes) {
  var FormCBMObserver = sequelize.define('FormCBMObserver',{
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    observer: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  });
  return FormCBMObserver;
};
