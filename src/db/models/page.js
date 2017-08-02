module.exports = function (sequelize, DataTypes) {
    var Page = sequelize.define('Page', {
        permlink: DataTypes.STRING(256),
        views: DataTypes.INTEGER,
    }, {
        tableName: 'pages',
        createdAt: 'created_at',
        updatedAt: false,
        timestamps  : true,
        underscored : true
    });
    return Page;
};
