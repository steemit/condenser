'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('ico_address', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      account_id: {
        type: Sequelize.INTEGER,
        references: {
            model: 'accounts',
            key: 'id'
        },
        onDelete: 'cascade'
      },
      account_name: {
        type: Sequelize.STRING,
        onUpdate: 'cascade',
        references: {
            model: 'accounts',
            key: 'name'
        },
        onDelete: 'cascade'
      },
      btc_address: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }).then(function(){
      queryInterface.addIndex('ico_address', ['account_id']);
      queryInterface.addIndex('ico_address', ['account_name']);
      queryInterface.addIndex('ico_address', ['btc_address']);
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('ico_address');
  }
};
