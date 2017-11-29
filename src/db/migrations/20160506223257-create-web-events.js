'use strict';
module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('web_events', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            event_type: {type: Sequelize.STRING(64)},
            value: {type: Sequelize.STRING(1024)},
            user_id: {type: Sequelize.INTEGER},
            uid: {type: Sequelize.STRING(32)},
            account_name: {type: Sequelize.STRING(64)},
            first_visit: {type: Sequelize.BOOLEAN},
            new_session: {type: Sequelize.BOOLEAN},
            ip: {type: Sequelize.STRING(48)},
            refurl: {type: Sequelize.STRING},
            user_agent: {type: Sequelize.STRING},
            status: {type: Sequelize.INTEGER},
            city: {type: Sequelize.STRING(64)},
            state: {type: Sequelize.STRING(64)},
            country: {type: Sequelize.STRING(64)},
            channel: {type: Sequelize.STRING(64)},
            referrer: {type: Sequelize.STRING(64)},
            refcode: {type: Sequelize.STRING(64)},
            campaign: {type: Sequelize.STRING(64)},
            adgroupid: {type: Sequelize.INTEGER},
            adid: {type: Sequelize.INTEGER},
            keywordid: {type: Sequelize.INTEGER},
            contentid: {type: Sequelize.INTEGER},
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        }).then(function () {
            queryInterface.addIndex('web_events', ['event_type']);
            queryInterface.addIndex('web_events', ['user_id']);
            queryInterface.addIndex('web_events', ['uid']);
            queryInterface.addIndex('web_events', ['account_name']);
        });
    },
    down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable('web_events');
    }
};
