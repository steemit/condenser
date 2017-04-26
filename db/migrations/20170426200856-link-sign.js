'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
      queryInterface.addColumn('identities', 'link_clicked', Sequelize.STRING);
      queryInterface.addColumn('accounts', 'approved', Sequelize.BOOLEAN);
  },

  down: function (queryInterface, Sequelize) {
      queryInterface.removeColumn('identities', 'link_clicked');
      queryInterface.removeColumn('accounts', 'approved');
  }
};
