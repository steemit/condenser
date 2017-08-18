module.exports = function (sequelize, DataTypes) {
    var AccountRecoveryRequest = sequelize.define('AccountRecoveryRequest', {
        UserId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'users',
                key: 'id'
            },
            field: 'user_id'
        },
        uid: {type: DataTypes.STRING, unique: false},
        contact_email: {type: DataTypes.STRING, unique: false},
        account_name: {type: DataTypes.STRING, unique: false},
        email_confirmation_code: {type: DataTypes.STRING(64), unique: false},
        provider: {type: DataTypes.STRING(64), unique: false},
        validation_code: {type: DataTypes.STRING(64), unique: false},
        request_submitted_at: {type: DataTypes.DATE, unique: false},
        owner_key: {type: DataTypes.STRING, unique: false},
        old_owner_key: {type: DataTypes.STRING, unique: false},
        new_owner_key: {type: DataTypes.STRING, unique: false},
        memo_key: {type: DataTypes.STRING, unique: false},
        remote_ip: {type: DataTypes.STRING, unique: false},
        status: {type: DataTypes.STRING, unique: false},
    }, {
        tableName: 'arecs',
        createdAt   : 'created_at',
        updatedAt   : 'updated_at',
        timestamps  : true,
        underscored : true,
        classMethods: {
            associate: function (models) {
                AccountRecoveryRequest.belongsTo(models.User, {
                    onDelete: "SET NULL",
                    foreignKey: {
                        allowNull: true
                    }
                });
            }
        }
    });
    return AccountRecoveryRequest;
};
