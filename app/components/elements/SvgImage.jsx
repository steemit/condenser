import React from 'react';
import cn from 'classnames';

const images = new Map([
    ['facebook', require('app/assets/images/facebook.svg')],
    ['reddit', require('app/assets/images/reddit.svg')],
    ['golos', require('app/assets/images/golos.svg')],
]);

export default class SvgImage extends React.PureComponent {
    static propTypes = {
        name: React.PropTypes.oneOf([...images.keys()]),
        width: React.PropTypes.string.isRequired,
        height: React.PropTypes.string.isRequired,
        className: React.PropTypes.string,
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
