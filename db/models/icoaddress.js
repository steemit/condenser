'use strict';
module.exports = function(sequelize, DataTypes) {
  var IcoAddress = sequelize.define('IcoAddress', {
    AccountId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'accounts',
            key: 'id'
        },
        field: 'account_id'
    },
    AccountName: {
        type: DataTypes.STRING,
        references: {
            model: 'accounts',
            key: 'name'
        },
        field: 'account_name'
    },
    btc_address: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        IcoAddress.belongsTo(models.Account, {
            onDelete: "CASCADE",
            foreignKey: {
                allowNull: false
            }
        });
      }
    }
  });
  return IcoAddress;
};
