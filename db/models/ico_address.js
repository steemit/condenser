module.exports = function (sequelize, DataTypes) {
  var IcoAddress = sequelize.define('IcoAddress', {
      AccountId: {
          type: DataTypes.INTEGER,
          references: {
              model: 'accounts',
              key: 'id'
          },
          field: 'account_id'
      },
      account_name: {type: DataTypes.STRING, unique: true},
      btc_address: {type: DataTypes.STRING, unique: true}
  }, {
      tableName: 'ico_address',
      createdAt   : 'created_at',
      updatedAt   : 'updated_at',
      timestamps  : true,
      underscored : true,
      classMethods: {
          associate: function (models) {
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
}
