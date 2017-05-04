'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
      queryInterface.removeColumn('users', 'button_screen_x');
      queryInterface.removeColumn('users', 'button_screen_y');
      queryInterface.removeColumn('users', 'link_clicked');
      queryInterface.removeColumn('users', 'last_step');
      queryInterface.removeColumn('users', 'to_be_created');
      queryInterface.removeColumn('accounts', 'to_be_created');
      queryInterface.removeColumn('accounts', 'created');
      queryInterface.removeColumn('identities', 'email_code');
      queryInterface.removeColumn('identities', 'email_verified');
      queryInterface.removeColumn('identities', 'button_screen_x');
      queryInterface.removeColumn('identities', 'button_screen_y');
      queryInterface.removeColumn('identities', 'last_step');

      queryInterface.addColumn('accounts', 'created',
          {
              type: Sequelize.BOOLEAN
          }
      );
  },

  down: function (queryInterface, Sequelize) {
  }
};
