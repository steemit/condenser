module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('users', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            name: {
                type: Sequelize.STRING
            },
            email: {
                type: Sequelize.STRING,
            },
            uid: {
                type: Sequelize.STRING(64)
            },
            first_name: {
                type: Sequelize.STRING
            },
            last_name: {
                type: Sequelize.STRING
            },
            birthday: {
                type: Sequelize.DATE
            },
            gender: {
                type: Sequelize.STRING(8)
            },
            picture_small: {
                type: Sequelize.STRING
            },
            picture_large: {
                type: Sequelize.STRING
            },
            location_id: {
                type: Sequelize.BIGINT.UNSIGNED
            },
            location_name: {
                type: Sequelize.STRING
            },
            locale: {
                type: Sequelize.STRING(12)
            },
            timezone: {
                type: Sequelize.INTEGER
            },
            verified: {
                type: Sequelize.BOOLEAN
            },
            bot: {
                type: Sequelize.BOOLEAN
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
            queryInterface.addIndex('users', ['email']);
            queryInterface.addIndex('users', ['uid'], {indicesType: 'UNIQUE'});
        });
    },
    down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable('users');
    }
};
