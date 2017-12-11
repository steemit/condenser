'use strict';

module.exports = {
    up: function(queryInterface, Sequelize) {
        queryInterface.addColumn('users', 'account_status', {
            type: Sequelize.STRING,
            defaultValue: 'waiting',
            allowNull: false,
        });
        queryInterface.addColumn('users', 'sign_up_meta', {
            type: Sequelize.TEXT,
        });
        queryInterface.addColumn('accounts', 'created', {
            type: Sequelize.BOOLEAN,
        });
    },

    down: function(queryInterface, Sequelize) {},
};
