'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Role = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _class, _temp;

exports.ifHive = ifHive;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Role = exports.Role = (_temp = _class = function Role() {
    (0, _classCallCheck3.default)(this, Role);
}, _class.LEVELS = ['muted', 'guest', 'member', 'mod', 'admin', 'owner'], _class.level = function (role) {
    if (!role) throw 'empty role provided';
    var level = Role.LEVELS.indexOf(role);
    if (level == -1) throw 'invalid role: ' + role;
    return level;
}, _class.atLeast = function (role, target) {
    return Role.level(role) >= Role.level(target);
}, _class.canPost = function (name, role) {
    if (!name) return true;
    // journal/council restriction: only members can post
    var minRole = Role.parseType(name) == 1 ? 'guest' : 'member';
    return Role.atLeast(role, minRole);
}, _class.canComment = function (name, role) {
    if (!name) return true;
    // council restriction: only members can comment
    var minRole = Role.parseType(name) == 3 ? 'member' : 'guest';
    return Role.atLeast(role, minRole);
}, _class.parseType = function (name) {
    return parseInt(name[5]);
}, _temp);
function ifHive(category) {
    return category && category.substring(0, 5) == 'hive-' ? category : null;
}