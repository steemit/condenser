import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

const images = new Map([
    ['facebook', require('app/assets/images/facebook.svg')],
    ['reddit', require('app/assets/images/reddit.svg')],
    ['golos', require('app/assets/images/golos.svg')],
]);

export default class SvgImage extends React.PureComponent {
    static propTypes = {
        name: PropTypes.oneOf([...images.keys()]),
        width: PropTypes.string.isRequired,
        height: PropTypes.string.isRequired,
        className: PropTypes.string,
    };
    render() {
        const { className, name, width, height } = this.props;

        return (
            <span
                className={cn('SvgImage', className)}
                style={{
                    display: 'inline-block',
                    width,
                    height,
                }}
                dangerouslySetInnerHTML={{ __html: images.get(name) }}
            />
        );
    }
}
