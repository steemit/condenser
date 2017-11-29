'use strict';
module.exports = function(sequelize, DataTypes) {
  var web_events = sequelize.define('web_events', {
    event_type: DataTypes.STRING,
    value: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return web_events;
};