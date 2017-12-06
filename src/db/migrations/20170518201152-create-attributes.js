'use strict';

module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface
            .createTable('user_attributes', {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: Sequelize.INTEGER,
                },
                user_id: {
                    type: Sequelize.INTEGER,
                },
                type_of: {
                    type: Sequelize.STRING(64),
                },
                value: {
                    type: Sequelize.STRING(256),
                },
                created_at: {
                    allowNull: false,
                    type: Sequelize.DATE,
                },
                updated_at: {
                    allowNull: false,
                    type: Sequelize.DATE,
                },
            })
            .then(function() {
                queryInterface.addIndex('user_attributes', ['user_id']);
                queryInterface.addIndex('user_attributes', ['type_of']);
            });
    },

    down: function(queryInterface, Sequelize) {
        /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    },
};
