module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('accounts', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            user_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'cascade',
                onDelete: 'cascade'
            },
            name: {
                type: Sequelize.STRING
            },
            owner_key: {
                type: Sequelize.STRING
            },
            active_key: {
                type: Sequelize.STRING
            },
            posting_key: {
                type: Sequelize.STRING
            },
            memo_key: {
                type: Sequelize.STRING
            },
            referrer: {
                type: Sequelize.STRING
            },
            refcode: {
                type: Sequelize.STRING
            },
            remote_ip: {
                type: Sequelize.STRING
            },
            ignored: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
                allowNull: false
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
            queryInterface.addIndex('accounts', ['name'], {indicesType: 'UNIQUE'});
            queryInterface.addIndex('accounts', ['owner_key']);
            queryInterface.addIndex('accounts', ['active_key']);
            queryInterface.addIndex('accounts', ['posting_key']);
            queryInterface.addIndex('accounts', ['memo_key']);
        });
    },
    down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable('accounts');
    }
};
