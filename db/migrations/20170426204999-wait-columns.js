'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
      queryInterface.removeColumn('accounts', 'created');
      queryInterface.addColumn('accounts', 'created',
          {
              type: Sequelize.BOOLEAN
          }
      );
  },

  down: function (queryInterface, Sequelize) {
  }
};
