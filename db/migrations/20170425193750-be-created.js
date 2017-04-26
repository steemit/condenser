'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
      queryInterface.addColumn('accounts', 'to_be_created', Sequelize.BOOLEAN);
  },

  down: function (queryInterface, Sequelize) {
      queryInterface.removeColumn('accounts', 'to_be_created', Sequelize.BOOLEAN);
  }
};
