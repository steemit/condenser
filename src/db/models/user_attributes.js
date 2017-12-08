module.exports = function(sequelize, DataTypes) {
    var UserAttribute = sequelize.define(
        'UserAttribute',
        {
            UserId: {
                type: DataTypes.INTEGER,
                references: {
                    model: 'users',
                    key: 'id',
                },
                field: 'user_id',
            },
            type_of: DataTypes.STRING(64),
            value: DataTypes.STRING(256),
        },
        {
            tableName: 'user_attributes',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            timestamps: true,
            underscored: true,
            classMethods: {
                associate: function(models) {
                    UserAttribute.belongsTo(models.User, {
                        onDelete: 'CASCADE',
                        foreignKey: {
                            allowNull: false,
                        },
                    });
                },
            },
        }
    );
    return UserAttribute;
};
