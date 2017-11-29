'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        queryInterface.addColumn('users', 'waiting_list', Sequelize.BOOLEAN);
        queryInterface.addColumn('users', 'remote_ip', Sequelize.STRING);
    },

    down: function (queryInterface, Sequelize) {
        queryInterface.removeColumn('users', 'waiting_list');
        queryInterface.removeColumn('users', 'remote_ip');
    }
};
