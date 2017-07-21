'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn('users', 'settings', Sequelize.TEXT);
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.removeColumn('users', 'settings');
  }
};
