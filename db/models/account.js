module.exports = function (sequelize, DataTypes) {
    var Account = sequelize.define('Account', {
        UserId: {
            type: DataTypes.INTEGER,
            references: {
                model   : 'users',
                key     : 'id'
            },
            field: 'user_id'
        },
        name        : {type: DataTypes.STRING, unique: true},
        owner_key   : {type: DataTypes.STRING, unique: true},
        active_key  : {type: DataTypes.STRING, unique: true},
        posting_key : {type: DataTypes.STRING, unique: true},
        memo_key    : {type: DataTypes.STRING, unique: true},
        referrer    : DataTypes.STRING,
        refcode     : DataTypes.STRING,
        remote_ip   : DataTypes.STRING,
        ignored     : {type: DataTypes.BOOLEAN},
    }, {
        tableName   : 'accounts',
        createdAt   : 'created_at',
        updatedAt   : 'updated_at',
        timestamps  : true,
        underscored : true,
        classMethods: {
            associate: function (models) {
                Account.belongsTo(models.User, {
                    onDelete: "CASCADE",
                    foreignKey: {
                        allowNull: false
                    }
                });
            }
        }
    });
    return Account;
};
