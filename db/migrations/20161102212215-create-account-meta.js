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
      accname: {
        type: Sequelize.STRING,
      },
      k: {
        type: Sequelize.STRING
      },
      v: {
        type: Sequelize.STRING
      }
    }).then(function(){
      queryInterface.addIndex('ametas',  ['accname', 'k'], {
        indicesType: 'UNIQUE'
      })
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('AccountMeta');
  }
};
