'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
      queryInterface.addColumn('identities', 'email_code', Sequelize.STRING);
  },

  down: function (queryInterface, Sequelize) {
      queryInterface.removeColumn('identities', 'email_code', Sequelize.STRING);
  }
};
