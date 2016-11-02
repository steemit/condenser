'use strict';
module.exports = function(sequelize, DataTypes) {
  var AccountMeta = sequelize.define('AccountMeta', {
    AccountName: {
        type: DataTypes.STRING,
        references: {
            model: 'accounts',
            key: 'name'
        },
        field: 'account_name'
    },
    key: DataTypes.STRING(30),
    value: DataTypes.STRING(256)
  }, {
    tableName: 'ametas',
    timestamps  : false,
    underscored : true,
    classMethods: {
      associate: function(models) {
        AccountMeta.belongsTo(models.Account, {
            onDelete: "CASCADE",
            foreignKey: {
              allowNull: false
            }
          })
      }
    }
  });
  return AccountMeta;
};
