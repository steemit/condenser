'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
      queryInterface.addColumn('identities', 'email_verified', Sequelize.BOOLEAN);
  },

  down: function (queryInterface, Sequelize) {
      queryInterface.removeColumn('identities', 'email_verified', Sequelize.BOOLEAN);
  }
};
