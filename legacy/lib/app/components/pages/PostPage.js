'use strict';

var _Post = require('app/components/pages/Post');

var _Post2 = _interopRequireDefault(_Post);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
    path: '/(:category/)@:username/:slug',
    component: _Post2.default
};