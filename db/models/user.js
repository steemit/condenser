module.exports = function (sequelize, DataTypes) {
    var User = sequelize.define('User', {
        name: DataTypes.STRING,
        email: {type: DataTypes.STRING},
        uid: {type: DataTypes.STRING(64)},
        first_name: DataTypes.STRING,
        last_name: DataTypes.STRING,
        birthday: DataTypes.DATE,
        gender: DataTypes.STRING(8),
        picture_small: DataTypes.STRING,
        picture_large: DataTypes.STRING,
        location_id: DataTypes.BIGINT.UNSIGNED,
        location_name: DataTypes.STRING,
        locale: DataTypes.STRING(12),
        timezone: DataTypes.INTEGER,
        remote_ip: DataTypes.STRING,
        verified: DataTypes.BOOLEAN,
        waiting_list: DataTypes.BOOLEAN,
        bot: DataTypes.BOOLEAN,
        last_step: DataTypes.INTEGER,
        link_clicked: DataTypes.STRING,
        approved: DataTypes.BOOLEAN,
        to_be_created: DataTypes.BOOLEAN,
        button_screen_x: DataTypes.STRING,
        button_screen_y: DataTypes.STRING
    }, {
        tableName: 'users',
        createdAt   : 'created_at',
        updatedAt   : 'updated_at',
        timestamps  : true,
        underscored : true,
        classMethods: {
            associate: function (models) {
                User.hasMany(models.Identity);
                User.hasMany(models.Account);
            }
        }
    });
    return User;
};
