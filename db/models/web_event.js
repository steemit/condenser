module.exports = function (sequelize, DataTypes) {
    var WebEvent = sequelize.define('WebEvent', {
        event_type: DataTypes.STRING(64),
        value: DataTypes.STRING(1024),
        user_id: DataTypes.INTEGER,
        uid: DataTypes.STRING(32),
        account_name: DataTypes.STRING(64),
        first_visit: DataTypes.BOOLEAN,
        new_session: DataTypes.BOOLEAN,
        ip: DataTypes.STRING(48),
        page: DataTypes.STRING,
        refurl: DataTypes.STRING,
        user_agent: DataTypes.STRING,
        status: DataTypes.INTEGER,
        city: DataTypes.STRING(64),
        state: DataTypes.STRING(64),
        country: DataTypes.STRING(64),
        channel: DataTypes.STRING(64),
        referrer: DataTypes.STRING(64),
        refcode: DataTypes.STRING(64),
        campaign: DataTypes.STRING(64),
        adgroupid: DataTypes.INTEGER,
        adid: DataTypes.INTEGER,
        keywordid: DataTypes.INTEGER,
        messageid: DataTypes.INTEGER,
    }, {
        tableName: 'web_events',
        createdAt: 'created_at',
        updatedAt: false,
        timestamps  : true,
        underscored : true
    });
    return WebEvent;
};
