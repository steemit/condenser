'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('arecs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {type: Sequelize.INTEGER},
      uid: {type: Sequelize.STRING(32)},
      contact_email: {type: Sequelize.STRING(256)},
      account_name: {type: Sequelize.STRING(64)},
      provider: {type: Sequelize.STRING(64)},
      email_confirmation_code: {type: Sequelize.STRING(64)},
      validation_code: {type: Sequelize.STRING(64)},
      request_submitted_at: {type: Sequelize.DATE},
      owner_key: {
        type: Sequelize.STRING
      },
      old_owner_key: {
        type: Sequelize.STRING
      },
      new_owner_key: {
        type: Sequelize.STRING
      },
      remote_ip: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }).then(function () {
      queryInterface.addIndex('arecs', ['user_id']);
      queryInterface.addIndex('arecs', ['uid']);
      queryInterface.addIndex('arecs', ['account_name']);
      queryInterface.addIndex('arecs', ['contact_email']);
    });
  },

  down: function (queryInterface, Sequelize) {

  }
};
