module.exports = function (sequelize, DataTypes) {
    var List = sequelize.define('List', {
        kk: DataTypes.STRING(64),
        value: DataTypes.STRING(256),
    }, {
        tableName: 'lists',
        createdAt: 'created_at',
        updatedAt: false,
        timestamps  : true,
        underscored : true
    });
    return List;
};
