import React from 'react';
import PropTypes from 'prop-types';

export const icons = [
    'user',
    'share',
    'chevron-up-circle',
    'chevron-down-circle',
    'chevron-left',
    'chatboxes',
    'chatbox',
    'close',
    'facebook',
    'twitter',
    'reddit',
    'linkedin',
    'link',
    'logo',
    'logotype',
    'clock',
    'extlink',
    'steem',
    'steempower',
    'ether',
    'bitcoin',
    'bitshares',
    'dropdown-arrow',
    'printer',
    'search',
    'menu',
    'voter',
    'voters',
    'empty',
    'flag1',
    'flag2',
    'reblog',
    'photo',
    'line',
    'video',
    'eye',
    'location',
    'calendar',
    'chain',
    'wallet',
    'cog',
    'quill',
    'key',
    'enter',
    'profile',
    'replies',
    'home',
    'reply',
    '100',
    'pencil2',
    'pin',
    'pin-disabled',
    'account-group',
    'account-heart',
    'account-settings-variant',
    'library-books',
    'wallet_2',
    'compass-outline',
    'currency-usd',
    'person',
    'pencil',
];
const icons_map = {};
for (const i of icons) icons_map[i] = require(`assets/icons/${i}.svg`);

const rem_sizes = {
    '0_8x': '0.8',
    '1x': '1.12',
    '1_5x': '1.5',
    '2x': '2',
    '3x': '3.45',
    '4x': '4.60',
    '5x': '5.75',
    '10x': '10.0',
};

export default class Icon extends React.Component {
    static propTypes = {
        name: PropTypes.string.isRequired,
        size: PropTypes.oneOf([
            '0_8x',
            '1x',
            '1_5x',
            '2x',
            '3x',
            '4x',
            '5x',
            '10x',
        ]),
        inverse: PropTypes.bool,
        className: PropTypes.string,
    };

    render() {
        const { name, size, className } = this.props;
        let classes = 'Icon ' + name;
        let style = {
            display: 'inline-block',
            width: `${rem_sizes['1x']}rem`,
            height: `${rem_sizes['1x']}rem`,
        };
        if (size) {
            classes += ' Icon_' + size;
            style = {
                display: 'inline-block',
                width: `${rem_sizes[size]}rem`,
                height: `${rem_sizes[size]}rem`,
            };
        }
        if (className) {
            classes += ' ' + className;
        }

        return (
            <span
                className={classes}
                style={style}
                dangerouslySetInnerHTML={{ __html: icons_map[name] }}
            />
        );
    }
}
