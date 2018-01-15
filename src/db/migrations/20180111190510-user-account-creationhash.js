'use strict';

module.exports = {
    up: function(queryInterface, Sequelize) {
        queryInterface.addColumn('users', 'creation_hash', Sequelize.STRING);
    },

    down: function(queryInterface, Sequelize) {
        queryInterface.removeColumn('users', 'creation_hash');
    },
};
