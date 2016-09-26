module.exports = function (sequelize, DataTypes) {
    var Identity = sequelize.define('Identity', {
        UserId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'users',
                key: 'id'
            },
            field: 'user_id'
        },
        provider: DataTypes.STRING,
        provider_user_id: {type: DataTypes.STRING},
        name: DataTypes.STRING,
        email: {type: DataTypes.STRING},
        phone: {type: DataTypes.STRING(32)},
        confirmation_code: {type: DataTypes.STRING, unique: true},
        verified: DataTypes.BOOLEAN,
        score: DataTypes.INTEGER
    }, {
        tableName: 'identities',
        createdAt   : 'created_at',
        updatedAt   : 'updated_at',
        timestamps  : true,
        underscored : true,
        classMethods: {
            associate: function (models) {
                Identity.belongsTo(models.User, {
                    onDelete: "CASCADE",
                    foreignKey: {
                        allowNull: false
                    }
                });
            }
        }
    });
    return Identity;
};
