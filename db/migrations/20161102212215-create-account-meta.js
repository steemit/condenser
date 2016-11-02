'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('ametas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      account_name: {
        type: Sequelize.STRING
      },
      key: {
        type: Sequelize.STRING(30)
      },
      value: {
        type: Sequelize.STRING(256)
      }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('AccountMeta');
  }
};
