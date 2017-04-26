'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
      queryInterface.addColumn('identities', 'button_screen_x', Sequelize.STRING);
      queryInterface.addColumn('identities', 'button_screen_y', Sequelize.STRING);
  },

  down: function (queryInterface, Sequelize) {
      queryInterface.removeColumn('identities', 'button_screen_x', Sequelize.STRING);
      queryInterface.removeColumn('identities', 'button_screen_y', Sequelize.STRING);
  }
};
