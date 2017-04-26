'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
      queryInterface.addColumn('users', 'browser', Sequelize.STRING);
      queryInterface.addColumn('users', 'link_clicked', Sequelize.STRING);
      queryInterface.addColumn('users', 'last_step', Sequelize.INTEGER);
      queryInterface.addColumn('users', 'approved', Sequelize.BOOLEAN);
      queryInterface.addColumn('users', 'to_be_created', Sequelize.BOOLEAN);
      queryInterface.addColumn('users', 'button_screen_x', Sequelize.STRING);
      queryInterface.addColumn('users', 'button_screen_y', Sequelize.STRING);
  },

  down: function (queryInterface, Sequelize) {
      queryInterface.removeColumn('users', 'browser');
      queryInterface.removeColumn('users', 'link_clicked');
      queryInterface.removeColumn('users', 'last_step');
      queryInterface.removeColumn('users', 'approved');
      queryInterface.removeColumn('users', 'to_be_created');
      queryInterface.removeColumn('users', 'button_screen_x');
      queryInterface.removeColumn('users', 'button_screen_y');
  }
};
