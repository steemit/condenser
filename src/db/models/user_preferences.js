module.exports = function (sequelize, DataTypes) {
    var UserPreferences = sequelize.define('UserPreferences', {
        account: {type: DataTypes.STRING, unique: true},
        json: {type: DataTypes.TEXT}
    }, {
        tableName: 'user_preferences',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        timestamps: true,
        underscored: true
    });
    return UserPreferences;
};
