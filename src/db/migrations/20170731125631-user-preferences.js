'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('user_preferences', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            account: {
                type: Sequelize.STRING
            },
            json: {
                type: Sequelize.TEXT
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        }).then(function () {
            queryInterface.addIndex('user_preferences', ['account'], {indicesType: 'UNIQUE'});
        });
    },
    down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable('user_preferences');
    }
};
