'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
      queryInterface.addColumn('accounts', 'created',
          {
              type: Sequelize.BOOLEAN
          }
      );
  },

  down: function (queryInterface, Sequelize) {
  }
};
