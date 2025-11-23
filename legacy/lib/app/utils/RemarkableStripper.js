'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _remarkable = require('remarkable');

var _remarkable2 = _interopRequireDefault(_remarkable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var remarkable = new _remarkable2.default();
exports.default = remarkable;

/** Removes all markdown leaving just plain text */

var remarkableStripper = function remarkableStripper(md) {
    md.renderer.render = function (tokens, options, env) {
        var str = '';
        for (var i = 0; i < tokens.length; i++) {
            if (tokens[i].type === 'inline') {
                str += md.renderer.render(tokens[i].children, options, env);
            } else {
                // console.log('content', tokens[i])
                var content = tokens[i].content;
                str += (content || '') + ' ';
            }
        }
        return str;
    };
};

remarkable.use(remarkableStripper); // removes all markdown