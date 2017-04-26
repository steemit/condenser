'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        queryInterface.addColumn('identities', 'remote_ip', Sequelize.STRING);
        queryInterface.addColumn('identities', 'browser', Sequelize.STRING);
        queryInterface.addColumn('identities', 'referer', Sequelize.STRING);
        queryInterface.addColumn('identities', 'user_name_picked', Sequelize.STRING);
        queryInterface.addColumn('identities', 'last_step', Sequelize.INTEGER);
    },

    down: function (queryInterface, Sequelize) {
        queryInterface.removeColumn('identities', 'remote_ip', Sequelize.STRING);
        queryInterface.removeColumn('identities', 'browser', Sequelize.STRING);
        queryInterface.removeColumn('identities', 'referer', Sequelize.STRING);
        queryInterface.removeColumn('identities', 'user_name_picked', Sequelize.STRING);
        queryInterface.removeColumn('identities', 'last_step', Sequelize.INTEGER);
    }
};
