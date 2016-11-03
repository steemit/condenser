'use strict';
module.exports = function(sequelize, DataTypes) {
  var AccountMeta = sequelize.define('AccountMeta', {
    accname: DataTypes.STRING,
    k: DataTypes.STRING,
    v: DataTypes.STRING
  }, {
    tableName: 'ametas',
    timestamps  : false,
    underscored : true,
  });
  return AccountMeta;
};
